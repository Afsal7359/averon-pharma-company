import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { PageRow, PageSectionRow } from '@/lib/supabase/database.types';
import SectionEditor from './SectionEditor';

export default async function EditPageSections({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase.from('pages').select('*').eq('id', id).maybeSingle();
  if (!page) notFound();

  const { data: sections } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_id', id)
    .order('sort_order', { ascending: true });

  return (
    <SectionEditor
      page={page as PageRow}
      initialSections={(sections ?? []) as PageSectionRow[]}
    />
  );
}
