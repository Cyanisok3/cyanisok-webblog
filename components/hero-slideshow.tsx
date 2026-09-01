'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const slides = [
  {
    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2200&q=88',
    alt: 'Mountain peaks beneath a star-filled sky',
  },
  {
    src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2200&q=88',
    alt: 'A mountain lake and distant ridgeline',
  },
  {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=88',
    alt: 'Soft light across a mountain landscape',
  },
];

export function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const activeRef = useRef(0);

  const transitionTo = useCallback((nextIndex: number) => {
    if (nextIndex === activeRef.current) return;
    activeRef.current = nextIndex;
    setActive(nextIndex);
    setFlashKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(
      () => transitionTo((activeRef.current + 1) % slides.length),
      6200,
    );
    return () => window.clearInterval(timer);
  }, [transitionTo]);

  return (
    <section className="hero" aria-labelledby="site-title">
      <div className="hero-images" aria-live="off">
        {slides.map((slide, index) => (
          <img
            key={slide.src}
            className={`hero-image ${index === active ? 'is-active' : ''}`}
            src={slide.src}
            alt={index === active ? slide.alt : ''}
            aria-hidden={index !== active}
          />
        ))}
      </div>
      <div className="hero-shade" />
      <div
        key={flashKey}
        className={`hero-flash ${flashKey ? 'is-active' : ''}`}
        aria-hidden="true"
      />

      <header className="hero-header">
        <span className="edition-link">
          Chat With Me <span aria-hidden="true">→</span>
        </span>
        <nav aria-label="Primary navigation">
          <a href="#photography">Photography</a>
          <a href="/writing">Writing</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <div className="hero-title">
        <h1 id="site-title">@Cyanisok</h1>
        <p className="hero-intro">We interact with the world: we speak, we explore.</p>
      </div>

      <div className="hero-controls" aria-label="Choose hero image">
        {slides.map((_, index) => (
          <button
            key={index}
            className={index === active ? 'is-active' : ''}
            type="button"
            onClick={() => transitionTo(index)}
            aria-label={`Show image ${index + 1}`}
            aria-current={index === active ? 'true' : undefined}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
