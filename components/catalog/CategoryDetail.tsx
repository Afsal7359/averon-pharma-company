'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import SmartImage from '@/components/SmartImage';
import type { CatalogCategory } from '@/lib/types';

interface Props {
  category: CatalogCategory;
  emptyText?: string;
}

/**
 * One category: its ranges and the products inside the selected range.
 *
 * The default range (flagged in the admin, sorted first by getCatalog) is
 * selected on arrival. Switching range is a sidebar list on desktop; on mobile
 * it's a button that expands a full-width list directly beneath it.
 */
export default function CategoryDetail({ category, emptyText }: Props) {
  const ranges = category.subcategories;
  const [activeId, setActiveId] = useState(ranges[0]?.id ?? '');
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const active = ranges.find((r) => r.id === activeId) ?? ranges[0];
  const products = active?.products ?? [];

  // Close the mobile picker on outside tap or Escape.
  useEffect(() => {
    if (!pickerOpen) return;

    const onPointer = (e: PointerEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setPickerOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPickerOpen(false);

    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  const fallbackEmpty =
    emptyText || 'Products for this range are being added shortly. Please check back soon.';

  return (
    <>
      {/* ---------- Category header ---------- */}
      <section className="cat-detail-hero">
        <div className="container">
          <div>
            <Link href="/products" className="cat-back">
              <Icon name="arrow" />
              All categories
            </Link>

            <div className="crumb">
              <Link href="/">Home</Link> / <Link href="/products">Products</Link> /{' '}
              <span className="current">{category.name}</span>
            </div>

            <h1 className="reveal">{category.name}</h1>
            {category.description && <p className="lede reveal">{category.description}</p>}
          </div>

          {category.image_url && (
            <div className="cat-detail-media reveal-scale">
              <SmartImage
                src={category.image_url}
                alt={category.name}
                width={900}
                height={620}
                priority
              />
            </div>
          )}
        </div>
      </section>

      {/* ---------- Ranges + products ---------- */}
      <section className="section">
        <div className="container">
          {ranges.length === 0 ? (
            <div className="catalog-empty">
              <Icon name="box" />
              <p>{fallbackEmpty}</p>
            </div>
          ) : (
            <div className="range-layout">
              {/* Desktop sidebar */}
              <nav className="range-nav" aria-label="Product ranges">
                <span className="range-nav-label">Ranges</span>
                <ul>
                  {ranges.map((range) => (
                    <li key={range.id}>
                      <button
                        type="button"
                        aria-current={range.id === active?.id}
                        onClick={() => setActiveId(range.id)}
                      >
                        {range.is_default && <span className="rn-dot" aria-hidden="true" />}
                        <span className="rn-name">{range.name}</span>
                        <span className="rn-count">{range.products.length}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div>
                {/* Mobile: tap to open a list that drops down below the button */}
                <div className={`range-picker${pickerOpen ? ' is-open' : ''}`} ref={pickerRef}>
                  <button
                    type="button"
                    className="range-picker-btn"
                    aria-expanded={pickerOpen}
                    aria-controls="range-picker-panel"
                    onClick={() => setPickerOpen((v) => !v)}
                  >
                    <span className="rp-grow">
                      <span className="rp-label">Choose a range</span>
                      <span className="rp-name">{active?.name}</span>
                    </span>
                    <span className="rp-count">
                      {products.length} {products.length === 1 ? 'item' : 'items'}
                    </span>
                    <span className="rp-chev" aria-hidden="true">
                      <Icon name="arrow" />
                    </span>
                  </button>

                  <div className="range-picker-panel" id="range-picker-panel" role="listbox">
                    {ranges.map((range) => (
                      <button
                        key={range.id}
                        type="button"
                        role="option"
                        aria-selected={range.id === active?.id}
                        aria-current={range.id === active?.id}
                        onClick={() => {
                          setActiveId(range.id);
                          setPickerOpen(false);
                        }}
                      >
                        <span className="rp-i-name">{range.name}</span>
                        {range.is_default && <span className="rp-i-badge">Default</span>}
                        <span className="rp-i-count">{range.products.length}</span>
                        {range.id === active?.id && (
                          <Icon name="check" className="rp-i-check" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {active && (
                  <div className="range-head">
                    <div className="range-head-top">
                      <h2>{active.name}</h2>
                      <span className="product-count">
                        {products.length} {products.length === 1 ? 'product' : 'products'}
                      </span>
                    </div>
                    {active.description && <p>{active.description}</p>}
                  </div>
                )}

                {products.length === 0 ? (
                  <div className="catalog-empty">
                    <Icon name="box" />
                    <p>{fallbackEmpty}</p>
                  </div>
                ) : (
                  <div className="product-grid">
                    {products.map((product) => (
                      <article className="product-card" key={product.id}>
                        <div className="product-media">
                          {product.image_url ? (
                            <SmartImage
                              src={product.image_url}
                              alt={product.name}
                              width={520}
                              height={390}
                            />
                          ) : (
                            <div className="placeholder">
                              <Icon name="capsule" />
                            </div>
                          )}
                          {product.is_featured && (
                            <span className="product-badge">Featured</span>
                          )}
                        </div>

                        <div className="product-body">
                          <h3>{product.name}</h3>
                          {product.composition && (
                            <div className="product-composition">{product.composition}</div>
                          )}
                          {product.description && <p>{product.description}</p>}

                          {(product.dosage_form || product.pack_size) && (
                            <div className="product-meta">
                              {product.dosage_form && <span>{product.dosage_form}</span>}
                              {product.pack_size && <span>{product.pack_size}</span>}
                            </div>
                          )}

                          {product.highlights?.length > 0 && (
                            <ul className="product-highlights">
                              {product.highlights.map((h, i) => (
                                <li key={i}>{h}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
