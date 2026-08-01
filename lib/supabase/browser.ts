'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Singleton browser client used by the admin panel. */
export function getBrowserClient() {
  if (!client) {
    client = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}
