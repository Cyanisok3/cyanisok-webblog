'use client';

/* oxlint-disable nextjs/no-img-element -- These are the original local WebP photographs. */

import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { Dialog } from '@base-ui/react/dialog';
import type { Photograph } from '@/lib/photographs';
import { photographyDiaries, photographyDiariesZh, photographyTitlesZh } from '@/lib/photography-diaries';
import { LightboxGlyphField } from '@/components/lightbox-glyph-field';

const glyphPhotoIds = new Set(['zibo', 'the_north_bund', 'sanya', 'unnc']);
let closeHintSeen = false;

function LightboxImage({ photo, active, closeHint }: { photo: Photograph; active: boolean; closeHint: boolean }) {
  const [colorFailed, setColorFailed] = useState(false);
  const [monoFailed, setMonoFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [presented, setPresented] = useState(false);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const size = colorFailed ? photo.monoSize : photo.colorSize;
  const source = colorFailed ? photo.monoSrc : photo.colorSrc;

  useEffect(() => {
    if (!ready) return;
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260;
    const timer = window.setTimeout(() => setPresented(true), delay);
    return () => window.clearTimeout(timer);
  }, [ready, source]);

  function failed(image: HTMLImageElement) {
    if (imageRef.current !== image) return;
    setReady(false);
    setPresented(false);
    setLoadedImage(null);
    if (colorFailed) setMonoFailed(true); else setColorFailed(true);
  }

  return (
    <span className="photography-lightbox-image">
      {!monoFailed && <img key={source} ref={imageRef} src={source} alt=""
        width={size.width} height={size.height} loading={active ? 'eager' : 'lazy'} decoding="async"
        className={ready ? 'is-ready' : ''}
        onLoad={async (event) => {
          const image = event.currentTarget;
          try {
            await image.decode();
            if (imageRef.current !== image) return;
            setLoadedImage(image);
            setReady(true);
          } catch { failed(image); }
        }} onError={(event) => failed(event.currentTarget)} />}
      {active && glyphPhotoIds.has(photo.id) && ready && loadedImage && <LightboxGlyphField image={loadedImage} />}
      {!presented && <output className={`photography-loading${ready ? ' is-leaving' : ''}`}>
        {monoFailed ? 'This photograph could not be loaded.' : 'Loading photograph…'}
      </output>}
      {colorFailed && !monoFailed && <output className="photography-fallback">Color version unavailable — showing monochrome.</output>}
      {presented && closeHint && <span className="photography-close-hint">CLICK PHOTO TO CLOSE</span>}
    </span>
  );
}

const DiaryCopy = forwardRef<HTMLDivElement, { entry: string; duration: number; language: 'en' | 'zh' }>(function DiaryCopy({ entry, duration, language }, ref) {
  const present = useIsPresent();
  const sections = entry.trim().split(/\r?\n(?:[ \t]*\r?\n)+/);
  return <motion.div ref={ref} className="photography-diary-copy" lang={language === 'zh' ? 'zh-CN' : 'en'} aria-hidden={!present}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration, ease: 'linear' }}>
    {sections.map((section, sectionIndex) => <div className="photography-diary-section" key={sectionIndex}>
      {section.split(/\r?\n/).map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
    </div>)}
  </motion.div>;
});

