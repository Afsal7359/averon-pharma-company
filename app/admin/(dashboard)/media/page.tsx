import { createClient } from '@/lib/supabase/server';
import type { MediaAssetRow } from '@/lib/supabase/database.types';
import MediaManager from './MediaManager';

export default async function MediaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  return <MediaManager initial={(data ?? []) as MediaAssetRow[]} />;
}
