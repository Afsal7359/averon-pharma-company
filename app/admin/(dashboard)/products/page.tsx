import { createClient } from '@/lib/supabase/server';
import type {
  ProductCategoryRow,
  ProductRow,
  ProductSubcategoryRow,
} from '@/lib/supabase/database.types';
import ProductsManager from './ProductsManager';

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ subcategory?: string }>;
}) {
  const { subcategory } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, { data: subs }, { data: products }] = await Promise.all([
    supabase.from('product_categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('product_subcategories').select('*').order('sort_order', { ascending: true }),
    supabase.from('products').select('*').order('sort_order', { ascending: true }),
  ]);

  return (
    <ProductsManager
      categories={(categories ?? []) as ProductCategoryRow[]}
      subcategories={(subs ?? []) as ProductSubcategoryRow[]}
      initial={(products ?? []) as ProductRow[]}
      initialSubcategoryId={subcategory ?? null}
    />
  );
}
