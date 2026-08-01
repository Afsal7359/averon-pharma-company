'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import type { BrandSettings, HeaderSettings, Page } from '@/lib/types';

interface Props {
  brand: BrandSettings;
  header: HeaderSettings;
  navPages: Page[];
}

function hrefForPage(slug: string) {
  return slug === 'home' ? '/' : `/${slug}`;
}

export default function Navbar({ brand, header, navPages }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Route change closes the menu; the lock is released by the effect below.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  const links = navPages.map((p) => ({
    href: hrefForPage(p.slug),
    label: p.nav_label || p.title,
  }));

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className={`navbar${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container">
          <Link href="/" className="brand" aria-label={`${brand.name} home`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logoUrl} alt={brand.name} />
          </Link>

          <nav className="nav-links" aria-label="Primary">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={isActive(l.href) ? 'is-active' : ''}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="nav-cta">
            <Link href={header.ctaHref || '/contact'} className="btn btn--primary btn--sm">
              {header.ctaLabel || 'Contact Us'}
              <Icon name="arrow" />
            </Link>
            <button
              className={`nav-toggle${menuOpen ? ' is-open' : ''}`}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${menuOpen ? ' is-open' : ''}`}>
        <nav aria-label="Mobile">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? 'is-active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={header.ctaHref || '/contact'}
            className={isActive(header.ctaHref || '/contact') ? 'is-active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            {header.ctaLabel || 'Contact Us'}
          </Link>
        </nav>
        <Link
          href={header.mobileCtaHref || '/contact'}
          className="btn btn--primary"
          onClick={() => setMenuOpen(false)}
        >
          {header.mobileCtaLabel || 'Partner With Us'}
        </Link>
      </div>
    </>
  );
}
