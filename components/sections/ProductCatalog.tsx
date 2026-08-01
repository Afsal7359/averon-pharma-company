import Link from 'next/link';
import Icon from '@/components/Icon';
import SmartImage from '@/components/SmartImage';
import { SectionHead, sectionClass } from './primitives';
import type { CatalogCategory, ProductCatalogContent } from '@/lib/types';

interface Props {
  c: ProductCatalogContent;
  catalog: CatalogCategory[];
}

/**
 * The products page lists categories only. Each card opens its own page at
 * /products/[slug], where the ranges and products live.
 */
export default function ProductCatalog({ c, catalog }: Props) {
  return (
    <section className={sectionClass(c)}>
      <div className="container">
        <SectionHead content={c} />
        {c.intro && (
          <p className="reveal" style={{ marginTop: -42, marginBottom: 44, maxWidth: '62ch' }}>
            {c.intro}
          </p>
        )}

        {catalog.length === 0 ? (
          <div className="catalog-empty">
            <Icon name="box" />
            <p>{c.emptyText || 'Our product range is being updated. Please check back soon.'}</p>
          </div>
        ) : (
          <div className="cat-grid" data-stagger>
            {catalog.map((category) => {
              const productCount = category.subcategories.reduce(
                (n, s) => n + s.products.length,
                0,
              );
              const accent = category.accent === 'green' ? 'green' : 'red';

              return (
                <Link
                  key={category.id}
                  href={`/products/${category.slug}`}
                  className="cat-card reveal"
                >
                  <div className="cat-card-media">
                    {category.image_url ? (
                      <SmartImage
                        src={category.image_url}
                        alt={category.name}
                        width={720}
                        height={450}
                      />
                    ) : (
                      <div className="placeholder">
                        <Icon name={category.icon} />
                      </div>
                    )}
                  </div>

                  <div className="cat-card-body">
                    <span className={`cat-card-badge cat-card-badge--${accent}`}>
                      <Icon name={category.icon} />
                    </span>
                    {category.tagline && <span className="kicker">{category.tagline}</span>}
                    <h3>{category.name}</h3>
                    {category.description && <p>{category.description}</p>}

                    <div className="cat-card-meta">
                      <span>
                        {category.subcategories.length}{' '}
                        {category.subcategories.length === 1 ? 'range' : 'ranges'}
                      </span>
                      <span>
                        {productCount} {productCount === 1 ? 'product' : 'products'}
                      </span>
                    </div>

                    <span className="cat-card-cta">
                      View products
                      <Icon name="arrow" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
