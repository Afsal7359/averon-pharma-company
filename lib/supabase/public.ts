import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config';

let client: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Cookie-free anon client for reading published content.
 *
 * Deliberately separate from the SSR client: touching cookies() would opt every
 * public page out of static rendering / ISR. Public content is world-readable
 * under RLS, so no session is needed.
 */
export function getPublicClient() {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
