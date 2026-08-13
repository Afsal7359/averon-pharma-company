import Link from 'next/link';
import Icon from '@/components/Icon';
import SmartImage from '@/components/SmartImage';
import { isBlankHtml, sanitizeHtml } from '@/lib/sanitize';
import type { ProductImage, ProductLocation } from '@/lib/types';
import ProductGallery from './ProductGallery';

interface Props extends ProductLocation {
  contactHref: string;
}

/** Main image first, then the gallery — de-duplicated by URL. */
function galleryFor(product: ProductLocation['product']): ProductImage[] {
  const images: ProductImage[] = [];
  const seen = new Set<string>();

  const push = (img: ProductImage) => {
    const key = img.url.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    images.push(img);
  };

  if (product.image_url) {
    push({ url: product.image_url, public_id: '', alt: product.name });
  }
  product.gallery.forEach(push);

  return images;
}

export default function ProductDetail({
  category,
  subcategory,
  product,
  siblings,
  contactHref,
}: Props) {
  const images = galleryFor(product);
  const specs = [
    ['Composition', product.composition],
    ['Dosage form', product.dosage_form],
    ['Pack size', product.pack_size],
    ['Range', subcategory.name],
    ['Category', category.name],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  return (
    <>
      <section className="pd-top">
        <div className="container">
          <Link href={`/products/${category.slug}`} className="cat-back">
            <Icon name="arrow" />
            Back to {category.name}
          </Link>

          <div className="crumb">
            <Link href="/">Home</Link> / <Link href="/products">Products</Link> /{' '}
            <Link href={`/products/${category.slug}`}>{category.name}</Link> /{' '}
            <span className="current">{product.name}</span>
          </div>

          <div className="pd-layout">
            <ProductGallery images={images} productName={product.name} />

            <div className="pd-info">
              <span className="pd-range">{subcategory.name}</span>
              <h1>{product.name}</h1>

              {product.composition && (
                <div className="pd-composition">{product.composition}</div>
              )}

              {product.description && <p className="pd-lede">{product.description}</p>}

              {product.highlights?.length > 0 && (
                <ul className="pd-tags">
                  {product.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}

              {specs.length > 0 && (
                <dl className="pd-specs">
                  {specs.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="pd-actions">
                <Link href={contactHref} className="btn btn--primary">
                  Enquire about this product
                  <Icon name="arrow" />
                </Link>
                <Link href={`/products/${category.slug}`} className="btn btn--outline">
                  View the full range
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!isBlankHtml(product.detail_html) && (
        <section className="section pd-body-band">
          <div className="container">
            <div
              className="pd-body rich-text"
              // Written by an admin, then run through the allow-list sanitiser
              // on save AND again here before it reaches the page.
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.detail_html) }}
            />
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="section pd-more">
          <div className="container">
            <div className="range-head-top">
              <h2>More from {subcategory.name}</h2>
              <Link href={`/products/${category.slug}`} className="pd-more-link">
                See all <Icon name="arrow" />
              </Link>
            </div>

            <div className="product-grid">
              {siblings.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${category.slug}/${item.slug}`}
                  className="product-card is-link"
                >
                  <div className="product-media">
                    {item.image_url ? (
                      <SmartImage src={item.image_url} alt={item.name} width={520} height={390} />
                    ) : (
                      <div className="placeholder">
                        <Icon name="capsule" />
                      </div>
                    )}
                  </div>
                  <div className="product-body">
                    <h3>{item.name}</h3>
                    {item.composition && (
                      <div className="product-composition">{item.composition}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
