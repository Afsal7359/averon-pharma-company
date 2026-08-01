import type { SectionType } from './types';

/**
 * Metadata that drives the admin "Add section" picker and the editor labels.
 * Adding a new section type means: add it here, add an editor case in
 * SectionFields.tsx, and add a render case in SectionRenderer.tsx.
 */
export interface SectionMeta {
  type: SectionType;
  label: string;
  description: string;
  icon: string;
  /** Sections that only make sense once per page. */
  singleton?: boolean;
  defaults: Record<string, any>;
}

export const SECTION_TYPES: SectionMeta[] = [
  {
    type: 'hero',
    label: 'Home Hero',
    description: 'Full-height opening banner with background image and headline lines.',
    icon: 'star',
    singleton: true,
    defaults: {
      tag: 'Trust in Every Dose · Care for Every Life',
      headingLines: ['Advancing Healthcare', 'Through Quality, Innovation', '& Trust'],
      gradientWord: 'Innovation',
      subtitle: '',
      primaryCta: { label: 'Explore Our Products', href: '/products' },
      secondaryCta: { label: 'Discover Our Story', href: '/about' },
      imageUrl: '',
      imageAlt: '',
    },
  },
  {
    type: 'page_hero',
    label: 'Page Header',
    description: 'Inner-page header with breadcrumb, heading, intro text and a side image.',
    icon: 'box',
    singleton: true,
    defaults: {
      breadcrumb: 'Page',
      heading: 'Page heading',
      lede: '',
      imageUrl: '',
      imageAlt: '',
    },
  },
  {
    type: 'rich_text',
    label: 'Text Block',
    description: 'Eyebrow, heading and paragraphs, with an optional button.',
    icon: 'scales',
    defaults: {
      eyebrow: '',
      eyebrowAccent: 'red',
      heading: '',
      align: 'left',
      paragraphs: [''],
      background: 'white',
    },
  },
  {
    type: 'checklist',
    label: 'Checklist',
    description: 'Two-column list of ticked points.',
    icon: 'check',
    defaults: {
      eyebrow: '',
      eyebrowAccent: 'red',
      heading: '',
      align: 'center',
      items: [''],
      background: 'paper',
    },
  },
  {
    type: 'cards_grid',
    label: 'Icon Cards',
    description: 'Grid of icon cards, each optionally linking to another page.',
    icon: 'capsule',
    defaults: {
      eyebrow: '',
      eyebrowAccent: 'green',
      heading: '',
      align: 'left',
      columns: 3,
      cards: [{ icon: 'shield', accent: 'red', title: '', text: '', href: '' }],
      background: 'white',
    },
  },
  {
    type: 'category_cards',
    label: 'Image Cards',
    description: 'Large cards with a photo, icon, description and bullet list.',
    icon: 'eye',
    defaults: {
      eyebrow: '',
      eyebrowAccent: 'red',
      heading: '',
      align: 'left',
      cards: [{ imageUrl: '', imageAlt: '', icon: 'capsule', accent: 'red', title: '', text: '', bullets: [''] }],
      background: 'white',
    },
  },
  {
    type: 'process_steps',
    label: 'Process Steps',
    description: 'Three-across steps, with optional icons or numbered labels.',
    icon: 'truck',
    defaults: {
      eyebrow: '',
      eyebrowAccent: 'green',
      heading: '',
      align: 'left',
      showIcons: false,
      steps: [{ label: '01 / Step', icon: 'flask', accent: 'red', title: '', text: '' }],
      background: 'paper',
    },
  },
  {
    type: 'statement',
    label: 'Statement Block',
    description: 'Bold quote panel(s) on a brand gradient — mission, vision, promise.',
    icon: 'medal',
    defaults: {
      eyebrow: '',
      eyebrowAccent: 'red',
      heading: '',
      align: 'center',
      statements: [{ accent: 'red', kicker: 'Our Mission', quote: '', items: [] }],
      background: 'paper',
    },
  },
  {
    type: 'chips',
    label: 'Chip Row',
    description: 'Row of small pill labels with colour swatches.',
    icon: 'leaf',
    defaults: {
      eyebrow: '',
      eyebrowAccent: 'red',
      heading: '',
      align: 'center',
      chips: [{ label: '', accent: 'red' }],
      background: 'white',
    },
  },
  {
    type: 'perks',
    label: 'Numbered List',
    description: 'Two-column numbered rows — good for culture points or benefits.',
    icon: 'users',
    defaults: {
      eyebrow: '',
      eyebrowAccent: 'red',
      heading: '',
      align: 'left',
      items: [{ title: '', text: '' }],
      background: 'paper',
      spacing: 'tight',
    },
  },
  {
    type: 'callout',
    label: 'Callout Box',
    description: 'Centred panel with a paragraph and a single call-to-action button.',
    icon: 'mail',
    defaults: {
      eyebrow: '',
      eyebrowAccent: 'green',
      heading: '',
      align: 'center',
      text: '',
      cta: { label: '', href: '', icon: 'mail' },
      background: 'white',
    },
  },
  {
    type: 'cta_band',
    label: 'CTA Banner',
    description: 'Full-width gradient banner with a heading and buttons.',
    icon: 'arrow',
    defaults: {
      heading: '',
      text: '',
      buttons: [{ label: 'Get in Touch', href: '/contact' }],
    },
  },
  {
    type: 'pulse_divider',
    label: 'Pulse Divider',
    description: 'Animated ECG line used as a visual break between sections.',
    icon: 'heart',
    defaults: {},
  },
  {
    type: 'product_catalog',
    label: 'Product Catalogue',
    description: 'Live category → range → product browser, driven by the Products section.',
    icon: 'flask',
    singleton: true,
    defaults: {
      eyebrow: 'Product categories',
      eyebrowAccent: 'red',
      heading: 'Browse our range by category',
      intro: '',
      align: 'left',
      background: 'white',
      emptyText: 'Products for this range are being added shortly. Please check back soon.',
    },
  },
  {
    type: 'contact_block',
    label: 'Contact Form',
    description: 'Enquiry form plus contact details and an embedded map.',
    icon: 'pin',
    singleton: true,
    defaults: {
      eyebrow: 'Send a message',
      eyebrowAccent: 'red',
      heading: "We'd love to hear from you",
      background: 'white',
      subjects: ['General Enquiry', 'Product Enquiry', 'Partnership', 'Careers', 'Other'],
      note: '',
      successMessage: "Thank you — your message has reached our team. We'll be in touch shortly.",
      showMap: true,
      infoCards: [{ icon: 'pin', accent: 'red', title: 'Corporate Office', lines: [''] }],
    },
  },
];

export const SECTION_META = Object.fromEntries(
  SECTION_TYPES.map((s) => [s.type, s]),
) as Record<SectionType, SectionMeta>;

/** Human-readable summary shown on the collapsed section row. */
export function sectionSummary(type: string, content: Record<string, any>): string {
  const c = content ?? {};
  if (type === 'pulse_divider') return 'Decorative divider';
  if (type === 'hero') return c.headingLines?.join(' ') || 'Hero';
  if (type === 'cta_band') return c.heading || 'Call to action';
  return c.heading || c.breadcrumb || c.lede || c.eyebrow || SECTION_META[type as SectionType]?.label || type;
}
