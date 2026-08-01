// =========================================================================
// Shared content model. The shapes here are the contract between the admin
// editor (which writes JSON) and the section renderer (which reads it).
// =========================================================================

export type Accent = 'red' | 'green';
export type Background = 'white' | 'paper' | 'off';
export type Spacing = 'normal' | 'tight';

export type SectionType =
  | 'hero'
  | 'page_hero'
  | 'rich_text'
  | 'checklist'
  | 'cards_grid'
  | 'category_cards'
  | 'process_steps'
  | 'statement'
  | 'chips'
  | 'perks'
  | 'callout'
  | 'cta_band'
  | 'pulse_divider'
  | 'product_catalog'
  | 'contact_block';

export interface Link {
  label: string;
  href: string;
  style?: 'primary' | 'outline' | 'ghost-green';
  icon?: string;
}

/** Every section may set its own band background and vertical rhythm. */
export interface BaseSectionContent {
  background?: Background;
  spacing?: Spacing;
  eyebrow?: string;
  eyebrowAccent?: Accent;
  heading?: string;
  lede?: string;
  align?: 'left' | 'center';
}

export interface HeroContent extends BaseSectionContent {
  tag?: string;
  headingLines?: string[];
  gradientWord?: string;
  subtitle?: string;
  primaryCta?: Link;
  secondaryCta?: Link;
  imageUrl?: string;
  imageAlt?: string;
}

export interface PageHeroContent extends BaseSectionContent {
  breadcrumb?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface RichTextContent extends BaseSectionContent {
  paragraphs?: string[];
  cta?: Link;
}

export interface ChecklistContent extends BaseSectionContent {
  items?: string[];
}

export interface CardItem {
  icon?: string;
  accent?: Accent;
  title?: string;
  text?: string;
  href?: string;
}

export interface CardsGridContent extends BaseSectionContent {
  columns?: 2 | 3 | 4;
  cards?: CardItem[];
}

export interface CategoryCardItem extends CardItem {
  imageUrl?: string;
  imageAlt?: string;
  bullets?: string[];
}

export interface CategoryCardsContent extends BaseSectionContent {
  cards?: CategoryCardItem[];
}

export interface ProcessStep {
  label?: string;
  icon?: string;
  accent?: Accent;
  title?: string;
  text?: string;
}

export interface ProcessStepsContent extends BaseSectionContent {
  showIcons?: boolean;
  steps?: ProcessStep[];
}

export interface StatementItem {
  accent?: Accent;
  kicker?: string;
  quote?: string;
  items?: string[];
}

export interface StatementContent extends BaseSectionContent {
  statements?: StatementItem[];
}

export interface ChipsContent extends BaseSectionContent {
  chips?: { label: string; accent?: Accent }[];
}

export interface PerksContent extends BaseSectionContent {
  items?: { title?: string; text?: string }[];
}

export interface CalloutContent extends BaseSectionContent {
  text?: string;
  cta?: Link;
}

export interface CtaBandContent extends BaseSectionContent {
  text?: string;
  buttons?: Link[];
}

export interface ProductCatalogContent extends BaseSectionContent {
  intro?: string;
  emptyText?: string;
}

export interface ContactInfoCard {
  icon?: string;
  accent?: Accent;
  title?: string;
  lines?: string[];
  href?: string;
}

export interface ContactBlockContent extends BaseSectionContent {
  subjects?: string[];
  note?: string;
  successMessage?: string;
  showMap?: boolean;
  mapQuery?: string;
  infoCards?: ContactInfoCard[];
}

export type SectionContent =
  | HeroContent
  | PageHeroContent
  | RichTextContent
  | ChecklistContent
  | CardsGridContent
  | CategoryCardsContent
  | ProcessStepsContent
  | StatementContent
  | ChipsContent
  | PerksContent
  | CalloutContent
  | CtaBandContent
  | ProductCatalogContent
  | ContactBlockContent
  | Record<string, unknown>;

// ------------------------------------------------------------------ rows

export interface PageSection {
  id: string;
  page_id: string;
  type: SectionType;
  content: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
}

export interface Page {
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
}

export interface PageWithSections extends Page {
  sections: PageSection[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  accent: Accent;
  sort_order: number;
  is_active: boolean;
}

export interface ProductSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_default: boolean;
  is_active: boolean;
}

export interface Product {
  id: string;
  subcategory_id: string;
  name: string;
  slug: string;
  composition: string | null;
  description: string | null;
  image_url: string | null;
  pack_size: string | null;
  dosage_form: string | null;
  highlights: string[];
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
}

export interface CatalogSubcategory extends ProductSubcategory {
  products: Product[];
}

export interface CatalogCategory extends ProductCategory {
  subcategories: CatalogSubcategory[];
}

export interface Enquiry {
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

// ---------------------------------------------------------------- settings

export interface BrandSettings {
  name: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  description: string;
}

export interface ContactSettings {
  addressLines: string[];
  email: string;
  phone: string;
  mapQuery: string;
}

export interface HeaderSettings {
  ctaLabel: string;
  ctaHref: string;
  mobileCtaLabel: string;
  mobileCtaHref: string;
}

export interface FooterSettings {
  columns: { title: string; links: Link[] }[];
  contactTitle: string;
  copyright: string;
}

export interface SeoSettings {
  siteUrl: string;
  titleDefault: string;
  description: string;
}

export interface SiteSettings {
  brand: BrandSettings;
  contact: ContactSettings;
  header: HeaderSettings;
  footer: FooterSettings;
  seo: SeoSettings;
}
