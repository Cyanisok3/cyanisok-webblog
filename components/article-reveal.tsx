'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function ArticleReveal({ children, as: Element = 'div', className, label }: {
  children: ReactNode;
  as?: 'div' | 'nav';
  className?: string;
  label?: string;
}) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return;

    // Animate list entries individually, without wrappers that change MDX markup.
    const targets = Array.from(container.children).flatMap((child) =>
      child.matches('ul, ol') ? Array.from(child.children) : [child],
    ).filter((child): child is HTMLElement => child instanceof HTMLElement);
    const pending = new Set(targets);
    const order = new Map(targets.map((target, index) => [target, index]));
    const animations = new Map<HTMLElement, Animation>();
    const observer = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => (order.get(a.target as HTMLElement) ?? 0) - (order.get(b.target as HTMLElement) ?? 0))
        .forEach((entry, index) => {
          const target = entry.target as HTMLElement;
          if (!pending.delete(target)) return;
          observer.unobserve(target);
          const animation = target.animate([
            { opacity: 0, transform: 'translateY(18px)', filter: 'blur(8px)' },
            { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
          ], {
            duration: 620,
            delay: Math.min(index * 60, 180),
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'both',
          });
          animations.set(target, animation);
          target.classList.remove('article-reveal-pending');
          animation.onfinish = () => {
            animation.cancel();
            animations.delete(target);
          };
        });
    }, { threshold: 0.01 });

    for (const target of targets) {
      target.classList.add('article-reveal-pending');
      observer.observe(target);
    }

    const showAll = () => {
      observer.disconnect();
      targets.forEach((target) => target.classList.remove('article-reveal-pending'));
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      pending.clear();
    };
    const onPreferenceChange = () => { if (preference.matches) showAll(); };
    // A keyboard-focused link must be visible even before its observer fires.
    const onFocus = (event: FocusEvent) => {
      const target = targets.find((candidate) => event.target instanceof Node && candidate.contains(event.target));
      if (!target) return;
      pending.delete(target);
      observer.unobserve(target);
      target.classList.remove('article-reveal-pending');
      animations.get(target)?.cancel();
      animations.delete(target);
    };
    preference.addEventListener('change', onPreferenceChange);
    container.addEventListener('focusin', onFocus);
    return () => {
      showAll();
      preference.removeEventListener('change', onPreferenceChange);
      container.removeEventListener('focusin', onFocus);
    };
  }, [children]);

  return <Element ref={(node) => { root.current = node; }} className={className} aria-label={label}>{children}</Element>;
}
