import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { signUploadParams } from '@/lib/cloudinary';
import { createClient } from '@/lib/supabase/server';

/** Removes an asset from Cloudinary and from the media_assets index. */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { publicId } = (await request.json().catch(() => ({}))) as { publicId?: string };
  if (!publicId) {
    return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
  }

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.json({ error: 'Cloudinary is not configured.' }, { status: 503 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = await signUploadParams({ public_id: publicId, timestamp }, apiSecret);

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body,
  });
  const result = await res.json().catch(() => ({}));

  // Drop the index row even if the file was already gone from Cloudinary,
  // so the media library doesn't keep showing a dead thumbnail.
  const supabase = await createClient();
  await supabase.from('media_assets').delete().eq('public_id', publicId);

  if (!res.ok || (result.result !== 'ok' && result.result !== 'not found')) {
    return NextResponse.json(
      { error: result.error?.message || 'Cloudinary delete failed', result },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, result: result.result });
}
