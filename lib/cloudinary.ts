// =========================================================================
// Cloudinary — every uploaded image in the site and admin panel lives here.
//
// Uploads are *signed*: the browser asks our API for a signature, then posts
// the file straight to Cloudinary. The API secret never leaves the server and
// large files never pass through Next.js.
// =========================================================================

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';

export const CLOUDINARY_FOLDER =
  process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER ?? 'averon';

export const isCloudinaryConfigured = Boolean(CLOUDINARY_CLOUD_NAME);

export const CLOUDINARY_UPLOAD_URL = CLOUDINARY_CLOUD_NAME
  ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
  : '';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Inject Cloudinary delivery transformations into an existing secure_url.
 * Non-Cloudinary URLs (e.g. Unsplash, /assets/logo.png) pass through as-is,
 * so mixed sources keep working.
 */
export function cld(
  url: string | null | undefined,
  opts: { w?: number; h?: number; crop?: 'fill' | 'fit' | 'limit'; q?: string } = {},
): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;

  const { w, h, crop = 'fill', q = 'auto' } = opts;
  const parts = ['f_auto', `q_${q}`];
  if (w) parts.push(`w_${w}`);
  if (h) parts.push(`h_${h}`);
  if (w || h) parts.push(`c_${crop}`);

  // Don't stack transformations if the URL already carries one.
  const [prefix, rest] = url.split('/upload/');
  if (/^(v\d+\/|[^/]*_[^/]*\/)/.test(rest) && !/^v\d+\//.test(rest)) return url;

  return `${prefix}/upload/${parts.join(',')}/${rest}`;
}

/** Build the string Cloudinary signs, then sign it with the API secret. */
export async function signUploadParams(
  params: Record<string, string | number>,
  apiSecret: string,
): Promise<string> {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  const { createHash } = await import('node:crypto');
  return createHash('sha1').update(toSign + apiSecret).digest('hex');
}
