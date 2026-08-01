'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Icon from '@/components/Icon';
import { getBrowserClient } from '@/lib/supabase/browser';

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const supabase = getBrowserClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setBusy(false);
      return;
    }

    // Signing in isn't enough — the account must also be on the admin roster.
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.user!.id)
      .maybeSingle();

    if (!adminRow) {
      await supabase.auth.signOut();
      setError('This account does not have admin access.');
      setBusy(false);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      {error && (
        <div className="a-alert a-alert--error">
          <Icon name="alert" />
          <span>{error}</span>
        </div>
      )}

      <div className="a-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          className="a-input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@averonlifesciences.com"
        />
      </div>

      <div className="a-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          className="a-input"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      <button type="submit" className="a-btn a-btn--primary" disabled={busy}>
        {busy ? (
          <>
            <span className="a-spinner" /> Signing in…
          </>
        ) : (
          <>
            Sign In <Icon name="arrow" />
          </>
        )}
      </button>
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="a-loading">Loading…</div>}>
      <Form />
    </Suspense>
  );
}
