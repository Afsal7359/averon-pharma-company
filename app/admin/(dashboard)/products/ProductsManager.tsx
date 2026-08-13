'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import GalleryField from '@/components/admin/GalleryField';
import ImageField from '@/components/admin/ImageField';
import RichTextField from '@/components/admin/RichTextField';
import { ConfirmDialog, EmptyState, Modal, StringList, useToast } from '@/components/admin/ui';
import { getBrowserClient } from '@/lib/supabase/browser';
import { revalidateSite } from '@/app/actions/revalidate';
import { cleanupMedia } from '@/lib/media-cleanup';
import { cld } from '@/lib/cloudinary';
import { sanitizeHtml } from '@/lib/sanitize';
import { slugify } from '@/lib/slug';
import type { ProductImage } from '@/lib/types';
import type {
  ProductCategoryRow,
  ProductRow,
  ProductSubcategoryRow,
} from '@/lib/supabase/database.types';

interface Props {
  categories: ProductCategoryRow[];
  subcategories: ProductSubcategoryRow[];
  initial: ProductRow[];
  initialSubcategoryId: string | null;
}

interface Draft {
  subcategory_id: string;
  name: string;
  slug: string;
  composition: string;
  description: string;
  image_url: string;
  image_public_id: string;
  pack_size: string;
  dosage_form: string;
  highlights: string[];
  gallery: ProductImage[];
  detail_html: string;
  is_active: boolean;
  is_featured: boolean;
}

