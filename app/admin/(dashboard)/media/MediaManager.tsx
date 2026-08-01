'use client';

import { useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { ConfirmDialog, EmptyState, Modal, useToast } from '@/components/admin/ui';
import { getBrowserClient } from '@/lib/supabase/browser';
import { cld, isCloudinaryConfigured } from '@/lib/cloudinary';
import type { MediaAssetRow } from '@/lib/supabase/database.types';

function formatBytes(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaManager({ initial }: { initial: MediaAssetRow[] }) {
  const supabase = getBrowserClient();
  const { show, node: toastNode } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [assets, setAssets] = useState(initial);
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(0);
  const [viewing, setViewing] = useState<MediaAssetRow | null>(null);
  const [deleting, setDeleting] = useState<MediaAssetRow | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = assets.filter((a) =>
    query ? a.public_id.toLowerCase().includes(query.toLowerCase()) : true,
  );

  async function refresh() {
    const { data } = await supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setAssets((data ?? []) as MediaAssetRow[]);
  }

  async function uploadFiles(files: FileList) {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;

    setUploading(list.length);

    try {
      const signRes = await fetch('/api/admin/cloudinary/sign', { method: 'POST' });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || 'Could not start upload.');

      for (const file of list) {
        const form = new FormData();
        form.append('file', file);
        form.append('api_key', sign.apiKey);
        form.append('timestamp', String(sign.timestamp));
        form.append('folder', sign.folder);
        form.append('signature', sign.signature);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
          { method: 'POST', body: form },
        );
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error?.message || 'Upload failed.');

        await supabase.from('media_assets').upsert(
          {
            public_id: result.public_id,
            url: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            folder: sign.folder,
          },
          { onConflict: 'public_id' },
        );

        setUploading((n) => n - 1);
      }

      await refresh();
      show(`Uploaded ${list.length} image${list.length === 1 ? '' : 's'}.`);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Upload failed.', 'error');
    } finally {
      setUploading(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);

    const res = await fetch('/api/admin/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId: deleting.public_id }),
    });
    const json = await res.json().catch(() => ({}));

    setBusy(false);
    setDeleting(null);
    setViewing(null);

    if (!res.ok) return show(json.error || 'Could not delete the image.', 'error');

    await refresh();
    show('Image deleted.');
  }

  return (
    <>
      <div className="a-page-head">
        <div>
          <h2>Media Library</h2>
          <p>
            Every image used on the website is stored in Cloudinary and listed here for reuse
            anywhere in the admin panel.
          </p>
        </div>
        <span className="spacer" />
        <button
          className="a-btn a-btn--primary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading > 0 || !isCloudinaryConfigured}
        >
          {uploading > 0 ? (
            <>
              <span className="a-spinner" /> Uploading {uploading}…
            </>
          ) : (
            <>
              <Icon name="arrowUp" /> Upload images
            </>
          )}
        </button>
      </div>

      {!isCloudinaryConfigured && (
        <div className="a-alert a-alert--warn">
          <Icon name="alert" />
          <span>
            Cloudinary isn&rsquo;t configured, so uploading is disabled. Add your Cloudinary
            environment variables to enable it.
          </span>
        </div>
      )}

      <div className="a-card">
        <div className="a-field" style={{ marginBottom: 0 }}>
          <label>Search</label>
          <input
            className="a-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by file name…"
          />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {filtered.length === 0 ? (
          <EmptyState
            title={assets.length === 0 ? 'No images yet' : 'No matches'}
            message={
              assets.length === 0
                ? 'Upload images here, or from any image field elsewhere in the admin panel.'
                : 'Try a different search term.'
            }
          />
        ) : (
          <div className="media-grid">
            {filtered.map((asset) => (
              <button key={asset.id} className="media-tile" onClick={() => setViewing(asset)}>
                <div className="thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cld(asset.url, { w: 400, h: 300 })} alt={asset.alt ?? ''} />
                </div>
                <div className="meta">
                  <strong>{asset.public_id.split('/').pop()}</strong>
                  <span>
                    {asset.width}×{asset.height} · {formatBytes(asset.bytes)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />

      {viewing && (
        <Modal
          title={viewing.public_id.split('/').pop() ?? 'Image'}
          onClose={() => setViewing(null)}
          footer={
            <>
              <button
                className="a-btn a-btn--ghost"
                onClick={() => {
                  navigator.clipboard.writeText(viewing.url);
                  show('Image URL copied.');
                }}
              >
                Copy URL
              </button>
              <button className="a-btn a-btn--danger" onClick={() => setDeleting(viewing)}>
                <Icon name="alert" /> Delete
              </button>
            </>
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cld(viewing.url, { w: 900, crop: 'limit' })}
            alt={viewing.alt ?? ''}
            style={{ width: '100%', borderRadius: 12, marginBottom: 18 }}
          />
          <div className="a-grid a-grid-2">
            <div className="a-field">
              <label>Dimensions</label>
              <div className="a-hint">
                {viewing.width}×{viewing.height} · {viewing.format?.toUpperCase()} ·{' '}
                {formatBytes(viewing.bytes)}
              </div>
            </div>
            <div className="a-field">
              <label>Uploaded</label>
              <div className="a-hint">{new Date(viewing.created_at).toLocaleString()}</div>
            </div>
          </div>
          <div className="a-field">
            <label>URL</label>
            <input className="a-input" readOnly value={viewing.url} onFocus={(e) => e.target.select()} />
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this image?"
          message="It will be removed from Cloudinary. Any page still using it will show a broken image, so check first."
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {toastNode}
    </>
  );
}