function PhotoDiary({ photo, index, photos, onSelect, initialFocus, scrollPositions, onPositionChange }: {
  photo: Photograph;
  index: number;
  photos: Photograph[];
  onSelect: (index: number) => void;
  initialFocus: React.RefObject<HTMLButtonElement | null>;
  scrollPositions: React.RefObject<Record<string, number>>;
  onPositionChange: (photoId: string, scrollTop: number) => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [hasMore, setHasMore] = useState(false);
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : 0.25;
  const entry = (language === 'zh' ? photographyDiariesZh : photographyDiaries)[photo.id];
  const title = language === 'zh' ? photographyTitlesZh[photo.id] ?? photo.title : photo.title;
  const entryKey = `${photo.id}:${language}`;

  const checkOverflow = useCallback(() => {
    const body = bodyRef.current;
    setHasMore(Boolean(body && body.scrollTop + body.clientHeight < body.scrollHeight - 2));
  }, []);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.scrollTop = scrollPositions.current[entryKey] ?? 0;
    const frame = window.requestAnimationFrame(checkOverflow);
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(body);
    const contentObserver = new MutationObserver(checkOverflow);
    contentObserver.observe(body, { childList: true, subtree: true });
    return () => { window.cancelAnimationFrame(frame); observer.disconnect(); contentObserver.disconnect(); };
  }, [entryKey, checkOverflow, scrollPositions]);

  return (
    <aside className="photography-lightbox-editorial">
      <div className="photography-lightbox-heading">
        <p>PHOTOGRAPHY | DIARY</p>
        <Dialog.Title className="sr-only" lang={language === 'zh' ? 'zh-CN' : 'en'}>{title}</Dialog.Title>
        <div className="photography-diary-title" aria-hidden="true">
          {photos.map((item) => <h2 key={item.id} className="photography-diary-title-size" lang="en">{item.title}</h2>)}
          {photos.map((item) => <h2 key={`${item.id}:zh`} className="photography-diary-title-size" lang="zh-CN">{photographyTitlesZh[item.id] ?? item.title}</h2>)}
          <AnimatePresence initial={false}>
            <motion.h2 key={entryKey} lang={language === 'zh' ? 'zh-CN' : 'en'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration, ease: 'linear' }}>{title}</motion.h2>
          </AnimatePresence>
        </div>
      </div>
      <div ref={bodyRef} className={`photography-diary${hasMore ? ' has-more' : ''}`}
        onScroll={() => {
          if (bodyRef.current) onPositionChange(entryKey, bodyRef.current.scrollTop);
          checkOverflow();
        }} tabIndex={entry ? 0 : -1} role={entry ? 'region' : undefined}
        aria-label={entry ? `${title} diary, scroll to read` : undefined}>
        <div className="photography-diary-text">
          <AnimatePresence initial={false}>
            {entry && <DiaryCopy key={entryKey} entry={entry} duration={duration} language={language} />}
          </AnimatePresence>
        </div>
      </div>
      <nav className="photography-lightbox-index" aria-label="Photograph index">
        {Array.from({ length: photos.length }, (_, position) => (
          <button key={position} ref={position === index ? initialFocus : undefined}
            type="button" data-current={position === index}
            aria-current={position === index ? 'true' : undefined}
            aria-label={`Photograph ${String(position + 1).padStart(2, '0')}`}
            onClick={() => onSelect(position)}>
            {String(position + 1).padStart(2, '0')}
          </button>
        ))}
      </nav>
      <div className="photography-lightbox-bottom">
        <span>SCROLL TO EXPLORE</span>
        <div className="photography-lightbox-language">
          <button type="button" lang={language === 'en' ? 'zh-CN' : 'en'}
            onClick={() => setLanguage((current) => current === 'en' ? 'zh' : 'en')}>
            {language === 'en' ? '显示中文' : 'English ver.'}
          </button>
        </div>
      </div>
    </aside>
  );
}

