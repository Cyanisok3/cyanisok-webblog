'use client';

import { useEffect, useState } from 'react';

const slides = [
  {
    src: '/resources/zibo.JPG',
    alt: 'A wheat field in Zibo',
  },
  {
    src: '/resources/hainan.JPG',
    alt: 'Soft tropical foliage in Hainan',
  },
  {
    src: '/resources/shanghai.JPG',
    alt: 'City lights in Shanghai',
  },
  {
    src: '/resources/yantai.JPG',
    alt: 'A city crowd in Yantai',
  },
  {
    src: '/resources/ningbo.JPG',
    alt: 'A quiet horizon in Ningbo',
  },
  {
    src: '/resources/unnc.JPG',
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
    </section>
  );
}
