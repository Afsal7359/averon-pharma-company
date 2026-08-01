'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';

/**
 * Ports the scroll behaviours from the original main.js: progress bar,
 * IntersectionObserver reveals (re-armed on every route change), and the
 * back-to-top button.
 */
export default function ScrollEffects() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? (doc.scrollTop / max) * 100 : 0);
      setShowTop(window.scrollY > 700);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.reveal, .reveal-left, .reveal-right, .reveal-scale, .pulse-divider',
      ),
    );

    // Stagger children inside any [data-stagger] container.
    document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
      group
        .querySelectorAll<HTMLElement>('.reveal, .reveal-left, .reveal-right, .reveal-scale')
        .forEach((child, i) => {
          child.style.transitionDelay = `${i * 0.09}s`;
        });
    });

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -60px 0px' },
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return (
    <>
      <div className="scroll-progress" style={{ width: `${progress}%` }} />
      <button
        className={`back-to-top${showTop ? ' is-visible' : ''}`}
        aria-label="Back to top"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'auto'
              : 'smooth',
          })
        }
      >
        <Icon name="arrowUp" />
      </button>
    </>
  );
}
