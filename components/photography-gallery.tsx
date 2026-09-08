'use client';

/* oxlint-disable nextjs/no-img-element -- Local WebP pairs are already encoded; native images preserve their exact framing and decoded crossfade. */

import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import type { Photograph } from '@/lib/photographs';

function PhotoCard({ photo, index, onOpen, onEnter, onLeave }: {
  photo: Photograph;
  index: number;
  onOpen: (trigger: HTMLButtonElement) => void;
  onEnter: (kind: 'focus' | 'hover') => void;
  onLeave: (kind: 'focus' | 'hover') => void;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [near, setNear] = useState(false);
  const [colorReady, setColorReady] = useState(false);
  const [monoFailed, setMonoFailed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = trigger.current;
    if (!node) return;
    if (typeof IntersectionObserver !== 'function') {
      const frame = window.requestAnimationFrame(() => setNear(true));
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); observer.disconnect(); }
    }, { rootMargin: '320px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = trigger.current;
    if (!node) return;
    if (typeof IntersectionObserver !== 'function') {
      const frame = window.requestAnimationFrame(() => {
        setVisible(true);
      });
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <li className="photography-item">
      <button ref={trigger} className={`photography-card${visible ? ' is-visible' : ''}`} type="button"
        aria-label={`View ${photo.title}, photograph ${index + 1}`}
        aria-haspopup="dialog" onClick={(event) => onOpen(event.currentTarget)}
        onMouseEnter={() => onEnter('hover')} onMouseLeave={() => onLeave('hover')}
        onFocus={() => onEnter('focus')} onBlur={() => onLeave('focus')}>
        <span className="photography-image-pair" style={{ aspectRatio: `${photo.monoSize.width} / ${photo.monoSize.height}` }}>
          {monoFailed ? <span className="photography-image-error">{photo.title}<br />Preview unavailable</span> : (
            <img className="photography-mono" src={photo.monoSrc} alt={photo.alt}
              ref={(image) => {
                // A server-rendered image can fail before React attaches onError.
                if (image?.complete && image.naturalWidth === 0) setMonoFailed(true);
              }}
              width={photo.monoSize.width} height={photo.monoSize.height}
              loading={index < 3 ? 'eager' : 'lazy'} decoding="async" onError={() => setMonoFailed(true)} />
          )}
          {near && <img className={`photography-color${colorReady ? ' is-ready' : ''}`}
            src={photo.colorSrc} alt="" aria-hidden="true" decoding="async"
            width={photo.colorSize.width} height={photo.colorSize.height}
            onLoad={async (event) => {
              const image = event.currentTarget;
              try { await image.decode(); setColorReady(true); } catch { setColorReady(false); }
            }} onError={() => setColorReady(false)} />}
        </span>
        <span className="photography-caption"><span>{String(index + 1).padStart(2, '0')} / {photo.title}</span><span className="photography-open" aria-hidden="true">↗</span></span>
      </button>
    </li>
  );
}

function LightboxImage({ photo }: { photo: Photograph }) {
  const [colorFailed, setColorFailed] = useState(false);
  const [monoFailed, setMonoFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const size = colorFailed ? photo.monoSize : photo.colorSize;
  return (
    <>
      {!monoFailed && <img src={colorFailed ? photo.monoSrc : photo.colorSrc} alt={photo.alt}
        width={size.width} height={size.height} className={ready ? 'is-ready' : ''}
        onLoad={() => setReady(true)} onError={() => {
          setReady(false);
          if (colorFailed) setMonoFailed(true); else setColorFailed(true);
        }} />}
      {!ready && <output className="photography-loading">{monoFailed ? 'This photograph could not be loaded.' : 'Loading photograph…'}</output>}
      {colorFailed && !monoFailed && <output className="photography-fallback">Color version unavailable — showing monochrome.</output>}
    </>
  );
}

export function PhotographyGallery({ photos, onActiveIndexChange }: { photos: Photograph[]; onActiveIndexChange?: (index: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const lastPointer = useRef(0);
  const photo = selected === null ? null : photos[selected];

  // Mouse clicks move the pointer immediately before focus, so a focus
  // that follows a recent pointer move is mouse-induced and must not pin
  // the ascii preview. Keyboard focus (no pointer) stays meaningful.
  useEffect(() => {
    const onMove = () => { lastPointer.current = Date.now(); };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    if (selected !== null) return;
    onActiveIndexChange?.(hovered ?? focused ?? -1);
  }, [focused, hovered, onActiveIndexChange, selected]);

  function step(direction: number) {
    setSelected((current) => current === null ? null : Math.min(photos.length - 1, Math.max(0, current + direction)));
  }

  return (
    <>
      <ol className="photography-grid">
        {photos.map((item, index) => <PhotoCard key={item.id} photo={item} index={index}
          onOpen={(trigger) => { returnFocus.current = trigger; setSelected(index); }}
          onEnter={(kind) => {
            if (kind === 'focus' && Date.now() - lastPointer.current < 300) return;
            kind === 'focus' ? setFocused(index) : setHovered(index);
          }}
          onLeave={(kind) => kind === 'focus' ? setFocused(null) : setHovered(null)} />)}
      </ol>
      <Dialog.Root open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <Dialog.Portal>
          <Dialog.Backdrop className="photography-lightbox-backdrop" />
          <Dialog.Popup className="photography-lightbox" initialFocus={closeButton} finalFocus={returnFocus}
            onKeyDown={(event) => {
              if (event.altKey || event.ctrlKey || event.metaKey) return;
              if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
              if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
            }}>
            <header className="photography-lightbox-header">
              <Dialog.Title>{photo?.title ?? 'Photograph'}</Dialog.Title>
              <Dialog.Close ref={closeButton} className="photography-lightbox-close" aria-label="Close photograph"><span className="photography-lightbox-close-label">Close</span> <span aria-hidden="true">×</span></Dialog.Close>
            </header>
            <Dialog.Description className="sr-only">Full color photograph. Use the left and right arrow keys to browse, or Escape to close.</Dialog.Description>
            <div className="photography-lightbox-stage">
              <Dialog.Close className="photography-lightbox-dismiss" tabIndex={-1} aria-label="Close photograph background" />
              {photo && <LightboxImage key={photo.id} photo={photo} />}
            </div>
            <footer className="photography-lightbox-controls">
              <button type="button" onClick={() => step(-1)} disabled={selected === null || selected === 0} aria-label="Previous photograph">← <span>Previous</span></button>
              <p aria-live="polite" aria-atomic="true">{String((selected ?? 0) + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}<span>{photo?.title}</span></p>
              <button type="button" onClick={() => step(1)} disabled={selected === null || selected === photos.length - 1} aria-label="Next photograph"><span>Next</span> →</button>
            </footer>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
