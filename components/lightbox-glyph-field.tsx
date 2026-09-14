'use client';

import { useLayoutEffect, useRef } from 'react';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789[]{}<>/\\:;*+#?!|';
const randomCharacter = () => CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

// Smooth value noise gives each glyph a local, continuous path, without a downward bias.
function noise(x: number, seed: number) {
  const lattice = (n: number) => {
    const value = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const cell = Math.floor(x);
  const fraction = x - cell;
  const blend = fraction * fraction * (3 - 2 * fraction);
  return lattice(cell) * (1 - blend) + lattice(cell + 1) * blend;
}

type Glyph = { x: number; y: number; born: number; life: number; changeAt: number; character: string; seed: number };

/** Decorative only. The loaded lightbox image is sampled once; no second image request. */
export function LightboxGlyphField({ image }: { image: HTMLImageElement }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !image.naturalWidth) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sample = document.createElement('canvas');
    const sampleWidth = 160;
    const sampleHeight = Math.max(1, Math.round(sampleWidth * image.naturalHeight / image.naturalWidth));
    sample.width = sampleWidth;
    sample.height = sampleHeight;
    const sampler = sample.getContext('2d', { willReadFrequently: true });
    if (!sampler) return;
    let pixels: Uint8ClampedArray;
    try {
      sampler.drawImage(image, 0, 0, sampleWidth, sampleHeight);
      pixels = sampler.getImageData(0, 0, sampleWidth, sampleHeight).data;
    } catch {
      // A failed/tainted sample should leave the photograph fully usable.
      return;
    }
    const luminance = new Float32Array(sampleWidth * sampleHeight);
    for (let i = 0; i < luminance.length; i++) {
      luminance[i] = (pixels[i * 4] * 0.2126 + pixels[i * 4 + 1] * 0.7152 + pixels[i * 4 + 2] * 0.0722) / 255;
    }
    const cumulative = new Float32Array(luminance.length);
    let total = 0;
    for (let y = 0; y < sampleHeight; y++) {
      for (let x = 0; x < sampleWidth; x++) {
        const i = y * sampleWidth + x;
        const light = luminance[i];
        const edge = Math.abs(light - luminance[y * sampleWidth + Math.min(x + 1, sampleWidth - 1)])
          + Math.abs(light - luminance[Math.min(y + 1, sampleHeight - 1) * sampleWidth + x]);
        total += 0.012 + Math.pow(light, 1.6) * 0.28 + Math.min(edge * 3.5, 1) * 0.85;
        cumulative[i] = total;
      }
    }
    const weightedPoint = () => {
      const target = Math.random() * total;
      let low = 0;
      let high = cumulative.length - 1;
      while (low < high) {
        const middle = (low + high) >>> 1;
        if (cumulative[middle] < target) low = middle + 1; else high = middle;
      }
      return { x: ((low % sampleWidth) + Math.random()) / sampleWidth, y: (Math.floor(low / sampleWidth) + Math.random()) / sampleHeight };
    };

    let width = 0;
    let height = 0;
    let glyphs: Glyph[] = [];
    let frame = 0;
    let lastDraw = -Infinity;
    const startedAt = performance.now();
    const makeGlyph = (x: number, y: number, born: number): Glyph => ({
      x, y, born, life: 0.5 + Math.random() * 0.5, changeAt: born + 0.08,
      character: randomCharacter(), seed: Math.random() * 1000,
    });
    const resize = () => {
      const rect = image.getBoundingClientRect();
      const parent = canvas.parentElement!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      Object.assign(canvas.style, { width: `${width}px`, height: `${height}px`, left: `${rect.left - parent.left}px`, top: `${rect.top - parent.top}px` });
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      frame = window.requestAnimationFrame(draw);
      if (now - lastDraw < 1000 / 30) return;
      lastDraw = now;
      context.clearRect(0, 0, width, height);
      glyphs = glyphs.filter((glyph) => elapsed - glyph.born < glyph.life);
      // Stop only after the last individual lifetime ends, never at a global cutoff.
      if (glyphs.length === 0) {
        cancelAnimationFrame(frame);
        canvas.hidden = true;
        frame = 0;
        return;
      }
      if (!width || !height) return;
      const fontSize = width < 500 ? 12 : 14;
      context.font = `500 ${fontSize}px "Google Sans Code", monospace`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = '#e5ff20';
      context.globalAlpha = 0.87;
      for (const glyph of glyphs) {
        const age = elapsed - glyph.born;
        if (age < 0) continue;
        if (elapsed >= glyph.changeAt) {
          glyph.character = randomCharacter();
          glyph.changeAt = elapsed + 0.075 + Math.random() * 0.13;
        }
        // Brief local gaps rather than a synchronized full-image flash.
        if (elapsed > 0.08 && noise(elapsed * 12, glyph.seed + 9) < 0.19) continue;
        context.fillText(glyph.character,
          clamp(glyph.x * width + (noise(elapsed * 0.8, glyph.seed) - 0.5) * 9, fontSize / 2, width - fontSize / 2),
          clamp(glyph.y * height + (noise(elapsed * 0.7, glyph.seed + 4) - 0.5) * 9, fontSize / 2, height - fontSize / 2));
      }
      context.globalAlpha = 1;
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      lastDraw = -Infinity;
      context.clearRect(0, 0, width, height);
      const elapsed = (performance.now() - startedAt) / 1000;
      const active = !reduced.matches && !document.hidden
        && glyphs.some((glyph) => elapsed < glyph.born + glyph.life);
      canvas.hidden = !active;
      if (active) draw(performance.now());
    };
    resize();
    // Seed once, before the decoded photograph's first visible paint. Expired
    // glyphs are never replaced, including after resize or a visibility change.
    const fontSize = width < 500 ? 12 : 14;
    const budget = Math.round(clamp(Math.round(width * height / 14000), 36, 72) * 0.5);
    if (width && height) while (glyphs.length < budget) {
      const point = weightedPoint();
      const chain = Math.random() < 0.18 ? 2 + Math.floor(Math.random() * 7) : 1;
      const count = Math.min(chain, budget - glyphs.length);
      const slant = Math.random() < 0.5 ? 0 : (Math.random() < 0.5 ? -0.45 : 0.45);
      for (let i = 0; i < count; i++) {
        glyphs.push(makeGlyph(clamp(point.x + i * slant * fontSize / width, 0.025, 0.975),
          clamp(point.y + i * fontSize * 1.1 / height, 0.025, 0.975), 0));
      }
    }
    const observer = new ResizeObserver(resize);
    observer.observe(image);
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [image]);

  return <canvas ref={canvasRef} className="photography-glyph-field" aria-hidden="true" />;
}
