'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/auth';

/**
 * Public pages are ISR-cached; the admin panel calls this after every save so
 * edits appear on the live site immediately instead of after the 60s window.
 */
export async function revalidateSite(paths?: string[]) {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: 'Unauthorized' };

  if (paths?.length) {
    paths.forEach((p) => revalidatePath(p));
  } else {
    revalidatePath('/', 'layout');
  }

  return { ok: true };
}
