// =========================================================================
// Hand-written database types matching supabase/schema.sql.
// Keep in sync when the schema changes (or regenerate with the Supabase CLI:
//   supabase gen types typescript --project-id <id> > lib/supabase/database.types.ts)
// =========================================================================

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export type AdminUserRow = {
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'editor';
  created_at: string;
}

export type SiteSettingRow = {
  key: string;
  value: Json;
  updated_at: string;
}

export type PageRow = {
  id: string;
  slug: string;
  title: string;
  nav_label: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  sort_order: number;
  show_in_nav: boolean;
  is_published: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export type PageSectionRow = {
  id: string;
  page_id: string;
  type: string;
  content: Json;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductCategoryRow = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  image_public_id: string | null;
  icon: string | null;
  accent: 'red' | 'green';
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductSubcategoryRow = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  image_public_id: string | null;
  sort_order: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductRow = {
  id: string;
  subcategory_id: string;
  name: string;
  slug: string;
  composition: string | null;
  description: string | null;
  image_url: string | null;
  image_public_id: string | null;
  pack_size: string | null;
  dosage_form: string | null;
  highlights: string[];
  gallery: ProductImageRow[];
  detail_html: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductImageRow = {
  url: string;
  public_id: string;
  alt: string;
}

export type EnquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  source_page: string | null;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
}

export type KeepAliveRow = {
  id: string;
  pinged_at: string;
  source: string;
  note: string | null;
}

export type MediaAssetRow = {
  id: string;
  public_id: string;
  url: string;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  alt: string | null;
  folder: string | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      admin_users: Table<AdminUserRow>;
      site_settings: Table<SiteSettingRow>;
      pages: Table<PageRow>;
      page_sections: Table<PageSectionRow>;
      product_categories: Table<ProductCategoryRow>;
      product_subcategories: Table<ProductSubcategoryRow>;
      products: Table<ProductRow>;
      enquiries: Table<EnquiryRow>;
      keep_alive: Table<KeepAliveRow>;
      media_assets: Table<MediaAssetRow>;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      prune_keep_alive: { Args: Record<string, never>; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
