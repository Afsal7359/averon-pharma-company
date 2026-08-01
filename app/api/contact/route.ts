import { NextResponse } from 'next/server';
import { getPublicClient } from '@/lib/supabase/public';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface Payload {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  sourcePage?: string;
  /** Honeypot — real users never see or fill this. */
  company?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Payload;

  // Silently accept bot submissions so they don't retry.
  if (body.company) return NextResponse.json({ ok: true });

  const name = body.name?.trim() ?? '';
  const email = body.email?.trim() ?? '';
  const message = body.message?.trim() ?? '';

  if (!name) {
    return NextResponse.json({ error: 'Please tell us your name.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: 'Please write a little more so we can help.' },
      { status: 400 },
    );
  }

  const supabase = getPublicClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'The contact form is not configured yet. Please email us directly.' },
      { status: 503 },
    );
  }

  const { error } = await supabase.from('enquiries').insert({
    name: name.slice(0, 200),
    email: email.slice(0, 200),
    phone: body.phone?.trim().slice(0, 60) || null,
    subject: body.subject?.trim().slice(0, 200) || 'General Enquiry',
    message: message.slice(0, 5000),
    source_page: body.sourcePage?.slice(0, 200) || null,
  });

  if (error) {
    console.error('[contact] insert failed:', error.message);
    return NextResponse.json(
      { error: 'We could not send your message. Please try again or email us directly.' },
      { status: 500 },
    );
  }

  // Optional email notification — the enquiry is already saved either way.
  await notifyByEmail({ name, email, phone: body.phone, subject: body.subject, message });

  return NextResponse.json({ ok: true });
}

async function notifyByEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_TO;
  const from = process.env.CONTACT_NOTIFY_FROM;
  if (!apiKey || !to || !from) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: to.split(',').map((s) => s.trim()),
        reply_to: data.email,
        subject: `[Website] ${data.subject || 'New enquiry'} — ${data.name}`,
        text: [
          `Name: ${data.name}`,
          `Email: ${data.email}`,
          data.phone ? `Phone: ${data.phone}` : null,
          `Subject: ${data.subject || 'General Enquiry'}`,
          '',
          data.message,
        ]
          .filter(Boolean)
          .join('\n'),
      }),
    });
  } catch (err) {
    console.error('[contact] notification email failed:', err);
  }
}
