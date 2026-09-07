'use client';

import { useEffect, useState } from 'react';
import { heroPhotographs } from '@/lib/photographs';

const slides = heroPhotographs.map((photo) => ({ src: photo.monoSrc, alt: photo.alt }));

export function HeroSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      6200,
    );
    return () => window.clearInterval(timer);
  }, []);

  // Mount only the current slide and preload the next one, so the initial
  // page load avoids fetching the complete archive at once.
  const next = (active + 1) % slides.length;

  return (
    <section className="hero" aria-labelledby="site-title">
      <div className="hero-images" aria-live="off">
        {slides.map((slide, index) => (
          <img
            key={slide.src}
            className={`hero-image ${index === active ? 'is-active' : ''}`}
            src={index === active || index === next ? slide.src : undefined}
            alt={index === active ? slide.alt : ''}
            aria-hidden={index !== active}
            decoding="async"
            fetchPriority={index === active ? 'high' : 'auto'}
          />
        ))}
      </div>
      <div className="hero-shade" />

      <header className="hero-header">
        <span className="edition-link">
          Chat With Me <span aria-hidden="true">→</span>
        </span>
        <nav aria-label="Primary navigation">
          <a href="/photography">Photography</a>
          <a href="/blog">Blog</a>
          <a href="/">About</a>
        </nav>
      </header>

      <div className="hero-title">
        <h1 id="site-title">@Cyanisok</h1>
        <p className="hero-intro">We interact with the world: we speak, we explore.</p>
      </div>
    </section>
  );
}
