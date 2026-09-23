'use client';

/* oxlint-disable nextjs/no-img-element -- Local WebP pairs are already encoded; native images preserve their exact framing and decoded crossfade. */

import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import type { Photograph } from '@/lib/photographs';
import { PhotographyLightbox } from '@/components/photography-lightbox';

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

export function PhotographyGallery({ photos, onActiveIndexChange }: { photos: Photograph[]; onActiveIndexChange?: (index: number) => void }) {
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const lastPointer = useRef(0);

  // Mouse clicks move the pointer immediately before focus, so a focus
  // that follows a recent pointer move is mouse-induced and must not pin
  // the ascii preview. Keyboard focus (no pointer) stays meaningful.
  useEffect(() => {
    const onMove = () => { lastPointer.current = Date.now(); };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    if (lightbox.open) return;
    onActiveIndexChange?.(hovered ?? focused ?? -1);
  }, [focused, hovered, lightbox.open, onActiveIndexChange]);

  return (
    <>
      <ol className="photography-grid">
        {photos.map((item, index) => <PhotoCard key={item.id} photo={item} index={index}
          onOpen={(trigger) => { returnFocus.current = trigger; setLightbox({ open: true, index }); }}
          onEnter={(kind) => {
            if (kind === 'focus' && Date.now() - lastPointer.current < 300) return;
            if (kind === 'focus') setFocused(index); else setHovered(index);
          }}
          onLeave={(kind) => kind === 'focus' ? setFocused(null) : setHovered(null)} />)}
      </ol>
      <Dialog.Root open={lightbox.open} onOpenChange={(open) => setLightbox((current) => ({ ...current, open }))}>
        <Dialog.Portal>
          <Dialog.Backdrop className="photography-lightbox-backdrop" />
          <PhotographyLightbox photos={photos} initialIndex={lightbox.index}
            onClose={() => setLightbox((current) => ({ ...current, open: false }))} returnFocus={returnFocus} />
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
