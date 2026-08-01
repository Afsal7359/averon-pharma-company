import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getPublicClient } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Daily database heartbeat.
 *
 * Supabase pauses free-tier projects after ~7 days with no activity, which
 * would take the whole website down. A scheduled request here performs a real
 * write + read every day so the project is never considered idle.
 *
 * Scheduling (either is enough — see README):
 *   • Vercel Cron   → vercel.json, sends `Authorization: Bearer $CRON_SECRET`
 *   • cron-job.org  → GET /api/keep-alive?secret=YOUR_CRON_SECRET
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (secret) {
    const url = new URL(request.url);
    const bearer = request.headers.get('authorization');
    const provided =
      bearer?.replace(/^Bearer\s+/i, '') ?? url.searchParams.get('secret') ?? '';

    if (provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Prefer the service-role key so the write happens regardless of RLS.
  const admin = createAdminClient();
  const startedAt = Date.now();

  if (admin) {
    const { error: insertError } = await admin
      .from('keep_alive')
      .insert({ source: 'cron', note: 'daily heartbeat' });

    if (insertError) {
      console.error('[keep-alive] write failed:', insertError.message);
      return NextResponse.json(
        { ok: false, stage: 'write', error: insertError.message },
        { status: 500 },
      );
    }

    // Read back so both directions of the connection are exercised.
    const { data, error: readError } = await admin
      .from('keep_alive')
      .select('pinged_at')
      .order('pinged_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (readError) {
      console.error('[keep-alive] read failed:', readError.message);
      return NextResponse.json(
        { ok: false, stage: 'read', error: readError.message },
        { status: 500 },
      );
    }

    // Housekeeping: drop heartbeats older than 90 days.
    await admin.rpc('prune_keep_alive');

    return NextResponse.json({
      ok: true,
      mode: 'service-role',
      pingedAt: data?.pinged_at ?? null,
      durationMs: Date.now() - startedAt,
    });
  }

  // Fallback: no service-role key configured. A read still counts as activity.
  const anon = getPublicClient();
  if (!anon) {
    return NextResponse.json(
      { ok: false, error: 'Supabase is not configured.' },
      { status: 503 },
    );
  }

  const { error } = await anon.from('pages').select('id').limit(1);
  if (error) {
    console.error('[keep-alive] anon read failed:', error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    mode: 'anon-read-only',
    note: 'Add SUPABASE_SERVICE_ROLE_KEY to record heartbeats in the keep_alive table.',
    durationMs: Date.now() - startedAt,
  });
}

/** Some schedulers only send POST. */
export const POST = GET;
