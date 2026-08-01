'use client';

import { useEffect, useState } from 'react';
import { cld } from '@/lib/cloudinary';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { MediaAssetRow } from '@/lib/supabase/database.types';
import { EmptyState, Modal } from './ui';

interface Props {
  onSelect: (asset: MediaAssetRow) => void;
  onClose: () => void;
}

/** Browse previously uploaded Cloudinary assets and reuse one. */
export default function MediaPicker({ onSelect, onClose }: Props) {
  const [assets, setAssets] = useState<MediaAssetRow[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getBrowserClient()
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(120)
      .then(({ data }) => setAssets((data ?? []) as MediaAssetRow[]));
  }, []);

  const filtered = (assets ?? []).filter((a) =>
    query ? a.public_id.toLowerCase().includes(query.toLowerCase()) : true,
  );

  return (
    <Modal title="Media library" onClose={onClose} wide>
      <div className="a-field">
        <input
          className="a-input"
          placeholder="Search by file name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {assets === null ? (
        <div className="a-loading">
          <span className="a-spinner a-spinner--dark" /> Loading media…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          message="Images you upload anywhere in the admin panel appear here for reuse."
        />
      ) : (
        <div className="media-grid">
          {filtered.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className="media-tile"
              onClick={() => onSelect(asset)}
            >
              <div className="thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cld(asset.url, { w: 320, h: 240 })} alt="" />
              </div>
              <div className="meta">
                <strong>{asset.public_id.split('/').pop()}</strong>
                <span>
                  {asset.width}×{asset.height}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
