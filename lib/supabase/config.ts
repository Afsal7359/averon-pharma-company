export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

/**
 * Supabase is migrating from the legacy `anon` JWT to publishable keys
 * (`sb_publishable_…`). Both are safe in the browser and interchangeable here,
 * so either variable works.
 *
 * NOTE: Next.js inlines `process.env.NEXT_PUBLIC_*` at build time, so each name
 * must be referenced literally — no dynamic lookup.
 */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  '';

/**
 * The site is built to render fully even before Supabase is wired up, so the
 * whole data layer checks this first and falls back to the bundled defaults.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
