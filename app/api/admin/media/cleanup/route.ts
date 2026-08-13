import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { signUploadParams } from '@/lib/cloudinary';
import { createClient } from '@/lib/supabase/server';

/**
 * Reference-counted Cloudinary cleanup.
 *
 * The admin panel calls this AFTER a successful save or delete, passing the
 * public_ids that the record no longer uses. An image is only destroyed if
 * nothing else still references it — the media library lets one image be
 * reused in several places, so deleting on sight would break live pages.
 *
 * Because it runs after the write is committed, the reference scan sees the
 * new state and is therefore accurate.
 */

interface Body {
  publicIds?: string[];
  /** Skip the reference check — used by the media library's explicit delete. */
  force?: boolean;
}

export interface CleanupResult {
  deleted: string[];
  kept: { publicId: string; usedIn: string[] }[];
  failed: { publicId: string; error: string }[];
}

/**
 * Cloudinary URLs embed the public_id, so a substring match over the stored
 * JSON catches both the explicit *_public_id fields and any pasted URL.
 */
function mentions(haystack: unknown, publicId: string) {
  if (!haystack) return false;
  return JSON.stringify(haystack).includes(publicId);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { publicIds = [], force = false } = (await request
    .json()
    .catch(() => ({}))) as Body;

  const ids = [...new Set(publicIds.filter((id) => typeof id === 'string' && id.trim()))];
  if (ids.length === 0) {
    return NextResponse.json({ deleted: [], kept: [], failed: [] } satisfies CleanupResult);
  }

  const supabase = await createClient();

  // These tables are small (tens–hundreds of rows), so scanning them in one
  // pass is cheaper and clearer than per-id jsonb queries.
  const [categories, subcategories, products, sections, settings, pages] = await Promise.all([
    supabase.from('product_categories').select('name, image_url, image_public_id'),
    supabase.from('product_subcategories').select('name, image_url, image_public_id'),
    supabase.from('products').select('name, image_url, image_public_id, gallery, detail_html'),
    supabase.from('page_sections').select('type, content, page_id'),
    supabase.from('site_settings').select('key, value'),
    supabase.from('pages').select('id, title, og_image_url'),
  ]);

  const pageTitles = new Map(
    (pages.data ?? []).map((p: any) => [p.id as string, p.title as string]),
  );

  const result: CleanupResult = { deleted: [], kept: [], failed: [] };

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  for (const publicId of ids) {
    const usedIn: string[] = [];

    if (!force) {
      (categories.data ?? []).forEach((r: any) => {
        if (mentions(r, publicId)) usedIn.push(`Category: ${r.name}`);
      });
      (subcategories.data ?? []).forEach((r: any) => {
        if (mentions(r, publicId)) usedIn.push(`Range: ${r.name}`);
      });
      (products.data ?? []).forEach((r: any) => {
        if (mentions(r, publicId)) usedIn.push(`Product: ${r.name}`);
      });
      (sections.data ?? []).forEach((r: any) => {
        if (mentions(r.content, publicId)) {
          usedIn.push(`Page section: ${pageTitles.get(r.page_id) ?? 'page'} → ${r.type}`);
        }
      });
      (settings.data ?? []).forEach((r: any) => {
        if (mentions(r.value, publicId)) usedIn.push(`Site settings: ${r.key}`);
      });
      (pages.data ?? []).forEach((r: any) => {
        if (r.og_image_url && String(r.og_image_url).includes(publicId)) {
          usedIn.push(`Page share image: ${r.title}`);
        }
      });

      if (usedIn.length > 0) {
        result.kept.push({ publicId, usedIn: [...new Set(usedIn)] });
        continue;
      }
    }

    if (!apiKey || !apiSecret || !cloudName) {
      result.failed.push({ publicId, error: 'Cloudinary is not configured.' });
      continue;
    }

    try {
      const timestamp = Math.round(Date.now() / 1000);
      const signature = await signUploadParams({ public_id: publicId, timestamp }, apiSecret);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: 'POST',
        body: new URLSearchParams({
          public_id: publicId,
          timestamp: String(timestamp),
          api_key: apiKey,
          signature,
        }),
      });
      const json = await res.json().catch(() => ({}));

      // "not found" means it's already gone — still drop the index row.
      if (!res.ok || (json.result !== 'ok' && json.result !== 'not found')) {
        result.failed.push({
          publicId,
          error: json?.error?.message || `Cloudinary responded ${res.status}`,
        });
        continue;
      }

      await supabase.from('media_assets').delete().eq('public_id', publicId);
      result.deleted.push(publicId);
    } catch (err) {
      result.failed.push({
        publicId,
        error: err instanceof Error ? err.message : 'Delete failed',
      });
    }
  }

  return NextResponse.json(result);
}
