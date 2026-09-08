'use client';

import { useCallback, useRef, useState } from 'react';
import { photoAscii } from '@/lib/photo-ascii';
import type { Photograph } from '@/lib/photographs';
import { PhotographyGallery } from '@/components/photography-gallery';

function AsciiPreview({ photo, index, previous }: { photo: Photograph; index: number; previous: Photograph | null }) {
  return (
    <div className="photography-ascii-preview">
      <div className="photography-ascii-stage" aria-hidden="true">
        {previous ? <pre className="is-leaving">{photoAscii[previous.id]}</pre> : null}
        <pre key={photo.id} className="is-entering">{photoAscii[photo.id]}</pre>
      </div>
      <p>{String(index + 1).padStart(2, '0')} / {photo.title}</p>
    </div>
  );
}

export function PhotographyArchive({ photos }: { photos: Photograph[] }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const activeIndexRef = useRef(-1);
  const clearPrevious = useRef<number | null>(null);
  const active = activeIndex === -1 ? null : photos[activeIndex] ?? null;
  const previous = previousIndex === null || previousIndex === -1 ? null : photos[previousIndex] ?? null;
  const handleActiveIndexChange = useCallback((next: number) => {
    if (activeIndexRef.current === next) return;
    setPreviousIndex(activeIndexRef.current === -1 ? null : activeIndexRef.current);
    activeIndexRef.current = next;
    setActiveIndex(next);
    if (clearPrevious.current) window.clearTimeout(clearPrevious.current);
    clearPrevious.current = window.setTimeout(() => setPreviousIndex(null), 190);
  }, []);

  return (
    <section className="photography-archive" aria-label="Selected photographs">
      <aside className="photography-notes" aria-label="Archive notes">
        <p className="photography-intro">Places, passing light,<br />and the days in between.</p>
        <div className="photography-index">
          <p>Index <span>{String(photos.length).padStart(2, '0')} photographs</span></p>
          <ul>{photos.map((photo) => <li key={photo.id}>{photo.title}</li>)}</ul>
        </div>
        {active ? <AsciiPreview photo={active} index={activeIndex} previous={previous} /> : null}
        <p className="photography-afterword">We interact with the world.<br />We look a little longer.</p>
      </aside>
      <PhotographyGallery photos={photos} onActiveIndexChange={handleActiveIndexChange} />
    </section>
  );
}
