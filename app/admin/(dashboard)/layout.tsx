import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { getAdminSession } from '@/lib/auth';
import { getSiteSettings } from '@/lib/data';
import '@/app/styles/admin.css';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

/** Admin pages always reflect the live database, never a cached snapshot. */
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([getAdminSession(), getSiteSettings()]);

  // The login route renders its own layout tree, so anything reaching here
  // without a valid admin session goes back to sign in.
  if (!session) redirect('/admin/login');

  return (
    <AdminShell
      session={session}
      logoUrl={settings.brand.logoUrl}
      brandName={settings.brand.name}
    >
      {children}
    </AdminShell>
  );
}
