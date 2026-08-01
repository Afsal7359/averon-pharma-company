'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { AdminSession } from '@/lib/auth';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  /** Match the pathname exactly — needed for /admin itself. */
  exact?: boolean;
}

const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: 'medal', exact: true }],
  },
  {
    label: 'Website content',
    items: [
      { href: '/admin/pages', label: 'Pages & Sections', icon: 'box' },
      { href: '/admin/settings', label: 'Site Settings', icon: 'scales' },
      { href: '/admin/media', label: 'Media Library', icon: 'eye' },
    ],
  },
  {
    label: 'Products',
    items: [
      { href: '/admin/categories', label: 'Categories', icon: 'capsule' },
      { href: '/admin/subcategories', label: 'Subcategories', icon: 'leaf' },
      { href: '/admin/products', label: 'Products', icon: 'flask' },
    ],
  },
  {
    label: 'Enquiries',
    items: [{ href: '/admin/enquiries', label: 'Contact Enquiries', icon: 'mail' }],
  },
];

interface Props {
  session: AdminSession;
  logoUrl: string;
  brandName: string;
  children: React.ReactNode;
}

export default function AdminShell({ session, logoUrl, brandName, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setNavOpen(false), [pathname]);

  const title =
    NAV.flatMap((g) => g.items).find((i) =>
      i.exact ? pathname === i.href : pathname.startsWith(i.href),
    )?.label ?? 'Admin';

  async function signOut() {
    setSigningOut(true);
    await getBrowserClient().auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className={`admin${navOpen ? ' nav-open' : ''}`}>
      <div className="admin-shell">
        {navOpen && (
          <div className="admin-scrim" role="presentation" onClick={() => setNavOpen(false)} />
        )}

        <aside className="admin-sidebar">
          <div className="admin-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt={brandName} />
            <span className="tag">Admin</span>
          </div>

          <nav className="admin-nav">
            {NAV.map((group) => (
              <div key={group.label}>
                <div className="group-label">{group.label}</div>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={isActive(item.href, item.exact) ? 'is-active' : ''}
                  >
                    <Icon name={item.icon} />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}

            <div>
              <div className="group-label">Website</div>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <Icon name="globe" />
                View live site
              </a>
            </div>
          </nav>

          <div className="admin-sidebar-foot">
            <div className="admin-user">
              {session.fullName ? `${session.fullName} · ` : ''}
              {session.email}
            </div>
            <button className="admin-signout" onClick={signOut} disabled={signingOut}>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <button
              className="admin-menu-btn"
              aria-label="Toggle navigation"
              onClick={() => setNavOpen((v) => !v)}
            >
              <Icon name={navOpen ? 'alert' : 'box'} />
            </button>
            <h1>{title}</h1>
            <span className="spacer" />
            <a href="/" target="_blank" rel="noopener noreferrer" className="a-btn a-btn--ghost a-btn--sm">
              <Icon name="globe" />
              View site
            </a>
          </header>

          <div className="admin-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
