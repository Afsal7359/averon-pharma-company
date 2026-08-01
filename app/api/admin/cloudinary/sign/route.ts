import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { CLOUDINARY_FOLDER, signUploadParams } from '@/lib/cloudinary';

/**
 * Issues a short-lived Cloudinary upload signature to signed-in admins.
 * The browser then POSTs the file straight to Cloudinary, so the API secret
 * stays on the server and large files never transit Next.js.
 */
export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.json(
      { error: 'Cloudinary is not configured. Add CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.' },
      { status: 503 },
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder: CLOUDINARY_FOLDER, timestamp };
  const signature = await signUploadParams(params, apiSecret);

  return NextResponse.json({ ...params, signature, apiKey, cloudName });
}
