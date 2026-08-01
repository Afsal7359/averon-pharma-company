'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import { sectionClass } from './primitives';
import type { ContactBlockContent, ContactSettings } from '@/lib/types';

interface Props {
  c: ContactBlockContent;
  contact: ContactSettings;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactBlock({ c, contact }: Props) {
  const subjects = c.subjects?.length ? c.subjects : ['General Enquiry'];
  const mapQuery = c.mapQuery || contact.mapQuery;

  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const next: Record<string, string> = {};
    if (!data.name?.trim()) next.name = 'Please tell us your name.';
    if (!EMAIL_RE.test(data.email?.trim() ?? '')) next.email = 'Please enter a valid email address.';
    if (!data.message?.trim() || data.message.trim().length < 10)
      next.message = 'Please write at least a sentence so we can help.';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus('sending');
    setServerError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, sourcePage: window.location.pathname }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(json?.error || 'Something went wrong.');

      setStatus('sent');
      form.reset();
    } catch (err) {
      setStatus('error');
      setServerError(
        err instanceof Error ? err.message : 'We could not send your message. Please try again.',
      );
    }
  }

  return (
    <section className={sectionClass(c)}>
      <div className="container">
        <div className="split" style={{ alignItems: 'flex-start' }}>
          {/* ---- Form ---- */}
          <div className="split-text reveal-left">
            {c.eyebrow && (
              <div className={`eyebrow${c.eyebrowAccent === 'green' ? ' eyebrow--green' : ''}`}>
                {c.eyebrow}
              </div>
            )}
            {c.heading && <h2 style={{ marginBottom: 30 }}>{c.heading}</h2>}

            <form onSubmit={onSubmit} noValidate>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <div className="field-error">{errors.name}</div>}
                </div>
                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@email.com"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <div className="field-error">{errors.email}</div>}
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="phone">
                    Phone <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input type="tel" id="phone" name="phone" placeholder="+91 00000 00000" />
                </div>
                <div className="field">
                  <label htmlFor="subject">Subject</label>
                  <select id="subject" name="subject" defaultValue={subjects[0]}>
                    {subjects.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell us a little about what you need..."
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && <div className="field-error">{errors.message}</div>}
              </div>

              {/* Honeypot — bots fill it, humans never see it. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="sr-only"
                aria-hidden="true"
              />

              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? (
                  <>
                    <span className="spinner" /> Sending…
                  </>
                ) : (
                  <>
                    Send Message
                    <Icon name="arrow" />
                  </>
                )}
              </button>

              {c.note && <p className="form-note">{c.note}</p>}

              {status === 'sent' && (
                <div className="form-success is-visible">
                  <Icon name="checkCircle" />
                  {c.successMessage ||
                    "Thank you — your message has reached our team. We'll be in touch shortly."}
                </div>
              )}

              {status === 'error' && (
                <div className="form-error">
                  <Icon name="alert" />
                  {serverError}
                </div>
              )}
            </form>
          </div>

          {/* ---- Info + map ---- */}
          <div
            className="split-media reveal-right"
            style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
          >
            {c.infoCards && c.infoCards.length > 0 && (
              <div className="contact-info-card">
                {c.infoCards.map((card, i) => (
                  <div className="item" key={i}>
                    <div
                      className="icon"
                      style={{
                        color: card.accent === 'green' ? 'var(--green-700)' : 'var(--red-600)',
                      }}
                    >
                      <Icon name={card.icon} />
                    </div>
                    <div>
                      {card.title && <h4>{card.title}</h4>}
                      <p>
                        {card.href ? (
                          <a href={card.href}>{card.lines?.join(' ')}</a>
                        ) : (
                          card.lines?.map((line, li) => (
                            <span key={li}>
                              {line}
                              {li < (card.lines?.length ?? 0) - 1 && <br />}
                            </span>
                          ))
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {c.showMap !== false && mapQuery && (
              <div className="map-embed">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Corporate office location"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
