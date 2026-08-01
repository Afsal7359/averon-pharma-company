'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Icon from '@/components/Icon';
import { ConfirmDialog, Modal, useToast } from '@/components/admin/ui';
import { getBrowserClient } from '@/lib/supabase/browser';
import { revalidateSite } from '@/app/actions/revalidate';
import { cleanupMedia, collectPublicIds } from '@/lib/media-cleanup';
import type { PageRow } from '@/lib/supabase/database.types';

interface Props {
  initialPages: PageRow[];
  sectionCounts: Record<string, number>;
}

const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const emptyDraft = {
  slug: '',
  title: '',
  nav_label: '',
  meta_title: '',
  meta_description: '',
  show_in_nav: true,
  is_published: true,
};

export default function PagesManager({ initialPages, sectionCounts }: Props) {
  const router = useRouter();
  const { show, node: toastNode } = useToast();
  const supabase = getBrowserClient();

  const [pages, setPages] = useState(initialPages);
  const [editing, setEditing] = useState<PageRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ ...emptyDraft });
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<PageRow | null>(null);

  const refresh = async () => {
    const { data } = await supabase.from('pages').select('*').order('sort_order');
    setPages((data ?? []) as PageRow[]);
    router.refresh();
  };

  async function saveMeta() {
    setBusy(true);
    const payload = {
      slug: slugify(draft.slug),
      title: draft.title.trim(),
      nav_label: draft.nav_label.trim() || draft.title.trim(),
      meta_title: draft.meta_title.trim() || null,
      meta_description: draft.meta_description.trim() || null,
      show_in_nav: draft.show_in_nav,
      is_published: draft.is_published,
    };

    if (!payload.slug || !payload.title) {
      show('Page title and URL are both required.', 'error');
      setBusy(false);
      return;
    }

    const { error } = editing
      ? await supabase.from('pages').update(payload).eq('id', editing.id)
      : await supabase
          .from('pages')
          .insert({ ...payload, sort_order: pages.length + 1 });

    setBusy(false);

    if (error) {
      show(
        error.code === '23505' ? 'That URL is already used by another page.' : error.message,
        'error',
      );
      return;
    }

    setEditing(null);
    setCreating(false);
    await refresh();
    await revalidateSite();
    show(editing ? 'Page updated.' : 'Page created.');
  }

  async function togglePublished(page: PageRow) {
    const { error } = await supabase
      .from('pages')
      .update({ is_published: !page.is_published })
      .eq('id', page.id);
    if (error) return show(error.message, 'error');
    await refresh();
    await revalidateSite();
    show(page.is_published ? 'Page unpublished.' : 'Page published.');
  }

  async function move(page: PageRow, dir: -1 | 1) {
    const index = pages.findIndex((p) => p.id === page.id);
    const target = pages[index + dir];
    if (!target) return;

    await Promise.all([
      supabase.from('pages').update({ sort_order: target.sort_order }).eq('id', page.id),
      supabase.from('pages').update({ sort_order: page.sort_order }).eq('id', target.id),
    ]);
    await refresh();
    await revalidateSite();
  }

  async function confirmDelete() {
    if (!deleting) return;

    // Sections cascade with the page — gather their images before they vanish.
    const { data: sections } = await supabase
      .from('page_sections')
      .select('content')
      .eq('page_id', deleting.id);
    const orphanedImages = [
      ...new Set(
        (sections ?? []).flatMap((s: { content: unknown }) => [...collectPublicIds(s.content)]),
      ),
    ];

    setBusy(true);
    const { error } = await supabase.from('pages').delete().eq('id', deleting.id);
    setBusy(false);
    setDeleting(null);
    if (error) return show(error.message, 'error');
    if (orphanedImages.length) await cleanupMedia(orphanedImages);
    await refresh();
    await revalidateSite();
    show('Page deleted.');
  }

  const openCreate = () => {
    setDraft({ ...emptyDraft });
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (page: PageRow) => {
    setDraft({
      slug: page.slug,
      title: page.title,
      nav_label: page.nav_label ?? '',
      meta_title: page.meta_title ?? '',
      meta_description: page.meta_description ?? '',
      show_in_nav: page.show_in_nav,
      is_published: page.is_published,
    });
    setCreating(false);
    setEditing(page);
  };

  return (
    <>
      <div className="a-page-head">
        <div>
          <h2>Pages &amp; Sections</h2>
          <p>
            Every page on the website is built from stackable sections. Open a page to add, reorder,
            hide or edit its content.
          </p>
        </div>
        <span className="spacer" />
        <button className="a-btn a-btn--primary" onClick={openCreate}>
          <Icon name="arrow" /> New page
        </button>
      </div>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>URL</th>
              <th>Sections</th>
              <th>In menu</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, i) => (
              <tr key={page.id}>
                <td>
                  <div className="name">{page.title}</div>
                  {page.is_system && <span className="muted">Core page</span>}
                </td>
                <td className="muted">{page.slug === 'home' ? '/' : `/${page.slug}`}</td>
                <td className="muted">{sectionCounts[page.id] ?? 0}</td>
                <td>
                  <span className={`a-badge ${page.show_in_nav ? 'a-badge--green' : 'a-badge--grey'}`}>
                    {page.show_in_nav ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <span className={`a-badge ${page.is_published ? 'a-badge--green' : 'a-badge--amber'}`}>
                    {page.is_published ? 'Live' : 'Draft'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button
                      className="a-btn a-btn--subtle a-btn--icon"
                      aria-label="Move up"
                      disabled={i === 0}
                      onClick={() => move(page, -1)}
                    >
                      <Icon name="arrowUp" />
                    </button>
                    <button
                      className="a-btn a-btn--subtle a-btn--icon"
                      aria-label="Move down"
                      disabled={i === pages.length - 1}
                      onClick={() => move(page, 1)}
                      style={{ transform: 'rotate(180deg)' }}
                    >
                      <Icon name="arrowUp" />
                    </button>
                    <Link href={`/admin/pages/${page.id}`} className="a-btn a-btn--green a-btn--sm">
                      Edit content
                    </Link>
                    <button className="a-btn a-btn--ghost a-btn--sm" onClick={() => openEdit(page)}>
                      Settings
                    </button>
                    <button
                      className="a-btn a-btn--subtle a-btn--sm"
                      onClick={() => togglePublished(page)}
                    >
                      {page.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    {!page.is_system && (
                      <button
                        className="a-btn a-btn--danger a-btn--icon"
                        aria-label="Delete page"
                        onClick={() => setDeleting(page)}
                      >
                        <Icon name="alert" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <Modal
          title={editing ? `Page settings — ${editing.title}` : 'Create a new page'}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          footer={
            <>
              <button
                className="a-btn a-btn--ghost"
                onClick={() => {
                  setCreating(false);
                  setEditing(null);
                }}
              >
                Cancel
              </button>
              <button className="a-btn a-btn--primary" onClick={saveMeta} disabled={busy}>
                {busy ? <span className="a-spinner" /> : <Icon name="check" />}
                {editing ? 'Save changes' : 'Create page'}
              </button>
            </>
          }
        >
          <div className="a-grid a-grid-2">
            <div className="a-field">
              <label>Page title</label>
              <input
                className="a-input"
                value={draft.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setDraft((d) => ({
                    ...d,
                    title,
                    // Auto-fill the URL while creating; never rewrite an existing one.
                    slug: !editing && (!d.slug || d.slug === slugify(d.title)) ? slugify(title) : d.slug,
                  }));
                }}
                placeholder="About Us"
              />
            </div>
            <div className="a-field">
              <label>URL</label>
              <input
                className="a-input"
                value={draft.slug}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                placeholder="about"
                disabled={editing?.is_system}
              />
              <div className="a-hint">
                {editing?.is_system
                  ? 'Core page URLs cannot be changed.'
                  : `Page will live at /${slugify(draft.slug) || '…'}`}
              </div>
            </div>
          </div>

          <div className="a-field">
            <label>Menu label</label>
            <input
              className="a-input"
              value={draft.nav_label}
              onChange={(e) => setDraft((d) => ({ ...d, nav_label: e.target.value }))}
              placeholder="Defaults to the page title"
            />
          </div>

          <fieldset className="sec-fieldset">
            <div className="legend">Search engine listing</div>
            <div className="a-field">
              <label>Meta title</label>
              <input
                className="a-input"
                value={draft.meta_title}
                onChange={(e) => setDraft((d) => ({ ...d, meta_title: e.target.value }))}
                placeholder="About Us | Averon Life Sciences"
              />
            </div>
            <div className="a-field">
              <label>Meta description</label>
              <textarea
                className="a-textarea"
                value={draft.meta_description}
                onChange={(e) => setDraft((d) => ({ ...d, meta_description: e.target.value }))}
                rows={3}
                placeholder="A short summary shown in Google results (around 155 characters)."
              />
            </div>
          </fieldset>

          <div className="a-check-row" style={{ marginTop: 16 }}>
            <label className="a-check">
              <input
                type="checkbox"
                checked={draft.show_in_nav}
                onChange={(e) => setDraft((d) => ({ ...d, show_in_nav: e.target.checked }))}
              />
              Show in the main menu
            </label>
            <label className="a-check">
              <input
                type="checkbox"
                checked={draft.is_published}
                onChange={(e) => setDraft((d) => ({ ...d, is_published: e.target.checked }))}
              />
              Published
            </label>
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this page?"
          message={`"${deleting.title}" and all of its sections will be permanently removed. This cannot be undone.`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {toastNode}
    </>
  );
}