export default function ProductsManager({
  categories,
  subcategories,
  initial,
  initialSubcategoryId,
}: Props) {
  const router = useRouter();
  const supabase = getBrowserClient();
  const { show, node: toastNode } = useToast();

  const [rows, setRows] = useState(initial);
  const [search, setSearch] = useState('');

  const initialSub = subcategories.find((s) => s.id === initialSubcategoryId);
  const [categoryFilter, setCategoryFilter] = useState(
    initialSub?.category_id ?? categories[0]?.id ?? '',
  );
  const [subFilter, setSubFilter] = useState(initialSubcategoryId ?? '');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<ProductRow | null>(null);

  const subsInCategory = useMemo(
    () => subcategories.filter((s) => s.category_id === categoryFilter),
    [subcategories, categoryFilter],
  );

  const visible = useMemo(() => {
    const allowed = new Set(
      (subFilter ? subsInCategory.filter((s) => s.id === subFilter) : subsInCategory).map(
        (s) => s.id,
      ),
    );
    return rows
      .filter((r) => allowed.has(r.subcategory_id))
      .filter((r) =>
        search
          ? `${r.name} ${r.composition ?? ''}`.toLowerCase().includes(search.toLowerCase())
          : true,
      )
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [rows, subsInCategory, subFilter, search]);

  async function refresh() {
    const { data } = await supabase.from('products').select('*').order('sort_order');
    setRows((data ?? []) as ProductRow[]);
    router.refresh();
  }

  function openCreate() {
    setDraft({
      subcategory_id: subFilter || subsInCategory[0]?.id || '',
      name: '',
      slug: '',
      composition: '',
      description: '',
      image_url: '',
      image_public_id: '',
      pack_size: '',
      dosage_form: '',
      highlights: [],
      gallery: [],
      detail_html: '',
      is_active: true,
      is_featured: false,
    });
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row: ProductRow) {
    setDraft({
      subcategory_id: row.subcategory_id,
      name: row.name,
      slug: row.slug,
      composition: row.composition ?? '',
      description: row.description ?? '',
      image_url: row.image_url ?? '',
      image_public_id: row.image_public_id ?? '',
      pack_size: row.pack_size ?? '',
      dosage_form: row.dosage_form ?? '',
      highlights: row.highlights ?? [],
      // Rows written before the gallery migration come back without the column.
      gallery: Array.isArray(row.gallery) ? row.gallery : [],
      detail_html: row.detail_html ?? '',
      is_active: row.is_active,
      is_featured: row.is_featured,
    });
    setEditing(row);
    setOpen(true);
  }

  async function save() {
    if (!draft) return;

    const payload = {
      subcategory_id: draft.subcategory_id,
      name: draft.name.trim(),
      slug: slugify(draft.slug || draft.name),
      composition: draft.composition.trim() || null,
      description: draft.description.trim() || null,
      image_url: draft.image_url.trim() || null,
      image_public_id: draft.image_public_id.trim() || null,
      pack_size: draft.pack_size.trim() || null,
      dosage_form: draft.dosage_form.trim() || null,
      highlights: draft.highlights.map((h) => h.trim()).filter(Boolean),
      gallery: draft.gallery.filter((img) => img.url.trim()),
      // Sanitised again on render, but storing clean HTML keeps the database
      // free of anything the public page would refuse to display.
      detail_html: sanitizeHtml(draft.detail_html) || null,
      is_active: draft.is_active,
      is_featured: draft.is_featured,
    };

    if (!payload.subcategory_id) return show('Choose a range for this product.', 'error');
    if (!payload.name || !payload.slug) return show('A product name is required.', 'error');

    // Images dropped from the main slot or the gallery during this edit.
    const keptIds = new Set(
      [payload.image_public_id, ...payload.gallery.map((img) => img.public_id)].filter(Boolean),
    );
    const orphaned = [
      editing?.image_public_id,
      ...(Array.isArray(editing?.gallery) ? editing.gallery.map((img) => img.public_id) : []),
    ].filter((id): id is string => Boolean(id) && !keptIds.has(id!));

    setBusy(true);
    const { error } = editing
      ? await supabase.from('products').update(payload).eq('id', editing.id)
      : await supabase.from('products').insert({
          ...payload,
          sort_order: rows.filter((r) => r.subcategory_id === payload.subcategory_id).length + 1,
        });
    setBusy(false);

    if (error) {
      return show(
        error.code === '23505'
          ? 'Another product in this range already uses that URL name.'
          : error.message,
        'error',
      );
    }

    if (orphaned.length) await cleanupMedia(orphaned);

    setOpen(false);
    await refresh();
    await revalidateSite(pathsFor(payload.subcategory_id, payload.slug));
    show(editing ? 'Product updated.' : 'Product added.');
  }

  async function toggle(row: ProductRow, field: 'is_active' | 'is_featured') {
    const patch =
      field === 'is_active' ? { is_active: !row.is_active } : { is_featured: !row.is_featured };

    const { error } = await supabase.from('products').update(patch).eq('id', row.id);
    if (error) return show(error.message, 'error');
    await refresh();
    await revalidateSite(pathsFor(row.subcategory_id, row.slug));
  }

  async function move(row: ProductRow, dir: -1 | 1) {
    // Reorder within the product's own range, not the filtered view.
    const siblings = rows
      .filter((r) => r.subcategory_id === row.subcategory_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const i = siblings.findIndex((r) => r.id === row.id);
    const target = siblings[i + dir];
    if (!target) return;

    await Promise.all([
      supabase.from('products').update({ sort_order: target.sort_order }).eq('id', row.id),
      supabase.from('products').update({ sort_order: row.sort_order }).eq('id', target.id),
    ]);
    await refresh();
    await revalidateSite(pathsFor(row.subcategory_id, row.slug));
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    const orphanedImages = [
      deleting.image_public_id,
      ...(Array.isArray(deleting.gallery) ? deleting.gallery.map((img) => img.public_id) : []),
    ];
    const { subcategory_id, slug } = deleting;
    const { error } = await supabase.from('products').delete().eq('id', deleting.id);
    setBusy(false);
    setDeleting(null);
    if (error) return show(error.message, 'error');
    await cleanupMedia(orphanedImages);
    await refresh();
    await revalidateSite(pathsFor(subcategory_id, slug));
    show('Product deleted.');
  }

  const subName = (id: string) => subcategories.find((s) => s.id === id)?.name ?? '—';

  /** Products live under their category's URL, so that's what needs rebuilding. */
  const categorySlugForSub = (subcategoryId: string) => {
    const sub = subcategories.find((s) => s.id === subcategoryId);
    return categories.find((c) => c.id === sub?.category_id)?.slug ?? '';
  };

  const pathsFor = (subcategoryId: string, productSlug?: string) => {
    const category = categorySlugForSub(subcategoryId);
    if (!category) return ['/products'];
    return [
      '/products',
      `/products/${category}`,
      ...(productSlug ? [`/products/${category}/${productSlug}`] : []),
    ];
  };

  if (subcategories.length === 0) {
    return (
      <>
        <div className="a-page-head">
          <div>
            <h2>Products</h2>
          </div>
        </div>
        <EmptyState
          title="Create a range first"
          message="Products belong to a range inside a category. Add a category and a range, then come back here."
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
          <h2>Products</h2>
          <p>Products appear on the website under the range you assign them to.</p>
        </div>
        <span className="spacer" />
        <button className="a-btn a-btn--primary" onClick={openCreate}>
          <Icon name="arrow" /> New product
        </button>
      </div>

      <div className="a-card">
        <div className="a-grid a-grid-3" style={{ marginBottom: 0 }}>
          <div className="a-field" style={{ marginBottom: 0 }}>
            <label>Category</label>
            <select
              className="a-select"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setSubFilter('');
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="a-field" style={{ marginBottom: 0 }}>
            <label>Range</label>
            <select
              className="a-select"
              value={subFilter}
              onChange={(e) => setSubFilter(e.target.value)}
            >
              <option value="">All ranges in this category</option>
              {subsInCategory.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.is_default ? ' (default)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="a-field" style={{ marginBottom: 0 }}>
            <label>Search</label>
            <input
              className="a-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or composition…"
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {visible.length === 0 ? (
          <EmptyState
            title="No products here yet"
            message="Add your first product to this range — name, composition, pack size and an image."
            action={
              <button className="a-btn a-btn--primary" onClick={openCreate}>
                <Icon name="arrow" /> New product
              </button>
            }
          />
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Range</th>
                  <th>Form / Pack</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row, i) => (
                  <tr key={row.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            overflow: 'hidden',
                            flexShrink: 0,
                            background: 'var(--paper)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--ink-faint)',
                          }}
                        >
                          {row.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cld(row.image_url, { w: 88, h: 88 })}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Icon name="capsule" style={{ width: 18, height: 18 }} />
                          )}
                        </span>
                        <div>
                          <div className="name">{row.name}</div>
                          {row.composition && <span className="muted">{row.composition}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="muted">{subName(row.subcategory_id)}</td>
                    <td className="muted">
                      {[row.dosage_form, row.pack_size].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span
                          className={`a-badge ${row.is_active ? 'a-badge--green' : 'a-badge--grey'}`}
                        >
                          {row.is_active ? 'Live' : 'Hidden'}
                        </span>
                        {row.is_featured && <span className="a-badge a-badge--red">Featured</span>}
                      </div>
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
                        <button
                          className="a-btn a-btn--ghost a-btn--sm"
                          onClick={() => openEdit(row)}
                        >
                          Edit
                        </button>
                        <button
                          className="a-btn a-btn--subtle a-btn--sm"
                          onClick={() => toggle(row, 'is_featured')}
                        >
                          {row.is_featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          className="a-btn a-btn--subtle a-btn--sm"
                          onClick={() => toggle(row, 'is_active')}
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
          title={editing ? `Edit ${editing.name}` : 'New product'}
          onClose={() => setOpen(false)}
          wide
          footer={
            <>
              <button className="a-btn a-btn--ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="a-btn a-btn--primary" onClick={save} disabled={busy}>
                {busy ? <span className="a-spinner" /> : <Icon name="check" />}
                {editing ? 'Save changes' : 'Add product'}
              </button>
            </>
          }
        >
          <div className="a-field">
            <label>Range</label>
            <select
              className="a-select"
              value={draft.subcategory_id}
              onChange={(e) => setDraft({ ...draft, subcategory_id: e.target.value })}
            >
              {categories.map((c) => (
                <optgroup key={c.id} label={c.name}>
                  {subcategories
                    .filter((s) => s.category_id === c.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                        {s.is_default ? ' (default)' : ''}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="a-grid a-grid-2">
            <div className="a-field">
              <label>Product name</label>
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
                placeholder="Averocef 200"
              />
            </div>
            <div className="a-field">
              <label>URL name</label>
              <input
                className="a-input"
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                placeholder="averocef-200"
              />
            </div>
          </div>

          <div className="a-field">
            <label>Composition</label>
            <input
              className="a-input"
              value={draft.composition}
              onChange={(e) => setDraft({ ...draft, composition: e.target.value })}
              placeholder="Cefixime 200 mg"
            />
          </div>

          <div className="a-field">
            <label>Description</label>
            <textarea
              className="a-textarea"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="A short description shown on the product card."
            />
          </div>

          <ImageField
            label="Main image"
            value={draft.image_url}
            publicId={draft.image_public_id}
            onChange={(url, publicId) =>
              setDraft({ ...draft, image_url: url, image_public_id: publicId })
            }
            onClear={() => setDraft({ ...draft, image_url: '', image_public_id: '' })}
            hint="Used on the product card. Products without an image show a branded placeholder."
          />

          <GalleryField
            label="More images"
            value={draft.gallery}
            onChange={(gallery) => setDraft({ ...draft, gallery })}
          />

          <div className="a-grid a-grid-2">
            <div className="a-field">
              <label>Dosage form</label>
              <input
                className="a-input"
                value={draft.dosage_form}
                onChange={(e) => setDraft({ ...draft, dosage_form: e.target.value })}
                placeholder="Tablet"
              />
            </div>
            <div className="a-field">
              <label>Pack size</label>
              <input
                className="a-input"
                value={draft.pack_size}
                onChange={(e) => setDraft({ ...draft, pack_size: e.target.value })}
                placeholder="10 x 10 Tablets"
              />
            </div>
          </div>

          <StringList
            label="Highlights (small tags on the card)"
            values={draft.highlights}
            onChange={(v) => setDraft({ ...draft, highlights: v })}
            placeholder="Broad spectrum"
          />

          <RichTextField
            label="Full details"
            value={draft.detail_html}
            onChange={(html) => setDraft({ ...draft, detail_html: html })}
            hint="The long description on the product's own page — indications, dosage, storage. Leave empty to hide that section."
          />

          <div className="a-check-row" style={{ marginTop: 8 }}>
            <label className="a-check">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
              />
              Show on the website
            </label>
            <label className="a-check">
              <input
                type="checkbox"
                checked={draft.is_featured}
                onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })}
              />
              Mark as featured
            </label>
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this product?"
          message={`"${deleting.name}" will be permanently removed from the website.`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {toastNode}
    </>
  );
}