export function PhotographyLightbox({ photos, initialIndex, onClose, returnFocus }: {
  photos: Photograph[];
  initialIndex: number;
  onClose: () => void;
  returnFocus: React.RefObject<HTMLButtonElement | null>;
}) {
  const [active, setActive] = useState(initialIndex);
  const [activeSlide, setActiveSlide] = useState(photos.length + initialIndex);
  const [showCloseHint, setShowCloseHint] = useState(!closeHintSeen);
  const railRef = useRef<HTMLDivElement>(null);
  const indexFocus = useRef<HTMLButtonElement>(null);
  const diaryPositions = useRef<Record<string, number>>({});
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activePosition = useRef(photos.length + initialIndex);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const pointerMoved = useRef(false);
  const settling = useRef<number | null>(null);
  const slides = [...photos, ...photos, ...photos];

  const scrollToPosition = useCallback((position: number, smooth: boolean) => {
    const rail = railRef.current;
    const item = itemRefs.current[position];
    if (!rail || !item) return;
    rail.scrollTo({
      top: item.offsetTop - rail.offsetTop - (rail.clientHeight - item.clientHeight) / 2,
      behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant',
    });
  }, []);

  useLayoutEffect(() => {
    scrollToPosition(photos.length + initialIndex, false);
    if (railRef.current) railRef.current.dataset.positioned = 'true';
  }, [initialIndex, photos.length, scrollToPosition]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(() => scrollToPosition(activePosition.current, false));
    observer.observe(rail);
    return () => observer.disconnect();
  }, [scrollToPosition]);

  useEffect(() => () => { if (settling.current !== null) window.clearTimeout(settling.current); }, []);

  useEffect(() => {
    if (!showCloseHint) return;
    closeHintSeen = true;
    const timer = window.setTimeout(() => setShowCloseHint(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showCloseHint]);

  function nearestPosition() {
    const rail = railRef.current;
    if (!rail) return activePosition.current;
    const center = rail.scrollTop + rail.offsetTop + rail.clientHeight / 2;
    let nearest = activePosition.current;
    let distance = Infinity;
    for (let i = 0; i < itemRefs.current.length; i++) {
      const item = itemRefs.current[i];
      if (!item) continue;
      const delta = Math.abs(item.offsetTop + item.clientHeight / 2 - center);
      if (delta < distance) { nearest = i; distance = delta; }
    }
    return nearest;
  }

  function onRailScroll() {
    const position = nearestPosition();
    activePosition.current = position;
    setActiveSlide(position);
    setActive(position % photos.length);
    if (settling.current !== null) window.clearTimeout(settling.current);
    settling.current = window.setTimeout(() => {
      const rail = railRef.current;
      const first = itemRefs.current[0];
      const repeat = itemRefs.current[photos.length];
      if (!rail || !first || !repeat) return;
      const shift = repeat.offsetTop - first.offsetTop;
      const current = nearestPosition();
      if (current < 4) {
        rail.scrollTop += shift;
        activePosition.current = current + photos.length;
        setActiveSlide(activePosition.current);
      } else if (current >= photos.length * 3 - 4) {
        rail.scrollTop -= shift;
        activePosition.current = current - photos.length;
        setActiveSlide(activePosition.current);
      }
    }, 120);
  }

  function goTo(index: number) {
    const current = activePosition.current;
    const candidates = itemRefs.current.flatMap((item, position) => item && position % photos.length === index ? [position] : []);
    const target = candidates.reduce((best, position) =>
      Math.abs(position - current) < Math.abs(best - current) ? position : best, candidates[0]);
    if (target !== undefined) scrollToPosition(target, true);
  }

  function step(direction: number) { goTo((active + direction + photos.length) % photos.length); }

  return (
    <Dialog.Popup className="photography-lightbox" initialFocus={indexFocus} finalFocus={returnFocus}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
        if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') &&
          !(event.target instanceof HTMLElement && event.target.closest('.photography-diary'))) {
          event.preventDefault();
          step(event.key === 'ArrowUp' ? -1 : 1);
        }
      }}>
      <Dialog.Description className="sr-only">
        Scroll the photographs to browse. The current photograph closes the lightbox when clicked; neighboring photographs switch to them. Press Escape to close.
      </Dialog.Description>
      <div className="photography-lightbox-editorial-wrap">
        <PhotoDiary photo={photos[active]} index={active} photos={photos}
          onSelect={goTo} initialFocus={indexFocus} scrollPositions={diaryPositions}
          onPositionChange={(id, scrollTop) => { diaryPositions.current[id] = scrollTop; }} />
      </div>
      <section ref={railRef} className="photography-lightbox-rail"
        aria-label="Continuous photograph gallery" onScroll={onRailScroll}>
        <div className="photography-lightbox-film">
          {slides.map((photo, position) => {
            const index = position % photos.length;
            const isCurrent = position === activeSlide;
            return <button key={`${photo.id}-${position}`} ref={(node) => { itemRefs.current[position] = node; }}
              type="button" tabIndex={-1} className="photography-lightbox-frame"
              aria-hidden={Math.abs(position - activeSlide) > 1}
              aria-label={`${photo.title}. ${isCurrent ? 'Click to close' : 'Click to view this photograph'}`}
              onPointerDown={(event) => {
                pointerStart.current = { x: event.clientX, y: event.clientY };
                pointerMoved.current = false;
              }}
              onPointerMove={(event) => {
                if (pointerStart.current && Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y) > 8) pointerMoved.current = true;
              }}
              onClick={() => {
                if (pointerMoved.current) { pointerMoved.current = false; return; }
                if (index === active) onClose(); else scrollToPosition(position, true);
              }}>
              <LightboxImage photo={photo} active={isCurrent} closeHint={isCurrent && showCloseHint} />
            </button>;
          })}
        </div>
      </section>
    </Dialog.Popup>
  );
}
