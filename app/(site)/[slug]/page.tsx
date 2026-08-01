import { notFound } from 'next/navigation';
import { getAllPages } from '@/lib/data';
import RenderPage, { renderPageMetadata } from '../render-page';

export const revalidate = 60;
/** Pages added in the admin panel after build are rendered on first request. */
export const dynamicParams = true;

/** Slugs owned by a dedicated route rather than this catch-all. */
const RESERVED = new Set(['home', 'admin', 'api', 'products']);

export async function generateStaticParams() {
  const pages = await getAllPages();
  return pages
    .filter((p) => p.is_published && !RESERVED.has(p.slug))
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderPageMetadata(slug);
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();
  return <RenderPage slug={slug} />;
}
