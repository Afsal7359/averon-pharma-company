import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { getCatalog, getPage, getSiteSettings } from '@/lib/data';

/** Shared by the home route and the [slug] catch-all. */
export async function renderPageMetadata(slug: string): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(slug), getSiteSettings()]);
  if (!page) return {};

  const title = page.meta_title || page.title;
  const description = page.meta_description || settings.seo.description;

  return {
    // The root layout appends "| Brand"; meta_title is already complete.
    title: { absolute: title },
    description,
    alternates: { canonical: slug === 'home' ? '/' : `/${slug}` },
    openGraph: {
      title,
      description,
      ...(page.og_image_url ? { images: [page.og_image_url] } : {}),
    },
  };
}

export default async function RenderPage({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();

  const needsCatalog = page.sections.some((s) => s.type === 'product_catalog');
  const [catalog, settings] = await Promise.all([
    needsCatalog ? getCatalog() : Promise.resolve([]),
    getSiteSettings(),
  ]);

  return (
    <SectionRenderer sections={page.sections} catalog={catalog} contact={settings.contact} />
  );
}
