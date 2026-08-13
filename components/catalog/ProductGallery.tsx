'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import SmartImage from '@/components/SmartImage';
import type { ProductImage } from '@/lib/types';

interface Props {
  images: ProductImage[];
  productName: string;
}

/**
 * Main image with a thumbnail strip. Falls back to a branded placeholder when a
 * product has no imagery at all, so the layout never collapses.
 */
export default function ProductGallery({ images, productName }: Props) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div className="pd-gallery">
        <div className="pd-main pd-main--empty">
          <Icon name="capsule" />
        </div>
      </div>
    );
  }

  return (
    <div className="pd-gallery">
      <div className="pd-main">
        <SmartImage
          key={current.url}
          src={current.url}
          alt={current.alt || productName}
          width={900}
          height={900}
          crop="fit"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="pd-thumbs" role="tablist" aria-label={`${productName} images`}>
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={img.alt || `${productName} image ${i + 1}`}
              className={`pd-thumb${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              <SmartImage src={img.url} alt="" width={200} height={200} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
