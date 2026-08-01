import 'server-only';
import { createClient } from './supabase/server';
import { isSupabaseConfigured } from './supabase/config';
import type { AdminUserRow } from './supabase/database.types';

export interface AdminSession {
  userId: string;
  email: string;
  fullName: string | null;
  role: 'admin' | 'editor';
}

/**
 * Resolves the signed-in user AND confirms they are on the admin roster.
 * Returns null in every other case — including when Supabase isn't set up.
 *
 * This is a UX gate; the real enforcement is the RLS policies, which check
 * public.is_admin() on every write.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id, email, full_name, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Pick<AdminUserRow, 'user_id' | 'email' | 'full_name' | 'role'>;
  return {
    userId: row.user_id,
    email: row.email || user.email || '',
    fullName: row.full_name,
    role: row.role,
  };
}
