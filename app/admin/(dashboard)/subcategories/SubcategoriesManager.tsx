'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import ImageField from '@/components/admin/ImageField';
import { ConfirmDialog, EmptyState, Modal, useToast } from '@/components/admin/ui';
import { getBrowserClient } from '@/lib/supabase/browser';
import { revalidateSite } from '@/app/actions/revalidate';
import { cleanupMedia } from '@/lib/media-cleanup';
import { slugify } from '@/lib/slug';
import type {
  ProductCategoryRow,
  ProductSubcategoryRow,
} from '@/lib/supabase/database.types';

interface Props {
  categories: ProductCategoryRow[];
  initial: ProductSubcategoryRow[];
  productCounts: Record<string, number>;
  initialCategoryId: string | null;
}

interface Draft {
  category_id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  image_public_id: string;
  is_default: boolean;
  is_active: boolean;
}

export default function SubcategoriesManager({
  categories,
  initial,
  productCounts,
  initialCategoryId,
}: Props) {
  const router = useRouter();
  const supabase = getBrowserClient();
  const { show, node: toastNode } = useToast();

  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState(initialCategoryId ?? categories[0]?.id ?? '');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductSubcategoryRow | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<ProductSubcategoryRow | null>(null);

  const visible = useMemo(
    () =>
      rows
        .filter((r) => (filter ? r.category_id === filter : true))
        .sort((a, b) => a.sort_order - b.sort_order),
    [rows, filter],
  );

  async function refresh() {
    const { data } = await supabase
      .from('product_subcategories')
      .select('*')
      .order('sort_order');
    setRows((data ?? []) as ProductSubcategoryRow[]);
    router.refresh();
  }

  function openCreate() {
    setDraft({
      category_id: filter || categories[0]?.id || '',
      name: '',
      slug: '',
      description: '',
      image_url: '',
      image_public_id: '',
      // First range in a category becomes the default automatically.
      is_default: visible.length === 0,
      is_active: true,
    });
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row: ProductSubcategoryRow) {
    setDraft({
      category_id: row.category_id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? '',
      image_url: row.image_url ?? '',
      image_public_id: row.image_public_id ?? '',
      is_default: row.is_default,
      is_active: row.is_active,
    });
    setEditing(row);
    setOpen(true);
  }

  async function save() {
    if (!draft) return;

    const payload = {
      category_id: draft.category_id,
      name: draft.name.trim(),
      slug: slugify(draft.slug || draft.name),
      description: draft.description.trim() || null,
      image_url: draft.image_url.trim() || null,
      image_public_id: draft.image_public_id.trim() || null,
      is_default: draft.is_default,
      is_active: draft.is_active,
    };

    if (!payload.category_id) return show('Choose a category first.', 'error');
    if (!payload.name || !payload.slug) return show('A range name is required.', 'error');

    const previousImageId = editing?.image_public_id ?? null;

    setBusy(true);
    const { error } = editing
      ? await supabase.from('product_subcategories').update(payload).eq('id', editing.id)
      : await supabase.from('product_subcategories').insert({
          ...payload,
          sort_order: rows.filter((r) => r.category_id === payload.category_id).length + 1,
        });
    setBusy(false);

    if (error) {
      return show(
        error.code === '23505'
          ? 'Another range in this category already uses that URL name.'
          : error.message,
        'error',
      );
    }

    if (previousImageId && previousImageId !== payload.image_public_id) {
      await cleanupMedia([previousImageId]);
    }

    setOpen(false);
    await refresh();
    await revalidateSite(['/products']);
    show(editing ? 'Range updated.' : 'Range created.');
  }

  /** A database trigger clears the flag on siblings, so this is a single update. */
  async function makeDefault(row: ProductSubcategoryRow) {
    const { error } = await supabase
      .from('product_subcategories')
      .update({ is_default: true })
      .eq('id', row.id);
    if (error) return show(error.message, 'error');
    await refresh();
    await revalidateSite(['/products']);
    show(`"${row.name}" is now the default range for this category.`);
  }

  async function toggleActive(row: ProductSubcategoryRow) {
    const { error } = await supabase
      .from('product_subcategories')
      .update({ is_active: !row.is_active })
      .eq('id', row.id);
    if (error) return show(error.message, 'error');
    await refresh();
    await revalidateSite(['/products']);
  }

  async function move(row: ProductSubcategoryRow, dir: -1 | 1) {
    const i = visible.findIndex((r) => r.id === row.id);
    const target = visible[i + dir];
    if (!target) return;

    await Promise.all([
      supabase
        .from('product_subcategories')
        .update({ sort_order: target.sort_order })
        .eq('id', row.id),
      supabase
        .from('product_subcategories')
        .update({ sort_order: row.sort_order })
        .eq('id', target.id),
    ]);
    await refresh();
    await revalidateSite(['/products']);
  }

  async function confirmDelete() {
    if (!deleting) return;

    // Products inside this range are cascade-deleted — collect their images too.
    const { data: prods } = await supabase
      .from('products')
      .select('image_public_id')
      .eq('subcategory_id', deleting.id);
    const orphanedImages = [
      deleting.image_public_id,
      ...(prods ?? []).map((p: { image_public_id: string | null }) => p.image_public_id),
    ];

    setBusy(true);
    const { error } = await supabase.from('product_subcategories').delete().eq('id', deleting.id);
    setBusy(false);
    setDeleting(null);
    if (error) return show(error.message, 'error');
    await cleanupMedia(orphanedImages);
    await refresh();
    await revalidateSite(['/products']);
    show('Range deleted.');
  }

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '—';
  const hasDefault = visible.some((r) => r.is_default);

  if (categories.length === 0) {
    return (
      <>
        <div className="a-page-head">
          <div>
            <h2>Subcategories (Ranges)</h2>
          </div>
        </div>
        <EmptyState
          title="Create a category first"
          message="Ranges live inside a product category, so start by adding at least one category."
          action={
            <Link href="/admin/categories" className="a-btn a-btn--primary">
              Go to Categories
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <div className="a-page-head">
        <div>
          <h2>Subcategories (Ranges)</h2>
          <p>
            Each category opens on its <strong>default</strong> range. Visitors can switch to any
            other range from the picker on the products page.
          </p>
        </div>
        <span className="spacer" />
        <button className="a-btn a-btn--primary" onClick={openCreate}>
          <Icon name="arrow" /> New range
        </button>
      </div>

      <div className="a-card">
        <div className="a-card-head a-card-head--plain" style={{ marginBottom: 0 }}>
          <div className="a-field" style={{ marginBottom: 0, minWidth: 260 }}>
            <label>Category</label>
            <select
              className="a-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!hasDefault && visible.length > 0 && (
        <div className="a-alert a-alert--warn" style={{ marginTop: 16 }}>
          <Icon name="alert" />
          <span>
            No default range is set for {categoryName(filter)}. The website will fall back to the
            first range in the list — set one explicitly to be sure.
          </span>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {visible.length === 0 ? (
          <EmptyState
            title="No ranges in this category yet"
            message="Add a range such as Anti-Infectives or Vitamins & Minerals, then add products to it."
            action={
              <button className="a-btn a-btn--primary" onClick={openCreate}>
                <Icon name="arrow" /> New range
              </button>
            }
          />
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Range</th>
                  <th>URL name</th>
                  <th>Products</th>
                  <th>Default</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row, i) => (
                  <tr key={row.id}>
                    <td>
                      <div className="name">{row.name}</div>
                      {row.description && (
                        <span className="muted">
                          {row.description.slice(0, 70)}
                          {row.description.length > 70 ? '…' : ''}
                        </span>
                      )}
                    </td>
                    <td className="muted">{row.slug}</td>
                    <td className="muted">{productCounts[row.id] ?? 0}</td>
                    <td>
                      {row.is_default ? (
                        <span className="a-badge a-badge--green">Default</span>
                      ) : (
                        <button
                          className="a-btn a-btn--subtle a-btn--sm"
                          onClick={() => makeDefault(row)}
                        >
                          Make default
                        </button>
                      )}
                    </td>
                    <td>
                      <span
                        className={`a-badge ${row.is_active ? 'a-badge--green' : 'a-badge--grey'}`}
                      >
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
                          disabled={i === visible.length - 1}
                          onClick={() => move(row, 1)}
                          style={{ transform: 'rotate(180deg)' }}
                        >
                          <Icon name="arrowUp" />
                        </button>
                        <Link
                          href={`/admin/products?subcategory=${row.id}`}
                          className="a-btn a-btn--green a-btn--sm"
                        >
                          Products
                        </Link>
                        <button
                          className="a-btn a-btn--ghost a-btn--sm"
                          onClick={() => openEdit(row)}
                        >
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
      </div>

      {open && draft && (
        <Modal
          title={editing ? `Edit ${editing.name}` : 'New range'}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="a-btn a-btn--ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="a-btn a-btn--primary" onClick={save} disabled={busy}>
                {busy ? <span className="a-spinner" /> : <Icon name="check" />}
                {editing ? 'Save changes' : 'Create range'}
              </button>
            </>
          }
        >
          <div className="a-field">
            <label>Category</label>
            <select
              className="a-select"
              value={draft.category_id}
              onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="a-grid a-grid-2">
            <div className="a-field">
              <label>Range name</label>
              <input
                className="a-input"
                value={draft.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setDraft({
                    ...draft,
                    name,
                    slug:
                      !editing && (!draft.slug || draft.slug === slugify(draft.name))
                        ? slugify(name)
                        : draft.slug,
                  });
                }}
                placeholder="Anti-Infectives"
              />
            </div>
            <div className="a-field">
              <label>URL name</label>
              <input
                className="a-input"
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                placeholder="anti-infectives"
              />
            </div>
          </div>

          <div className="a-field">
            <label>Description</label>
            <textarea
              className="a-textarea"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Shown above the product list when this range is selected."
            />
          </div>

          <ImageField
            label="Range image (optional)"
            value={draft.image_url}
            publicId={draft.image_public_id}
            onChange={(url, publicId) =>
              setDraft({ ...draft, image_url: url, image_public_id: publicId })
            }
            onClear={() => setDraft({ ...draft, image_url: '', image_public_id: '' })}
          />

          <div className="a-check-row" style={{ marginTop: 8 }}>
            <label className="a-check">
              <input
                type="checkbox"
                checked={draft.is_default}
                onChange={(e) => setDraft({ ...draft, is_default: e.target.checked })}
              />
              Open this range by default
            </label>
            <label className="a-check">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
              />
              Show on the website
            </label>
          </div>
          <div className="a-hint">
            Setting a range as default automatically clears the flag from the other ranges in the
            same category.
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this range?"
          message={`"${deleting.name}" and all products inside it will be permanently removed.`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {toastNode}
    </>
  );
}
