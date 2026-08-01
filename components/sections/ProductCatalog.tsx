'use client';

import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import SmartImage from '@/components/SmartImage';
import { SectionHead, sectionClass } from './primitives';
import type { CatalogCategory, ProductCatalogContent } from '@/lib/types';

interface Props {
  c: ProductCatalogContent;
  catalog: CatalogCategory[];
}

/**
 * Category → range → products.
 *
 * Selecting a category always lands on its default range (the catalog data is
 * pre-sorted so `subcategories[0]` is the one flagged default in the admin).
 * Other ranges are one tap away: chips on desktop, a native picker on mobile.
 */
export default function ProductCatalog({ c, catalog }: Props) {
  const categories = catalog.filter((cat) => cat.subcategories.length > 0 || cat.description);

  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? '');
  const [subIdByCategory, setSubIdByCategory] = useState<Record<string, string>>({});

  const category = useMemo(
    () => categories.find((cat) => cat.id === categoryId) ?? categories[0],
    [categories, categoryId],
  );

  const subcategories = category?.subcategories ?? [];
  // Default range = first entry, which getCatalog() sorts to is_default.
  const activeSubId = subIdByCategory[category?.id ?? ''] ?? subcategories[0]?.id ?? '';
  const activeSub = subcategories.find((s) => s.id === activeSubId) ?? subcategories[0];
  const products = activeSub?.products ?? [];

  if (categories.length === 0) {
    return (
      <section className={sectionClass(c)}>
        <div className="container">
          <SectionHead content={c} />
          <div className="catalog-empty">
            <Icon name="box" />
            <p>{c.emptyText || 'Our product range is being updated. Please check back soon.'}</p>
          </div>
        </div>
      </section>
    );
  }

  const selectSub = (subId: string) =>
    setSubIdByCategory((prev) => ({ ...prev, [category!.id]: subId }));

  return (
    <section className={sectionClass(c)}>
      <div className="container catalog">
        <SectionHead content={c} />
        {c.intro && (
          <p className="reveal" style={{ marginTop: -40, marginBottom: 40, maxWidth: '60ch' }}>
            {c.intro}
          </p>
        )}

        {/* ---- Category selector ---- */}
        <div className="catalog-categories" role="tablist" aria-label="Product categories">
          {categories.map((cat) => {
            const count = cat.subcategories.reduce((n, s) => n + s.products.length, 0);
            const selected = cat.id === category?.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className="catalog-cat"
                onClick={() => setCategoryId(cat.id)}
              >
                <span className={`cat-icon cat-icon--${cat.accent === 'green' ? 'green' : 'red'}`}>
                  <Icon name={cat.icon} />
                </span>
                <span className="cat-text">
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-meta">
                    {cat.subcategories.length} {cat.subcategories.length === 1 ? 'range' : 'ranges'}
                    {count > 0 && ` · ${count} ${count === 1 ? 'product' : 'products'}`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* ---- Selected category panel ---- */}
        {category && (
          <div className="catalog-panel reveal">
            <div className="catalog-panel-head">
              <div className="catalog-panel-copy">
                {category.tagline && <span className="kicker">{category.tagline}</span>}
                <h3>{category.name}</h3>
                {category.description && <p>{category.description}</p>}
              </div>
              {category.image_url && (
                <div className="catalog-panel-media">
                  <SmartImage src={category.image_url} alt={category.name} width={900} height={520} />
                </div>
              )}
            </div>

            {subcategories.length > 0 && (
              <div className="range-bar">
                <span className="range-label">Choose a range</span>

                {/* Desktop: chips */}
                <div className="range-chips" role="group" aria-label="Product ranges">
                  {subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      className="range-chip"
                      aria-pressed={sub.id === activeSub?.id}
                      onClick={() => selectSub(sub.id)}
                    >
                      {sub.is_default && <span className="default-dot" aria-hidden="true" />}
                      {sub.name}
                      <span className="count">{sub.products.length}</span>
                    </button>
                  ))}
                </div>

                {/* Mobile: native picker — the "choose another" control */}
                <div className="range-select-wrap">
                  <label className="sr-only" htmlFor="range-select">
                    Choose a product range
                  </label>
                  <select
                    id="range-select"
                    className="range-select"
                    value={activeSub?.id ?? ''}
                    onChange={(e) => selectSub(e.target.value)}
                  >
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.products.length})
                        {sub.is_default ? ' — default' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ---- Products in the selected range ---- */}
            <div className="product-area">
              {activeSub && (
                <div className="product-area-head">
                  <div>
                    <h4>{activeSub.name}</h4>
                    {activeSub.description && <p>{activeSub.description}</p>}
                  </div>
                  <span className="product-count">
                    {products.length} {products.length === 1 ? 'product' : 'products'}
                  </span>
                </div>
              )}

              {products.length === 0 ? (
                <div className="catalog-empty">
                  <Icon name="box" />
                  <p>
                    {c.emptyText ||
                      'Products for this range are being added shortly. Please check back soon.'}
                  </p>
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
                        {product.is_featured && <span className="product-badge">Featured</span>}
                      </div>

                      <div className="product-body">
                        <h5>{product.name}</h5>
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
  );
}
