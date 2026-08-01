import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config';
import type { Database } from './database.types';

/**
 * Request-scoped client that reads/refreshes the auth cookie.
 * Use in Server Components, Server Actions and Route Handlers.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — the middleware refreshes instead.
        }
      },
    },
  });
}

/**
 * Returns null instead of throwing when Supabase env vars are missing, so
 * public pages can fall back to bundled default content.
 */
export async function createClientOrNull() {
  if (!isSupabaseConfigured) return null;
  return createClient();
}

/** Service-role client — server only, bypasses RLS. Never import client-side. */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) return null;

  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  return createSupabaseClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
