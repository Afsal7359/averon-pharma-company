import 'server-only';
import { cache } from 'react';
import { getPublicClient } from './supabase/public';
import { DEFAULT_CATALOG, DEFAULT_PAGES, DEFAULT_SETTINGS } from './default-content';
import type {
  CatalogCategory,
  Page,
  PageSection,
  PageWithSections,
  Product,
  ProductLocation,
  ProductSubcategory,
  SiteSettings,
} from './types';

/**
 * Every reader below degrades gracefully: if Supabase is unconfigured or a
 * query fails, the bundled baseline is returned so the site never 500s.
 */

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = getPublicClient();
  if (!supabase) return DEFAULT_SETTINGS;

  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error || !data?.length) return DEFAULT_SETTINGS;

  const bag = Object.fromEntries(data.map((r) => [r.key, r.value])) as Record<string, any>;

  // Merge per-key so a missing/partial row still renders.
  return {
    brand: { ...DEFAULT_SETTINGS.brand, ...(bag.brand ?? {}) },
    contact: { ...DEFAULT_SETTINGS.contact, ...(bag.contact ?? {}) },
    header: { ...DEFAULT_SETTINGS.header, ...(bag.header ?? {}) },
    footer: { ...DEFAULT_SETTINGS.footer, ...(bag.footer ?? {}) },
    seo: { ...DEFAULT_SETTINGS.seo, ...(bag.seo ?? {}) },
  };
});

/** Pages that appear in the header / mobile nav. */
export const getNavPages = cache(async (): Promise<Page[]> => {
  const supabase = getPublicClient();
  if (!supabase) return DEFAULT_PAGES.filter((p) => p.show_in_nav);

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('is_published', true)
    .eq('show_in_nav', true)
    .order('sort_order', { ascending: true });

  if (error || !data) return DEFAULT_PAGES.filter((p) => p.show_in_nav);
  return data as Page[];
});

export const getAllPages = cache(async (): Promise<Page[]> => {
  const supabase = getPublicClient();
  if (!supabase) return DEFAULT_PAGES;

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data) return DEFAULT_PAGES;
  return data as Page[];
});

export const getPage = cache(async (slug: string): Promise<PageWithSections | null> => {
  const fallback = DEFAULT_PAGES.find((p) => p.slug === slug) ?? null;

  const supabase = getPublicClient();
  if (!supabase) return fallback;

  const { data: pageRow, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) return fallback;
  if (!pageRow) return null;
  if (!pageRow.is_published) return null;

  const { data: sections } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_id', pageRow.id)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });

  return {
    ...(pageRow as Page),
    sections: (sections ?? []) as PageSection[],
  };
});

/**
 * Full product tree, active rows only, ordered. Subcategories are sorted so
 * the one flagged `is_default` comes first — the public page selects the
 * first subcategory it sees.
 */
export const getCatalog = cache(async (): Promise<CatalogCategory[]> => {
  const supabase = getPublicClient();
  if (!supabase) return DEFAULT_CATALOG;

  const [categoriesRes, subcategoriesRes, productsRes] = await Promise.all([
    supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('product_subcategories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  if (categoriesRes.error || !categoriesRes.data) return DEFAULT_CATALOG;
  // An empty catalog is a legitimate state once the admin has taken over.
  if (categoriesRes.data.length === 0) return [];

  const subs = (subcategoriesRes.data ?? []) as ProductSubcategory[];
  const products = (productsRes.data ?? []) as Product[];

  return categoriesRes.data.map((category): CatalogCategory => ({
    ...category,
    subcategories: subs
      .filter((s) => s.category_id === category.id)
      .sort((a, b) =>
        a.is_default === b.is_default ? a.sort_order - b.sort_order : a.is_default ? -1 : 1,
      )
      .map((sub) => ({
        ...sub,
        products: products.filter((p) => p.subcategory_id === sub.id).map(normaliseProduct),
      })),
  }));
});

/**
 * `gallery` and `detail_html` were added after the first release, so rows
 * written before the migration come back without them.
 */
function normaliseProduct(product: Product): Product {
  return {
    ...product,
    gallery: Array.isArray(product.gallery)
      ? product.gallery.filter((img) => img && typeof img.url === 'string' && img.url.trim())
      : [],
    detail_html: product.detail_html ?? null,
  };
}

/**
 * One product plus the category/range it sits in.
 *
 * Reads through getCatalog so it shares that request's cache — a detail page
 * and its breadcrumb cost a single set of queries, not one per lookup.
 */
export const getProductLocation = cache(
  async (categorySlug: string, productSlug: string): Promise<ProductLocation | null> => {
    const catalog = await getCatalog();

    for (const category of catalog) {
      if (category.slug !== categorySlug) continue;

      for (const subcategory of category.subcategories) {
        const product = subcategory.products.find((p) => p.slug === productSlug);
        if (!product) continue;

        return {
          category,
          subcategory,
          product,
          siblings: subcategory.products.filter((p) => p.id !== product.id),
        };
      }
    }

    return null;
  },
);
