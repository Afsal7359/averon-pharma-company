'use client';

import { useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { cld } from '@/lib/cloudinary';
import { getBrowserClient } from '@/lib/supabase/browser';
import MediaPicker from './MediaPicker';

interface Props {
  label?: string;
  value?: string | null;
  publicId?: string | null;
  onChange: (url: string, publicId: string) => void;
  onClear?: () => void;
  hint?: string;
}

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Upload-or-pick image control used everywhere in the admin panel.
 * Uploads go directly to Cloudinary with a server-issued signature, then get
 * indexed in media_assets so they show up in the library.
 */
export default function ImageField({
  label = 'Image',
  value,
  publicId,
  onChange,
  onClear,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  async function upload(file: File) {
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image is larger than 10 MB. Please compress it first.');
      return;
    }

    setProgress(0);

    try {
      const signRes = await fetch('/api/admin/cloudinary/sign', { method: 'POST' });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || 'Could not start upload.');

      const form = new FormData();
      form.append('file', file);
      form.append('api_key', sign.apiKey);
      form.append('timestamp', String(sign.timestamp));
      form.append('folder', sign.folder);
      form.append('signature', sign.signature);

      // XHR rather than fetch: it reports upload progress.
      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            xhr.status >= 200 && xhr.status < 300
              ? resolve(json)
              : reject(new Error(json?.error?.message || 'Upload failed.'));
          } catch {
            reject(new Error('Upload failed.'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload.'));
        xhr.send(form);
      });

      // Index it so the media library can offer it for reuse.
      await getBrowserClient()
        .from('media_assets')
        .upsert(
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

      onChange(result.secure_url, result.public_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="a-field">
      <label>{label}</label>

      <div className="img-field">
        <div className="img-preview">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cld(value, { w: 320, h: 240 })} alt="" />
          ) : (
            <Icon name="eye" />
          )}
        </div>

        <div className="img-actions">
          <div className="a-btn-row">
            <button
              type="button"
              className="a-btn a-btn--ghost a-btn--sm"
              onClick={() => inputRef.current?.click()}
              disabled={progress !== null}
            >
              {progress !== null ? (
                <>
                  <span className="a-spinner a-spinner--dark" /> {progress}%
                </>
              ) : (
                <>
                  <Icon name="arrowUp" /> Upload
                </>
              )}
            </button>

            <button
              type="button"
              className="a-btn a-btn--subtle a-btn--sm"
              onClick={() => setPickerOpen(true)}
              disabled={progress !== null}
            >
              <Icon name="eye" /> Library
            </button>

            {value && onClear && (
              <button type="button" className="a-btn a-btn--danger a-btn--sm" onClick={onClear}>
                Remove
              </button>
            )}
          </div>

          <input
            className="a-input"
            placeholder="…or paste an image URL"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value, '')}
          />

          {progress !== null && (
            <div className="img-progress">
              <span style={{ width: `${progress}%` }} />
            </div>
          )}

          {publicId && <div className="a-hint">Cloudinary ID: {publicId}</div>}
          {hint && !publicId && <div className="a-hint">{hint}</div>}
          {error && <div className="a-hint" style={{ color: 'var(--red-600)' }}>{error}</div>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />

      {pickerOpen && (
        <MediaPicker
          onClose={() => setPickerOpen(false)}
          onSelect={(asset) => {
            onChange(asset.url, asset.public_id);
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
