import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryDetail from '@/components/catalog/CategoryDetail';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { getCatalog, getPage, getSiteSettings } from '@/lib/data';
import type { ProductCatalogContent } from '@/lib/types';

export const revalidate = 60;
/** Categories added in the admin after a build render on first request. */
export const dynamicParams = true;

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.map((c) => ({ category: c.slug }));
}

async function findCategory(slug: string) {
  const catalog = await getCatalog();
  return catalog.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const [category, settings] = await Promise.all([findCategory(slug), getSiteSettings()]);
  if (!category) return {};

  const description =
    category.description || category.tagline || settings.seo.description;

  return {
    title: { absolute: `${category.name} | ${settings.brand.name}` },
    description,
    alternates: { canonical: `/products/${category.slug}` },
    openGraph: {
      title: category.name,
      description,
      ...(category.image_url ? { images: [category.image_url] } : {}),
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = await findCategory(slug);
  if (!category) notFound();

  // Reuse the products page's trailing sections (process steps, CTA) so the
  // category pages stay consistent with the rest of the site — and stay
  // editable from the admin panel.
  const [productsPage, settings] = await Promise.all([getPage('products'), getSiteSettings()]);

  const catalogSection = productsPage?.sections.find((s) => s.type === 'product_catalog');
  const emptyText = (catalogSection?.content as ProductCatalogContent | undefined)?.emptyText;

  const trailingSections = (productsPage?.sections ?? []).filter(
    (s) => !['page_hero', 'product_catalog'].includes(s.type),
  );

  return (
    <>
      <CategoryDetail category={category} emptyText={emptyText} />
      <SectionRenderer
        sections={trailingSections}
        catalog={[]}
        contact={settings.contact}
      />
    </>
  );
}
