'use client';

import { useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { cld } from '@/lib/cloudinary';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { ProductImage } from '@/lib/types';
import MediaPicker from './MediaPicker';

interface Props {
  label?: string;
  value: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  hint?: string;
}

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Multi-image field for the product gallery.
 *
 * Same signed-upload path as ImageField, but accepts several files at once and
 * keeps them in an explicit order — the first image is what the detail page
 * opens on. Images can also be pulled from the media library.
 */
export default function GalleryField({
  label = 'Gallery',
  value,
  onChange,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  async function uploadOne(file: File): Promise<ProductImage | null> {
    if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image.`);
    if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than 10 MB.`);

    const signRes = await fetch('/api/admin/cloudinary/sign', { method: 'POST' });
    const sign = await signRes.json();
    if (!signRes.ok) throw new Error(sign.error || 'Could not start upload.');

    const form = new FormData();
    form.append('file', file);
    form.append('api_key', sign.apiKey);
    form.append('timestamp', String(sign.timestamp));
    form.append('folder', sign.folder);
    form.append('signature', sign.signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Upload failed.');

    await getBrowserClient()
      .from('media_assets')
      .upsert(
        {
          public_id: json.public_id,
          url: json.secure_url,
          format: json.format,
          width: json.width,
          height: json.height,
          bytes: json.bytes,
          folder: sign.folder,
        },
        { onConflict: 'public_id' },
      );

    return { url: json.secure_url, public_id: json.public_id, alt: '' };
  }

  async function uploadMany(files: File[]) {
    setError('');
    setProgress({ done: 0, total: files.length });

    const added: ProductImage[] = [];
    for (const [i, file] of files.entries()) {
      try {
        const image = await uploadOne(file);
        if (image) added.push(image);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed.');
      }
      setProgress({ done: i + 1, total: files.length });
    }

    // One state update at the end so a part-failed batch still keeps what worked.
    if (added.length) onChange([...value, ...added]);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function setAlt(index: number, alt: string) {
    onChange(value.map((img, i) => (i === index ? { ...img, alt } : img)));
  }

  return (
    <div className="a-field">
      <label>
        {label}
        {value.length > 0 && <span className="gal-count">{value.length}</span>}
      </label>

      <div className="a-btn-row" style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="a-btn a-btn--ghost a-btn--sm"
          onClick={() => inputRef.current?.click()}
          disabled={progress !== null}
        >
          {progress ? (
            <>
              <span className="a-spinner a-spinner--dark" /> {progress.done}/{progress.total}
            </>
          ) : (
            <>
              <Icon name="arrowUp" /> Upload images
            </>
          )}
        </button>

        <button
          type="button"
          className="a-btn a-btn--subtle a-btn--sm"
          onClick={() => setPickerOpen(true)}
          disabled={progress !== null}
        >
          <Icon name="eye" /> From library
        </button>
      </div>

      {value.length === 0 ? (
        <div className="gal-empty">
          No extra images yet. The main product image is used on its own.
        </div>
      ) : (
        <ul className="gal-list">
          {value.map((img, i) => (
            <li className="gal-item" key={`${img.public_id || img.url}-${i}`}>
              <span className="gal-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cld(img.url, { w: 160, h: 160 })} alt="" />
                {i === 0 && <span className="gal-badge">Main</span>}
              </span>

              <div className="gal-meta">
                <input
                  className="a-input a-input--sm"
                  value={img.alt}
                  onChange={(e) => setAlt(i, e.target.value)}
                  placeholder="Describe this image (for accessibility & SEO)"
                />
                <div className="gal-actions">
                  <button
                    type="button"
                    className="a-btn a-btn--subtle a-btn--icon"
                    aria-label="Move left"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <Icon name="arrowUp" style={{ transform: 'rotate(-90deg)' }} />
                  </button>
                  <button
                    type="button"
                    className="a-btn a-btn--subtle a-btn--icon"
                    aria-label="Move right"
                    disabled={i === value.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <Icon name="arrowUp" style={{ transform: 'rotate(90deg)' }} />
                  </button>
                  <button
                    type="button"
                    className="a-btn a-btn--danger a-btn--sm"
                    onClick={() => remove(i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <div className="a-hint" style={{ color: 'var(--red-600)' }}>{error}</div>}
      <div className="a-hint">
        {hint ??
          'Shown as a thumbnail strip on the product detail page. The first image opens by default — use the arrows to reorder.'}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) uploadMany(files);
        }}
      />

      {pickerOpen && (
        <MediaPicker
          onClose={() => setPickerOpen(false)}
          onSelect={(asset) => {
            onChange([...value, { url: asset.url, public_id: asset.public_id, alt: asset.alt ?? '' }]);
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
