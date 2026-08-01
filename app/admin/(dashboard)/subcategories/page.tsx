import { createClient } from '@/lib/supabase/server';
import type {
  ProductCategoryRow,
  ProductSubcategoryRow,
} from '@/lib/supabase/database.types';
import SubcategoriesManager from './SubcategoriesManager';

export default async function SubcategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, { data: subs }, { data: products }] = await Promise.all([
    supabase.from('product_categories').select('*').order('sort_order', { ascending: true }),
    supabase
      .from('product_subcategories')
      .select('*')
      .order('sort_order', { ascending: true }),
    supabase.from('products').select('id, subcategory_id'),
  ]);

  const productCounts: Record<string, number> = {};
  (products ?? []).forEach((p) => {
    const id = (p as any).subcategory_id as string;
    productCounts[id] = (productCounts[id] ?? 0) + 1;
  });

  return (
    <SubcategoriesManager
      categories={(categories ?? []) as ProductCategoryRow[]}
      initial={(subs ?? []) as ProductSubcategoryRow[]}
      productCounts={productCounts}
      initialCategoryId={category ?? null}
    />
  );
}
