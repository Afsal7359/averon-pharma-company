import ContactBlock from './ContactBlock';
import ProductCatalog from './ProductCatalog';
import {
  Callout,
  CardsGrid,
  CategoryCards,
  Checklist,
  Chips,
  CtaBand,
  Hero,
  PageHero,
  Perks,
  ProcessSteps,
  PulseDivider,
  RichText,
  Statement,
} from './StaticSections';
import type { CatalogCategory, ContactSettings, PageSection } from '@/lib/types';

interface Props {
  sections: PageSection[];
  catalog: CatalogCategory[];
  contact: ContactSettings;
}

/**
 * Renders whatever the admin panel put on the page, in order. An unknown
 * section type is skipped rather than crashing the page.
 */
export default function SectionRenderer({ sections, catalog, contact }: Props) {
  return (
    <>
      {sections.map((section) => {
        const c = section.content ?? {};

        switch (section.type) {
          case 'hero':
            return <Hero key={section.id} c={c} />;
          case 'page_hero':
            return <PageHero key={section.id} c={c} />;
          case 'rich_text':
            return <RichText key={section.id} c={c} />;
          case 'checklist':
            return <Checklist key={section.id} c={c} />;
          case 'cards_grid':
            return <CardsGrid key={section.id} c={c} />;
          case 'category_cards':
            return <CategoryCards key={section.id} c={c} />;
          case 'process_steps':
            return <ProcessSteps key={section.id} c={c} />;
          case 'statement':
            return <Statement key={section.id} c={c} />;
          case 'chips':
            return <Chips key={section.id} c={c} />;
          case 'perks':
            return <Perks key={section.id} c={c} />;
          case 'callout':
            return <Callout key={section.id} c={c} />;
          case 'cta_band':
            return <CtaBand key={section.id} c={c} />;
          case 'pulse_divider':
            return <PulseDivider key={section.id} />;
          case 'product_catalog':
            return <ProductCatalog key={section.id} c={c} catalog={catalog} />;
          case 'contact_block':
            return <ContactBlock key={section.id} c={c} contact={contact} />;
          default:
            return null;
        }
      })}
    </>
  );
}
