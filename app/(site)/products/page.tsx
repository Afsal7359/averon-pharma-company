import RenderPage, { renderPageMetadata } from '../render-page';

export const revalidate = 60;

export const generateMetadata = () => renderPageMetadata('products');

/**
 * Explicit route for /products so it can't be shadowed by the [slug]
 * catch-all now that /products/[category] exists beneath it.
 */
export default function ProductsPage() {
  return <RenderPage slug="products" />;
}
