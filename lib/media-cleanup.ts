'use client';

export interface CleanupResult {
  deleted: string[];
  kept: { publicId: string; usedIn: string[] }[];
  failed: { publicId: string; error: string }[];
}

const EMPTY: CleanupResult = { deleted: [], kept: [], failed: [] };

/**
 * Ask the server to drop Cloudinary images a record no longer uses.
 *
 * Call this AFTER the save/delete has succeeded — the server re-scans the
 * database, so an image still referenced somewhere else is kept.
 *
 * Never throws: failing to tidy up a file must not break the admin flow.
 */
export async function cleanupMedia(
  publicIds: (string | null | undefined)[],
  opts: { force?: boolean } = {},
): Promise<CleanupResult> {
  const ids = publicIds.filter((id): id is string => Boolean(id && id.trim()));
  if (ids.length === 0) return EMPTY;

  try {
    const res = await fetch('/api/admin/media/cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicIds: ids, force: opts.force ?? false }),
    });
    if (!res.ok) return EMPTY;
    return (await res.json()) as CleanupResult;
  } catch {
    return EMPTY;
  }
}

/** Every Cloudinary public_id mentioned anywhere inside a section's content. */
export function collectPublicIds(value: unknown, out: Set<string> = new Set()): Set<string> {
  if (!value || typeof value !== 'object') return out;

  if (Array.isArray(value)) {
    value.forEach((v) => collectPublicIds(v, out));
    return out;
  }

  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (
      typeof val === 'string' &&
      val.trim() &&
      (key === 'imagePublicId' || key === 'image_public_id' || key === 'logoPublicId')
    ) {
      out.add(val);
    } else {
      collectPublicIds(val, out);
    }
  }
  return out;
}

/** IDs present before an edit but gone after it. */
export function removedPublicIds(before: unknown, after: unknown): string[] {
  const kept = collectPublicIds(after);
  return [...collectPublicIds(before)].filter((id) => !kept.has(id));
}
