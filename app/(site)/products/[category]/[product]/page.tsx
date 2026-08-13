import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/catalog/ProductDetail';
import { getCatalog, getProductLocation, getSiteSettings } from '@/lib/data';
import { htmlToText } from '@/lib/sanitize';

export const revalidate = 60;
/** Products added in the admin after a build render on first request. */
export const dynamicParams = true;

export async function generateStaticParams() {
  const catalog = await getCatalog();

  return catalog.flatMap((category) =>
    category.subcategories.flatMap((sub) =>
      sub.products.map((product) => ({
        category: category.slug,
        product: product.slug,
      })),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; product: string }>;
}): Promise<Metadata> {
  const { category, product: productSlug } = await params;
  const [found, settings] = await Promise.all([
    getProductLocation(category, productSlug),
    getSiteSettings(),
  ]);
  if (!found) return {};

  const { product } = found;
  const description =
    product.description ||
    htmlToText(product.detail_html).slice(0, 160) ||
    product.composition ||
    settings.seo.description;

  const image = product.image_url || product.gallery[0]?.url;

  return {
    title: { absolute: `${product.name} | ${settings.brand.name}` },
    description,
    alternates: { canonical: `/products/${category}/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; product: string }>;
}) {
  const { category, product } = await params;
  const found = await getProductLocation(category, product);
  if (!found) notFound();

  const settings = await getSiteSettings();

  return (
    <ProductDetail
      {...found}
      contactHref={settings.header.ctaHref || '/contact'}
    />
  );
}
