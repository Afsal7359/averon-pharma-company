import { createClient } from '@/lib/supabase/server';
import type { PageRow } from '@/lib/supabase/database.types';
import PagesManager from './PagesManager';

export default async function PagesAdminPage() {
  const supabase = await createClient();

  const [{ data: pages }, { data: sections }] = await Promise.all([
    supabase.from('pages').select('*').order('sort_order', { ascending: true }),
    supabase.from('page_sections').select('page_id'),
  ]);

  const counts = (sections ?? []).reduce<Record<string, number>>((acc, s) => {
    const id = (s as { page_id: string }).page_id;
    acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});

  return <PagesManager initialPages={(pages ?? []) as PageRow[]} sectionCounts={counts} />;
}
