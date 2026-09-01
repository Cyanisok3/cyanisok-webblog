'use client';

import { useEffect, useState } from 'react';

const slides = [
  {
    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2200&q=88',
    alt: '云雾笼罩的山脉',
  },
  {
    src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2200&q=88',
    alt: '湖泊与远山',
  },
  {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=88',
    alt: '自然中的微光',
  },
];

type HeroSlideshowProps = {
  latestTitle: string;
  latestSlug: string;
};

export function HeroSlideshow({ latestTitle, latestSlug }: HeroSlideshowProps) {
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
        <a className="edition-link" href={`/writing/${latestSlug}`}>
          Latest · {latestTitle} <span aria-hidden="true">↗</span>
        </a>
        <nav aria-label="主导航">
          <a href="#photography">Photography</a>
          <a href="/writing">Writing</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <div className="hero-title">
        <p className="eyebrow">Cyan Liu · Personal archive</p>
        <h1 id="site-title">微光志</h1>
        <p className="hero-intro">
          在城市、旅途与日常之间，记录我看见的光。
          <br />
          Writing about systems, agents, and ways of seeing.
        </p>
      </div>

      <div className="hero-controls" aria-label="切换首图">
        {slides.map((_, index) => (
          <button
            key={index}
            className={index === active ? 'is-active' : ''}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`显示第 ${index + 1} 张照片`}
            aria-current={index === active ? 'true' : undefined}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
