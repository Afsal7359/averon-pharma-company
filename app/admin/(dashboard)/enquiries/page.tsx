import { createClient } from '@/lib/supabase/server';
import type { EnquiryRow } from '@/lib/supabase/database.types';
import EnquiriesManager from './EnquiriesManager';

export default async function EnquiriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300);

  return <EnquiriesManager initial={(data ?? []) as EnquiryRow[]} />;
}
