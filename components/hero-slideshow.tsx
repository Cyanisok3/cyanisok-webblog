'use client';

import { useEffect, useState } from 'react';

const slides = [
  {
    src: '/resources/zibo.webp',
    alt: 'A wheat field in Zibo',
  },
  {
    src: '/resources/hainan.webp',
    alt: 'Soft tropical foliage in Hainan',
  },
  {
    src: '/resources/shanghai.webp',
    alt: 'City lights in Shanghai',
  },
  {
    src: '/resources/yantai.webp',
    alt: 'A city crowd in Yantai',
  },
  {
    src: '/resources/ningbo.webp',
    alt: 'A quiet horizon in Ningbo',
  },
  {
    src: '/resources/unnc.webp',
    alt: 'Grass and soft light at UNNC',
  },
];

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
  // page load fetches a single image instead of all six at once.
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
          <a href="#photography">Photography</a>
          <a href="/blog">Blog</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <div className="hero-title">
        <h1 id="site-title">@Cyanisok</h1>
        <p className="hero-intro">We interact with the world: we speak, we explore.</p>
      </div>
    </section>
  );
}
