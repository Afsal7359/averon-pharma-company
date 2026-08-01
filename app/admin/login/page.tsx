import type { Metadata } from 'next';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getSiteSettings } from '@/lib/data';
import LoginForm from './LoginForm';
import '@/app/styles/admin.css';

export const metadata: Metadata = {
  title: 'Admin Sign In',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const { brand } = await getSiteSettings();

  return (
    <div className="admin">
      <div className="login-wrap">
        <div className="login-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brand.logoUrl} alt={brand.name} />
          <h1>Admin Sign In</h1>
          <p>Manage the {brand.name} website content, products and enquiries.</p>

          {isSupabaseConfigured ? (
            <LoginForm />
          ) : (
            <div className="a-alert a-alert--warn">
              <span>
                Supabase isn&rsquo;t configured yet. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then restart
                the server.
              </span>
            </div>
          )}

          <div className="login-foot">
            Access is restricted to registered administrators.
            <br />
            <a href="/">← Back to website</a>
          </div>
        </div>
      </div>
    </div>
  );
}
