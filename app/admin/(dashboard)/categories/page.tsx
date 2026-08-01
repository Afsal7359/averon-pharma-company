import { createClient } from '@/lib/supabase/server';
import type { ProductCategoryRow } from '@/lib/supabase/database.types';
import CategoriesManager from './CategoriesManager';

export default async function CategoriesPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: subs }, { data: products }] = await Promise.all([
    supabase.from('product_categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('product_subcategories').select('id, category_id'),
    supabase.from('products').select('id, subcategory_id'),
  ]);

  // Product counts roll up subcategory → category for the list view.
  const subToCat = new Map(
    (subs ?? []).map((s) => [(s as any).id as string, (s as any).category_id as string]),
  );

  const subCounts: Record<string, number> = {};
  (subs ?? []).forEach((s) => {
    const catId = (s as any).category_id as string;
    subCounts[catId] = (subCounts[catId] ?? 0) + 1;
  });

  const productCounts: Record<string, number> = {};
  (products ?? []).forEach((p) => {
    const catId = subToCat.get((p as any).subcategory_id as string);
    if (catId) productCounts[catId] = (productCounts[catId] ?? 0) + 1;
  });

  return (
    <CategoriesManager
      initial={(categories ?? []) as ProductCategoryRow[]}
      subCounts={subCounts}
      productCounts={productCounts}
    />
  );
}
