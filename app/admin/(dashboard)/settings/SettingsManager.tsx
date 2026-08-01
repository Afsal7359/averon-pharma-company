'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import ImageField from '@/components/admin/ImageField';
import { StringList, useToast } from '@/components/admin/ui';
import { getBrowserClient } from '@/lib/supabase/browser';
import { revalidateSite } from '@/app/actions/revalidate';
import type { SiteSettings } from '@/lib/types';

export default function SettingsManager({ initial }: { initial: SiteSettings }) {
  const supabase = getBrowserClient();
  const { show, node: toastNode } = useToast();

  const [s, setS] = useState<SiteSettings>(initial);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof SiteSettings>(key: K, value: Partial<SiteSettings[K]>) =>
    setS((prev) => ({ ...prev, [key]: { ...prev[key], ...value } }));

  async function saveAll() {
    setBusy(true);

    const rows = (Object.keys(s) as (keyof SiteSettings)[]).map((key) => ({
      key: key as string,
      value: s[key] as any,
    }));

    const { error } = await supabase
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' });

    setBusy(false);
    if (error) return show(error.message, 'error');

    await revalidateSite();
    show('Site settings saved.');
  }

  return (
    <>
      <div className="a-page-head">
        <div>
          <h2>Site Settings</h2>
          <p>
            Brand details, contact information, header buttons and footer links — these appear on
            every page of the website.
          </p>
        </div>
        <span className="spacer" />
        <button className="a-btn a-btn--primary" onClick={saveAll} disabled={busy}>
          {busy ? <span className="a-spinner" /> : <Icon name="check" />}
          Save all settings
        </button>
      </div>

      {/* ---------------- Brand ---------------- */}
      <div className="a-card">
        <div className="a-card-head">
          <div>
            <h2>Brand</h2>
            <p>Company name, logo and the tagline shown in the footer.</p>
          </div>
        </div>

        <div className="a-grid a-grid-2">
          <div className="a-field">
            <label>Company name</label>
            <input
              className="a-input"
              value={s.brand.name}
              onChange={(e) => set('brand', { name: e.target.value })}
            />
          </div>
          <div className="a-field">
            <label>Tagline</label>
            <input
              className="a-input"
              value={s.brand.tagline}
              onChange={(e) => set('brand', { tagline: e.target.value })}
            />
          </div>
        </div>

        <div className="a-field">
          <label>Short description (footer + meta)</label>
          <textarea
            className="a-textarea"
            rows={3}
            value={s.brand.description}
            onChange={(e) => set('brand', { description: e.target.value })}
          />
        </div>

        <ImageField
          label="Logo"
          value={s.brand.logoUrl}
          onChange={(url) => set('brand', { logoUrl: url })}
          hint="Used in the header, footer and admin panel. A transparent PNG works best."
        />

        <div className="a-field">
          <label>Favicon URL</label>
          <input
            className="a-input"
            value={s.brand.faviconUrl}
            onChange={(e) => set('brand', { faviconUrl: e.target.value })}
          />
        </div>
      </div>

      {/* ---------------- Contact ---------------- */}
      <div className="a-card">
        <div className="a-card-head">
          <div>
            <h2>Contact details</h2>
            <p>Shown in the footer and used as the default for the contact page map.</p>
          </div>
        </div>

        <StringList
          label="Address lines"
          values={s.contact.addressLines}
          onChange={(v) => set('contact', { addressLines: v })}
          placeholder="648/A, 4th Floor, OM Chambers,"
        />

        <div className="a-grid a-grid-2">
          <div className="a-field">
            <label>Email</label>
            <input
              className="a-input"
              type="email"
              value={s.contact.email}
              onChange={(e) => set('contact', { email: e.target.value })}
            />
          </div>
          <div className="a-field">
            <label>Phone (optional)</label>
            <input
              className="a-input"
              value={s.contact.phone}
              onChange={(e) => set('contact', { phone: e.target.value })}
              placeholder="+91 00000 00000"
            />
          </div>
        </div>

        <div className="a-field">
          <label>Map search text</label>
          <input
            className="a-input"
            value={s.contact.mapQuery}
            onChange={(e) => set('contact', { mapQuery: e.target.value })}
          />
          <div className="a-hint">
            Whatever you would type into Google Maps to find the office.
          </div>
        </div>
      </div>

      {/* ---------------- Header ---------------- */}
      <div className="a-card">
        <div className="a-card-head">
          <div>
            <h2>Header buttons</h2>
            <p>
              The menu itself is built from your published pages — manage it under Pages &amp;
              Sections.
            </p>
          </div>
        </div>

        <div className="a-grid a-grid-2">
          <div className="a-field">
            <label>Header button text</label>
            <input
              className="a-input"
              value={s.header.ctaLabel}
              onChange={(e) => set('header', { ctaLabel: e.target.value })}
            />
          </div>
          <div className="a-field">
            <label>Header button link</label>
            <input
              className="a-input"
              value={s.header.ctaHref}
              onChange={(e) => set('header', { ctaHref: e.target.value })}
            />
          </div>
          <div className="a-field">
            <label>Mobile menu button text</label>
            <input
              className="a-input"
              value={s.header.mobileCtaLabel}
              onChange={(e) => set('header', { mobileCtaLabel: e.target.value })}
            />
          </div>
          <div className="a-field">
            <label>Mobile menu button link</label>
            <input
              className="a-input"
              value={s.header.mobileCtaHref}
              onChange={(e) => set('header', { mobileCtaHref: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* ---------------- Footer ---------------- */}
      <div className="a-card">
        <div className="a-card-head">
          <div>
            <h2>Footer</h2>
            <p>Link columns and the copyright line.</p>
          </div>
        </div>

        {s.footer.columns.map((col, ci) => (
          <fieldset className="sec-fieldset" key={ci}>
            <div className="legend">Column {ci + 1}</div>

            <div className="a-field">
              <label>Column title</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="a-input"
                  value={col.title}
                  onChange={(e) => {
                    const columns = [...s.footer.columns];
                    columns[ci] = { ...col, title: e.target.value };
                    set('footer', { columns });
                  }}
                />
                <button
                  className="a-btn a-btn--danger a-btn--icon"
                  aria-label="Remove column"
                  onClick={() =>
                    set('footer', { columns: s.footer.columns.filter((_, i) => i !== ci) })
                  }
                >
                  <Icon name="alert" />
                </button>
              </div>
            </div>

            {col.links.map((link, li) => (
              <div className="list-line" key={li}>
                <input
                  className="a-input"
                  value={link.label}
                  placeholder="Link text"
                  onChange={(e) => {
                    const columns = [...s.footer.columns];
                    const links = [...col.links];
                    links[li] = { ...link, label: e.target.value };
                    columns[ci] = { ...col, links };
                    set('footer', { columns });
                  }}
                />
                <input
                  className="a-input"
                  value={link.href}
                  placeholder="/about"
                  onChange={(e) => {
                    const columns = [...s.footer.columns];
                    const links = [...col.links];
                    links[li] = { ...link, href: e.target.value };
                    columns[ci] = { ...col, links };
                    set('footer', { columns });
                  }}
                />
                <button
                  className="a-btn a-btn--danger a-btn--icon"
                  aria-label="Remove link"
                  onClick={() => {
                    const columns = [...s.footer.columns];
                    columns[ci] = { ...col, links: col.links.filter((_, i) => i !== li) };
                    set('footer', { columns });
                  }}
                >
                  <Icon name="alert" />
                </button>
              </div>
            ))}

            <button
              className="a-btn a-btn--subtle a-btn--sm"
              onClick={() => {
                const columns = [...s.footer.columns];
                columns[ci] = { ...col, links: [...col.links, { label: '', href: '' }] };
                set('footer', { columns });
              }}
            >
              + Add link
            </button>
          </fieldset>
        ))}

        <button
          className="a-btn a-btn--subtle a-btn--sm"
          style={{ marginTop: 12 }}
          onClick={() =>
            set('footer', {
              columns: [...s.footer.columns, { title: 'New column', links: [] }],
            })
          }
        >
          + Add column
        </button>

        <div className="a-grid a-grid-2" style={{ marginTop: 18 }}>
          <div className="a-field">
            <label>Contact column title</label>
            <input
              className="a-input"
              value={s.footer.contactTitle}
              onChange={(e) => set('footer', { contactTitle: e.target.value })}
            />
          </div>
          <div className="a-field">
            <label>Copyright text</label>
            <input
              className="a-input"
              value={s.footer.copyright}
              onChange={(e) => set('footer', { copyright: e.target.value })}
            />
            <div className="a-hint">The current year is added automatically.</div>
          </div>
        </div>
      </div>

      {/* ---------------- SEO ---------------- */}
      <div className="a-card">
        <div className="a-card-head">
          <div>
            <h2>Search engines</h2>
            <p>Defaults used when a page doesn&rsquo;t define its own meta title/description.</p>
          </div>
        </div>

        <div className="a-field">
          <label>Website address</label>
          <input
            className="a-input"
            value={s.seo.siteUrl}
            onChange={(e) => set('seo', { siteUrl: e.target.value })}
            placeholder="https://www.averonlifesciences.com"
          />
        </div>
        <div className="a-field">
          <label>Default page title</label>
          <input
            className="a-input"
            value={s.seo.titleDefault}
            onChange={(e) => set('seo', { titleDefault: e.target.value })}
          />
        </div>
        <div className="a-field">
          <label>Default description</label>
          <textarea
            className="a-textarea"
            rows={3}
            value={s.seo.description}
            onChange={(e) => set('seo', { description: e.target.value })}
          />
        </div>
      </div>

      <div className="a-btn-row" style={{ marginTop: 20 }}>
        <button className="a-btn a-btn--primary" onClick={saveAll} disabled={busy}>
          {busy ? <span className="a-spinner" /> : <Icon name="check" />}
          Save all settings
        </button>
      </div>

      {toastNode}
    </>
  );
}
