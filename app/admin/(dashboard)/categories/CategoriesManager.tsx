'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Icon, { ICON_KEYS } from '@/components/Icon';
import ImageField from '@/components/admin/ImageField';
import { ConfirmDialog, EmptyState, Modal, Segmented, useToast } from '@/components/admin/ui';
import { getBrowserClient } from '@/lib/supabase/browser';
import { revalidateSite } from '@/app/actions/revalidate';
import { cleanupMedia } from '@/lib/media-cleanup';
import { cld } from '@/lib/cloudinary';
import { slugify } from '@/lib/slug';
import type { ProductCategoryRow } from '@/lib/supabase/database.types';
import type { Accent } from '@/lib/types';

interface Props {
  initial: ProductCategoryRow[];
  subCounts: Record<string, number>;
  productCounts: Record<string, number>;
}

interface Draft {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image_url: string;
  image_public_id: string;
  icon: string;
  accent: Accent;
  is_active: boolean;
}

const blank: Draft = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  image_url: '',
  image_public_id: '',
  icon: 'capsule',
  accent: 'red',
  is_active: true,
};

export default function CategoriesManager({ initial, subCounts, productCounts }: Props) {
  const router = useRouter();
  const supabase = getBrowserClient();
  const { show, node: toastNode } = useToast();

  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState<ProductCategoryRow | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ ...blank });
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<ProductCategoryRow | null>(null);

  async function refresh() {
    const { data } = await supabase.from('product_categories').select('*').order('sort_order');
    setRows((data ?? []) as ProductCategoryRow[]);
    router.refresh();
  }

  function openCreate() {
    setDraft({ ...blank });
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row: ProductCategoryRow) {
    setDraft({
      name: row.name,
      slug: row.slug,
      tagline: row.tagline ?? '',
      description: row.description ?? '',
      image_url: row.image_url ?? '',
      image_public_id: row.image_public_id ?? '',
      icon: row.icon ?? 'capsule',
      accent: row.accent,
      is_active: row.is_active,
    });
    setEditing(row);
    setOpen(true);
  }

  async function save() {
    const payload = {
      name: draft.name.trim(),
      slug: slugify(draft.slug || draft.name),
      tagline: draft.tagline.trim() || null,
      description: draft.description.trim() || null,
      image_url: draft.image_url.trim() || null,
      image_public_id: draft.image_public_id.trim() || null,
      icon: draft.icon,
      accent: draft.accent,
      is_active: draft.is_active,
    };

    if (!payload.name || !payload.slug) {
      return show('A category name is required.', 'error');
    }

    // Remember the outgoing image so it can be tidied up after a successful save.
    const previousImageId = editing?.image_public_id ?? null;

    setBusy(true);
    const { error } = editing
      ? await supabase.from('product_categories').update(payload).eq('id', editing.id)
      : await supabase
          .from('product_categories')
          .insert({ ...payload, sort_order: rows.length + 1 });
    setBusy(false);

    if (error) {
      return show(
        error.code === '23505' ? 'Another category already uses that URL name.' : error.message,
        'error',
      );
    }

    if (previousImageId && previousImageId !== payload.image_public_id) {
      await cleanupMedia([previousImageId]);
    }

    setOpen(false);
    await refresh();
    await revalidateSite(['/products']);
    show(editing ? 'Category updated.' : 'Category created.');
  }

  async function move(row: ProductCategoryRow, dir: -1 | 1) {
    const i = rows.findIndex((r) => r.id === row.id);
    const target = rows[i + dir];
    if (!target) return;

    await Promise.all([
      supabase.from('product_categories').update({ sort_order: target.sort_order }).eq('id', row.id),
      supabase.from('product_categories').update({ sort_order: row.sort_order }).eq('id', target.id),
    ]);
    await refresh();
    await revalidateSite(['/products']);
  }

  async function toggleActive(row: ProductCategoryRow) {
    const { error } = await supabase
      .from('product_categories')
      .update({ is_active: !row.is_active })
      .eq('id', row.id);
    if (error) return show(error.message, 'error');
    await refresh();
    await revalidateSite(['/products']);
    show(row.is_active ? 'Category hidden from the website.' : 'Category is now live.');
  }

  async function confirmDelete() {
    if (!deleting) return;

    // Cascade removes the ranges and products too, so collect their images first.
    const [{ data: subs }, { data: prods }] = await Promise.all([
      supabase.from('product_subcategories').select('id, image_public_id').eq('category_id', deleting.id),
      supabase.from('products').select('image_public_id, subcategory_id'),
    ]);
    const subIds = new Set((subs ?? []).map((s: { id: string }) => s.id));
    const orphanedImages = [
      deleting.image_public_id,
      ...(subs ?? []).map((s: { image_public_id: string | null }) => s.image_public_id),
      ...(prods ?? [])
        .filter((p: { subcategory_id: string }) => subIds.has(p.subcategory_id))
        .map((p: { image_public_id: string | null }) => p.image_public_id),
    ];

    setBusy(true);
    const { error } = await supabase.from('product_categories').delete().eq('id', deleting.id);
    setBusy(false);
    setDeleting(null);
    if (error) return show(error.message, 'error');
    await cleanupMedia(orphanedImages);
    await refresh();
    await revalidateSite(['/products']);
    show('Category deleted.');
  }

  return (
    <>
      <div className="a-page-head">
        <div>
          <h2>Product Categories</h2>
          <p>
            The top level of the products page. Visitors pick a category first, then a range within
            it.
          </p>
        </div>
        <span className="spacer" />
        <button className="a-btn a-btn--primary" onClick={openCreate}>
          <Icon name="arrow" /> New category
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No categories yet"
          message="Create your first product category, such as Pharmaceuticals or Nutraceuticals."
          action={
            <button className="a-btn a-btn--primary" onClick={openCreate}>
              <Icon name="arrow" /> New category
            </button>
          }
        />
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>URL name</th>
                <th>Ranges</th>
                <th>Products</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 11,
                          overflow: 'hidden',
                          flexShrink: 0,
                          background:
                            row.accent === 'green' ? 'var(--green-100)' : 'var(--red-100)',
                          color: row.accent === 'green' ? 'var(--green-700)' : 'var(--red-600)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {row.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cld(row.image_url, { w: 80, h: 80 })}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Icon name={row.icon} style={{ width: 19, height: 19 }} />
                        )}
                      </span>
                      <div>
                        <div className="name">{row.name}</div>
                        {row.tagline && <span className="muted">{row.tagline}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="muted">{row.slug}</td>
                  <td className="muted">{subCounts[row.id] ?? 0}</td>
                  <td className="muted">{productCounts[row.id] ?? 0}</td>
                  <td>
                    <span className={`a-badge ${row.is_active ? 'a-badge--green' : 'a-badge--grey'}`}>
                      {row.is_active ? 'Live' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="a-btn a-btn--subtle a-btn--icon"
                        aria-label="Move up"
                        disabled={i === 0}
                        onClick={() => move(row, -1)}
                      >
                        <Icon name="arrowUp" />
                      </button>
                      <button
                        className="a-btn a-btn--subtle a-btn--icon"
                        aria-label="Move down"
                        disabled={i === rows.length - 1}
                        onClick={() => move(row, 1)}
                        style={{ transform: 'rotate(180deg)' }}
                      >
                        <Icon name="arrowUp" />
                      </button>
                      <Link
                        href={`/admin/subcategories?category=${row.id}`}
                        className="a-btn a-btn--green a-btn--sm"
                      >
                        Ranges
                      </Link>
                      <button className="a-btn a-btn--ghost a-btn--sm" onClick={() => openEdit(row)}>
                        Edit
                      </button>
                      <button
                        className="a-btn a-btn--subtle a-btn--sm"
                        onClick={() => toggleActive(row)}
                      >
                        {row.is_active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        className="a-btn a-btn--danger a-btn--icon"
                        aria-label="Delete"
                        onClick={() => setDeleting(row)}
                      >
                        <Icon name="alert" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal
          title={editing ? `Edit ${editing.name}` : 'New product category'}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="a-btn a-btn--ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="a-btn a-btn--primary" onClick={save} disabled={busy}>
                {busy ? <span className="a-spinner" /> : <Icon name="check" />}
                {editing ? 'Save changes' : 'Create category'}
              </button>
            </>
          }
        >
          <div className="a-grid a-grid-2">
            <div className="a-field">
              <label>Name</label>
              <input
                className="a-input"
                value={draft.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setDraft((d) => ({
                    ...d,
                    name,
                    slug: !editing && (!d.slug || d.slug === slugify(d.name)) ? slugify(name) : d.slug,
                  }));
                }}
                placeholder="Pharmaceuticals"
              />
            </div>
            <div className="a-field">
              <label>URL name</label>
              <input
                className="a-input"
                value={draft.slug}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                placeholder="pharmaceuticals"
              />
            </div>
          </div>

          <div className="a-field">
            <label>Tagline</label>
            <input
              className="a-input"
              value={draft.tagline}
              onChange={(e) => setDraft((d) => ({ ...d, tagline: e.target.value }))}
              placeholder="Quality-assured formulations"
            />
          </div>

          <div className="a-field">
            <label>Description</label>
            <textarea
              className="a-textarea"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Shown in the category panel on the products page."
            />
          </div>

          <ImageField
            label="Category image"
            value={draft.image_url}
            publicId={draft.image_public_id}
            onChange={(url, publicId) =>
              setDraft((d) => ({ ...d, image_url: url, image_public_id: publicId }))
            }
            onClear={() => setDraft((d) => ({ ...d, image_url: '', image_public_id: '' }))}
          />

          <div className="a-grid a-grid-2">
            <div className="a-field">
              <label>Icon</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    background: draft.accent === 'green' ? 'var(--green-100)' : 'var(--red-100)',
                    color: draft.accent === 'green' ? 'var(--green-700)' : 'var(--red-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={draft.icon} style={{ width: 19, height: 19 }} />
                </span>
                <select
                  className="a-select"
                  value={draft.icon}
                  onChange={(e) => setDraft((d) => ({ ...d, icon: e.target.value }))}
                >
                  {ICON_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="a-field">
              <label>Accent colour</label>
              <Segmented<Accent>
                value={draft.accent}
                onChange={(v) => setDraft((d) => ({ ...d, accent: v }))}
                options={[
                  { value: 'red', label: 'Red' },
                  { value: 'green', label: 'Green' },
                ]}
              />
            </div>
          </div>

          <label className="a-check" style={{ marginTop: 8 }}>
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))}
            />
            Show this category on the website
          </label>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this category?"
          message={`"${deleting.name}" will be deleted along with all of its ranges and products. This cannot be undone.`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {toastNode}
    </>
  );
}
