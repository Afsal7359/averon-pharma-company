// =========================================================================
// Bundled baseline content — mirrors supabase/seed.sql.
// Used when Supabase env vars are absent or a query fails, so the public
// site always renders. Once Supabase is connected, the database wins.
// =========================================================================

import type { CatalogCategory, PageWithSections, SiteSettings } from './types';

export const DEFAULT_SETTINGS: SiteSettings = {
  brand: {
    name: 'Averon Life Sciences',
    tagline: 'Trust in Every Dose. Care for Every Life.',
    logoUrl: '/assets/logo.png',
    faviconUrl: '/assets/favicon.svg',
    description:
      'A pharmaceutical and healthcare company committed to delivering high-quality, safe, and effective healthcare solutions that improve lives.',
  },
  contact: {
    addressLines: [
      '648/A, 4th Floor, OM Chambers,',
      'Binnamangala 1st Stage, Indiranagar,',
      'Bangalore – 560038, Karnataka, India.',
    ],
    email: 'info@averonlifesciences.com',
    phone: '',
    mapQuery:
      'OM Chambers, Binnamangala 1st Stage, Indiranagar, Bangalore 560038, Karnataka, India',
  },
  header: {
    ctaLabel: 'Contact Us',
    ctaHref: '/contact',
    mobileCtaLabel: 'Partner With Us',
    mobileCtaHref: '/contact',
  },
  footer: {
    columns: [
      {
        title: 'Explore',
        links: [
          { label: 'About Us', href: '/about' },
          { label: 'Products', href: '/products' },
          { label: 'Quality', href: '/quality' },
          { label: 'Research & Innovation', href: '/research' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'Careers', href: '/careers' },
          { label: 'Contact Us', href: '/contact' },
          { label: 'Home', href: '/' },
        ],
      },
    ],
    contactTitle: 'Get in Touch',
    copyright: 'Averon Life Sciences. All rights reserved.',
  },
  seo: {
    siteUrl: 'https://www.averonlifesciences.com',
    titleDefault: 'Averon Life Sciences | Trust in Every Dose. Care for Every Life.',
    description:
      'Averon Life Sciences is a pharmaceutical and healthcare company delivering high-quality, safe and effective pharmaceutical, nutraceutical and wellness solutions.',
  },
};

/** Small helper so the literals below stay readable. */
function page(
  slug: string,
  title: string,
  navLabel: string,
  metaTitle: string,
  metaDescription: string,
  sortOrder: number,
  showInNav: boolean,
  sections: { type: string; content: Record<string, any> }[],
): PageWithSections {
  return {
    id: `local-${slug}`,
    slug,
    title,
    nav_label: navLabel,
    meta_title: metaTitle,
    meta_description: metaDescription,
    og_image_url: null,
    sort_order: sortOrder,
    show_in_nav: showInNav,
    is_published: true,
    is_system: true,
    sections: sections.map((s, i) => ({
      id: `local-${slug}-${i}`,
      page_id: `local-${slug}`,
      type: s.type as PageWithSections['sections'][number]['type'],
      content: s.content,
      sort_order: i + 1,
      is_visible: true,
    })),
  };
}

export const DEFAULT_PAGES: PageWithSections[] = [
  page(
    'home',
    'Home',
    'Home',
    'Averon Life Sciences | Trust in Every Dose. Care for Every Life.',
    'Averon Life Sciences is a pharmaceutical and healthcare company delivering high-quality, safe and effective pharmaceutical, nutraceutical and wellness solutions.',
    1,
    true,
    [
      {
        type: 'hero',
        content: {
          tag: 'Trust in Every Dose · Care for Every Life',
          headingLines: ['Advancing Healthcare', 'Through Quality, Innovation', '& Trust'],
          gradientWord: 'Innovation',
          subtitle:
            'Welcome to Averon Life Sciences, a pharmaceutical and healthcare company committed to delivering high-quality, safe, and effective healthcare solutions that improve lives.',
          primaryCta: { label: 'Explore Our Products', href: '/products' },
          secondaryCta: { label: 'Discover Our Story', href: '/about' },
          imageUrl:
            'https://images.unsplash.com/photo-1758691461957-474a7686e388?auto=format&fit=crop&w=1800&q=80',
          imageAlt: 'Doctor consulting with a patient in a modern clinic',
        },
      },
      {
        type: 'rich_text',
        content: {
          eyebrow: 'Who we are',
          eyebrowAccent: 'red',
          heading: 'Driven by science. Guided by care.',
          align: 'left',
          paragraphs: [
            'Driven by scientific excellence, ethical practices, and a patient-centric approach, we focus on developing and delivering trusted pharmaceutical products, nutraceuticals, and wellness solutions.',
            'With a commitment to quality, innovation, and responsibility, Averon Life Sciences strives to become a trusted healthcare partner for doctors, patients, pharmacies, and healthcare institutions.',
          ],
          cta: { label: 'More About Averon', href: '/about', style: 'ghost-green' },
          background: 'white',
        },
      },
      { type: 'pulse_divider', content: {} },
      {
        type: 'checklist',
        content: {
          eyebrow: 'Our commitment',
          eyebrowAccent: 'red',
          heading: 'Principles that guide every product we make',
          align: 'center',
          items: [
            'Quality-driven healthcare solutions',
            'Scientifically backed products',
            'Ethical and transparent practices',
            'Patient-focused approach',
          ],
          background: 'paper',
        },
      },
      {
        type: 'cards_grid',
        content: {
          eyebrow: 'Explore Averon',
          eyebrowAccent: 'green',
          heading: 'Everything you need to know, in one place',
          align: 'left',
          columns: 3,
          cards: [
            { icon: 'molecule', accent: 'red', title: 'About Us', text: 'Our story, mission, vision and the values behind Averon Life Sciences.', href: '/about' },
            { icon: 'capsule', accent: 'green', title: 'Products', text: 'Pharmaceuticals, nutraceuticals and wellness solutions built on science.', href: '/products' },
            { icon: 'shield', accent: 'red', title: 'Quality', text: 'Stringent quality practices from development through to distribution.', href: '/quality' },
            { icon: 'flask', accent: 'green', title: 'Research & Innovation', text: 'Continuous scientific advancement in pursuit of better health outcomes.', href: '/research' },
            { icon: 'people', accent: 'red', title: 'Careers', text: 'Join a team building a healthier future through science and care.', href: '/careers' },
            { icon: 'pin', accent: 'green', title: 'Contact Us', text: 'Reach our corporate office and team in Bangalore, India.', href: '/contact' },
          ],
          background: 'white',
        },
      },
      {
        type: 'cta_band',
        content: {
          heading: 'Partner with Averon Life Sciences in our journey towards a healthier future.',
          text: 'Reach out to our team to explore partnerships, products or opportunities.',
          buttons: [{ label: 'Get in Touch', href: '/contact' }],
        },
      },
    ],
  ),
  page(
    'about',
    'About Us',
    'About Us',
    'About Us | Averon Life Sciences',
    'Learn about Averon Life Sciences — our story, mission, vision and the core values that guide our pharmaceutical and healthcare work.',
    2,
    true,
    [
      {
        type: 'page_hero',
        content: {
          breadcrumb: 'About Us',
          heading: 'Who We Are',
          lede: 'Averon Life Sciences is a pharmaceutical and healthcare company dedicated to improving health outcomes through innovative, reliable, and quality-driven healthcare solutions.',
          imageUrl:
            'https://images.unsplash.com/photo-1758518731706-be5d5230e5a5?auto=format&fit=crop&w=1200&q=80',
          imageAlt: 'Averon Life Sciences colleagues collaborating in a modern office',
        },
      },
      {
        type: 'rich_text',
        content: {
          eyebrow: 'The name Averon',
          eyebrowAccent: 'red',
          heading: 'An avenue of excellence in healthcare',
          align: 'left',
          paragraphs: [
            'The name Averon represents our vision of creating an avenue of excellence in healthcare, combining scientific advancement, quality manufacturing, and responsible healthcare practices.',
            'We aim to build a trusted healthcare ecosystem by delivering products that meet high standards of quality, safety, and effectiveness while addressing evolving healthcare needs.',
          ],
          background: 'white',
        },
      },
      { type: 'pulse_divider', content: {} },
      {
        type: 'statement',
        content: {
          eyebrow: 'Mission & vision',
          eyebrowAccent: 'red',
          heading: "What we stand for, and where we're headed",
          align: 'center',
          background: 'paper',
          statements: [
            {
              accent: 'red',
              kicker: 'Our Mission',
              quote:
                'To provide high-quality healthcare solutions through innovation, integrity, and excellence.',
              items: [
                'Develop and deliver reliable pharmaceutical and healthcare products',
                'Maintain the highest standards of quality and safety',
                'Support healthcare professionals with trusted solutions',
                'Improve patient well-being through continuous innovation',
              ],
            },
            {
              accent: 'green',
              kicker: 'Our Vision',
              quote:
                'To become a globally trusted healthcare company recognized for quality, innovation, and patient care.',
              items: [
                'A leading healthcare organization with positive impact on lives',
                'Advanced science paired with ethical practices',
                'Sustainable growth built for the long term',
              ],
            },
          ],
        },
      },
      {
        type: 'cards_grid',
        content: {
          eyebrow: 'Our core values',
          eyebrowAccent: 'green',
          heading: 'The principles behind every decision',
          align: 'center',
          columns: 3,
          cards: [
            { icon: 'shield', accent: 'red', title: 'Quality First', text: 'We are committed to maintaining the highest standards of quality, safety, and reliability in every product.' },
            { icon: 'bulb', accent: 'green', title: 'Innovation', text: 'We continuously explore scientific advancements to develop meaningful healthcare solutions.' },
            { icon: 'scales', accent: 'red', title: 'Integrity', text: 'We believe in ethical practices, transparency, and building long-term trust.' },
            { icon: 'heart', accent: 'green', title: 'Patient Care', text: 'Every decision we make is guided by our commitment to improving health and quality of life.' },
            { icon: 'medal', accent: 'red', title: 'Excellence', text: 'We continuously strive for improvement and excellence in everything we do.' },
          ],
          background: 'white',
        },
      },
      {
        type: 'cta_band',
        content: {
          heading: 'Partner with Averon Life Sciences in our journey towards a healthier future.',
          text: "We'd love to tell you more about who we are and where we're going.",
          buttons: [{ label: 'Get in Touch', href: '/contact' }],
        },
      },
    ],
  ),
  page(
    'products',
    'Products',
    'Products',
    'Products | Averon Life Sciences',
    'Averon Life Sciences delivers trusted pharmaceutical products, nutraceuticals, and wellness solutions built on scientific excellence and quality.',
    3,
    true,
    [
      {
        type: 'page_hero',
        content: {
          breadcrumb: 'Products',
          heading: 'Our Product Portfolio',
          lede: 'We focus on developing and delivering trusted pharmaceutical products, nutraceuticals, and wellness solutions — each built on scientific excellence, ethical practice, and a patient-centric approach.',
          imageUrl:
            'https://images.unsplash.com/photo-1523299174285-a59d80640155?auto=format&fit=crop&w=1200&q=80',
          imageAlt: 'Close-up of white pharmaceutical capsules',
        },
      },
      {
        type: 'product_catalog',
        content: {
          eyebrow: 'Product categories',
          eyebrowAccent: 'red',
          heading: 'Browse our range by category',
          intro: 'Choose a category, then pick a range to see the products within it.',
          align: 'left',
          background: 'white',
          emptyText:
            'Products for this range are being added shortly. Please check back soon.',
        },
      },
      { type: 'pulse_divider', content: {} },
      {
        type: 'process_steps',
        content: {
          eyebrow: 'From development to delivery',
          eyebrowAccent: 'green',
          heading: 'How every product reaches you',
          align: 'left',
          showIcons: false,
          background: 'paper',
          steps: [
            { label: '01 / Research & Development', title: 'Grounded in science', text: 'Formulations shaped by scientific advancement and evolving healthcare needs.' },
            { label: '02 / Quality Manufacturing', title: 'Built to a standard', text: 'Stringent quality practices are followed at every stage of production.' },
            { label: '03 / Distribution & Access', title: 'Reaching every partner', text: 'Reliable distribution to doctors, pharmacies and healthcare institutions.' },
          ],
        },
      },
      {
        type: 'cta_band',
        content: {
          heading: 'Interested in our product portfolio?',
          text: 'Get in touch with our team to learn more about our pharmaceutical, nutraceutical and wellness offerings.',
          buttons: [{ label: 'Contact Our Team', href: '/contact' }],
        },
      },
    ],
  ),
  page(
    'quality',
    'Quality',
    'Quality',
    'Quality | Averon Life Sciences',
    'Quality is the foundation of our operations — from product development to manufacturing and distribution.',
    4,
    true,
    [
      {
        type: 'page_hero',
        content: {
          breadcrumb: 'Quality',
          heading: 'Committed to Quality. Dedicated to Care.',
          lede: 'At Averon Life Sciences, quality is the foundation of our operations.',
          imageUrl:
            'https://images.unsplash.com/photo-1599727277643-b0c9cfb7705d?auto=format&fit=crop&w=1200&q=80',
          imageAlt: 'Automated laboratory equipment analyzing samples',
        },
      },
      {
        type: 'process_steps',
        content: {
          lede: 'From product development to manufacturing and distribution, we follow stringent quality practices to ensure safety, reliability, and effectiveness.',
          align: 'left',
          showIcons: true,
          background: 'white',
          steps: [
            { icon: 'flask', accent: 'red', title: 'Product Development', text: 'Every formulation begins with careful research and adherence to scientific and regulatory best practices.' },
            { icon: 'shield', accent: 'green', title: 'Manufacturing', text: 'Stringent quality checks are maintained throughout the manufacturing process to ensure consistency and safety.' },
            { icon: 'truck', accent: 'red', title: 'Distribution', text: 'Reliable distribution practices help ensure our products reach healthcare partners safely and efficiently.' },
          ],
        },
      },
      { type: 'pulse_divider', content: {} },
      {
        type: 'statement',
        content: {
          background: 'paper',
          statements: [
            {
              accent: 'green',
              kicker: 'Our Promise',
              quote:
                'Our promise is to deliver healthcare solutions that healthcare professionals and patients can trust.',
              items: [],
            },
          ],
        },
      },
      {
        type: 'chips',
        content: {
          eyebrow: 'What quality means to us',
          eyebrowAccent: 'red',
          heading: 'Safety. Reliability. Effectiveness.',
          align: 'center',
          background: 'white',
          chips: [
            { label: 'Safety-first formulation', accent: 'red' },
            { label: 'Consistent reliability', accent: 'green' },
            { label: 'Proven effectiveness', accent: 'red' },
            { label: 'Transparent practices', accent: 'green' },
            { label: 'Continuous quality checks', accent: 'red' },
          ],
        },
      },
      {
        type: 'cta_band',
        content: {
          heading: 'Questions about our quality standards?',
          text: 'Our team is happy to walk you through how we approach quality at every stage.',
          buttons: [{ label: 'Talk to Us', href: '/contact' }],
        },
      },
    ],
  ),
  page(
    'research',
    'Research & Innovation',
    'Research & Innovation',
    'Research & Innovation | Averon Life Sciences',
    'Driving healthcare forward through scientific advancement, emerging healthcare needs and continuous improvement.',
    5,
    true,
    [
      {
        type: 'page_hero',
        content: {
          breadcrumb: 'Research & Innovation',
          heading: 'Driving Healthcare Through Innovation',
          lede: 'Healthcare is constantly evolving, and innovation is essential for progress.',
          imageUrl:
            'https://images.unsplash.com/photo-1655814563963-0fe0a7d6c279?auto=format&fit=crop&w=1200&q=80',
          imageAlt: 'Scientist working in a laboratory',
        },
      },
      {
        type: 'rich_text',
        content: {
          eyebrow: 'Our approach',
          eyebrowAccent: 'red',
          heading: 'Focused on what moves healthcare forward',
          align: 'left',
          paragraphs: [
            'We focus on scientific advancement, emerging healthcare needs, and continuous improvement to develop solutions that contribute to better health outcomes.',
          ],
          background: 'white',
        },
      },
      { type: 'pulse_divider', content: {} },
      {
        type: 'cards_grid',
        content: {
          eyebrow: 'Focus areas',
          eyebrowAccent: 'green',
          heading: 'Where we direct our energy',
          align: 'left',
          columns: 3,
          background: 'paper',
          cards: [
            { icon: 'flask', accent: 'red', title: 'Scientific Advancement', text: 'Exploring emerging science to develop meaningful, evidence-based healthcare solutions.' },
            { icon: 'eye', accent: 'green', title: 'Emerging Healthcare Needs', text: 'Staying attuned to evolving patient and healthcare-provider needs to guide our focus.' },
            { icon: 'medal', accent: 'red', title: 'Continuous Improvement', text: 'Refining our processes and products on an ongoing basis for better health outcomes.' },
          ],
        },
      },
      {
        type: 'statement',
        content: {
          background: 'white',
          statements: [
            {
              accent: 'red',
              kicker: 'Why it matters',
              quote:
                'Every advancement we pursue is measured against one question: does it help us keep our promise — trust in every dose, care for every life.',
              items: [],
            },
          ],
        },
      },
      {
        type: 'cta_band',
        content: {
          heading: 'Passionate about advancing healthcare?',
          text: "We're always glad to connect with people who share our curiosity and commitment.",
          buttons: [{ label: 'Explore Careers', href: '/careers' }],
        },
      },
    ],
  ),
  page(
    'careers',
    'Careers',
    'Careers',
    'Careers | Averon Life Sciences',
    'Join Averon Life Sciences — we welcome talented professionals who share our passion for healthcare excellence and innovation.',
    6,
    true,
    [
      {
        type: 'page_hero',
        content: {
          breadcrumb: 'Careers',
          heading: 'Join Our Journey',
          lede: 'At Averon Life Sciences, we believe people are the foundation of our success.',
          imageUrl:
            'https://images.unsplash.com/photo-1758873269276-9518d0cb4a0b?auto=format&fit=crop&w=1200&q=80',
          imageAlt: 'Averon Life Sciences team collaborating together',
        },
      },
      {
        type: 'rich_text',
        content: {
          lede: 'We welcome talented professionals who share our passion for healthcare excellence and innovation.',
          align: 'left',
          paragraphs: [],
          background: 'white',
          spacing: 'tight',
        },
      },
      {
        type: 'perks',
        content: {
          eyebrow: 'Why build your career here',
          eyebrowAccent: 'red',
          heading: 'A culture shaped by our values',
          align: 'left',
          background: 'paper',
          spacing: 'tight',
          items: [
            { title: 'A Culture of Quality', text: 'We hold ourselves to high standards in everything we do, and support each other to meet them.' },
            { title: 'Room to Innovate', text: 'We encourage curiosity and welcome ideas that move healthcare forward.' },
            { title: 'Built on Integrity', text: 'We believe in transparency and ethical practice, inside the company and out.' },
            { title: 'Purpose-Driven Work', text: "Every role here connects back to improving someone's health and quality of life." },
          ],
        },
      },
      { type: 'pulse_divider', content: {} },
      {
        type: 'callout',
        content: {
          eyebrow: 'Current openings',
          eyebrowAccent: 'green',
          heading: "Don't see a role listed? Introduce yourself anyway.",
          align: 'center',
          background: 'white',
          text: "We don't have specific positions listed here right now, but we're always glad to hear from talented, passionate people. Send us your CV and a short note on what you're looking for, and we'll reach out when there's a fit.",
          cta: {
            label: 'Email Your CV',
            href: 'mailto:info@averonlifesciences.com?subject=Career%20Enquiry%20-%20Averon%20Life%20Sciences',
            icon: 'mail',
          },
        },
      },
      {
        type: 'cta_band',
        content: {
          heading: 'Have questions before you apply?',
          text: "Reach out to our team — we're happy to talk through where you might fit in.",
          buttons: [{ label: 'Contact Us', href: '/contact' }],
        },
      },
    ],
  ),
  page(
    'contact',
    'Contact Us',
    'Contact Us',
    'Contact Us | Averon Life Sciences',
    'Get in touch with Averon Life Sciences. Corporate office in Indiranagar, Bangalore, India.',
    7,
    false,
    [
      {
        type: 'page_hero',
        content: {
          breadcrumb: 'Contact Us',
          heading: "Let's Start a Conversation",
          lede: 'Partner with Averon Life Sciences in our journey towards a healthier future.',
          imageUrl:
            'https://images.unsplash.com/photo-1758691461957-474a7686e388?auto=format&fit=crop&w=1200&q=80',
          imageAlt: 'Doctor consulting with a patient',
        },
      },
      {
        type: 'contact_block',
        content: {
          eyebrow: 'Send a message',
          eyebrowAccent: 'red',
          heading: "We'd love to hear from you",
          background: 'white',
          subjects: ['General Enquiry', 'Product Enquiry', 'Partnership', 'Careers', 'Other'],
          note: 'We usually reply within one working day.',
          successMessage:
            "Thank you — your message has reached our team. We'll be in touch shortly.",
          showMap: true,
          infoCards: [
            {
              icon: 'pin',
              accent: 'red',
              title: 'Corporate Office',
              lines: [
                '648/A, 4th Floor, OM Chambers,',
                'Binnamangala 1st Stage, Indiranagar,',
                'Bangalore – 560038, Karnataka, India.',
              ],
            },
            {
              icon: 'mail',
              accent: 'green',
              title: 'Email',
              lines: ['info@averonlifesciences.com'],
              href: 'mailto:info@averonlifesciences.com',
            },
          ],
        },
      },
    ],
  ),
];

/** Sample catalog shown until real categories are added in the admin panel. */
export const DEFAULT_CATALOG: CatalogCategory[] = [
  {
    id: 'local-cat-pharma',
    name: 'Pharmaceuticals',
    slug: 'pharmaceuticals',
    tagline: 'Quality-assured formulations',
    description:
      'Quality-assured pharmaceutical formulations, developed to support healthcare professionals and patients with safe, effective and reliable options.',
    image_url:
      'https://images.unsplash.com/photo-1523299174285-a59d80640155?auto=format&fit=crop&w=900&q=80',
    icon: 'capsule',
    accent: 'red',
    sort_order: 1,
    is_active: true,
    subcategories: [
      {
        id: 'local-sub-anti',
        category_id: 'local-cat-pharma',
        name: 'Anti-Infectives',
        slug: 'anti-infectives',
        description:
          'Antibacterial and antimicrobial formulations for common and resistant infections.',
        image_url: null,
        sort_order: 1,
        is_default: true,
        is_active: true,
        products: [
          { id: 'p1', subcategory_id: 'local-sub-anti', name: 'Averocef 200', slug: 'averocef-200', composition: 'Cefixime 200 mg', description: 'Third-generation cephalosporin for respiratory and urinary tract infections.', image_url: null, pack_size: '10 x 10 Tablets', dosage_form: 'Tablet', highlights: ['Broad spectrum', 'Twice daily'], sort_order: 1, is_active: true, is_featured: false },
          { id: 'p2', subcategory_id: 'local-sub-anti', name: 'Averoclav 625', slug: 'averoclav-625', composition: 'Amoxycillin 500 mg + Clavulanic Acid 125 mg', description: 'Beta-lactam combination for a wide range of bacterial infections.', image_url: null, pack_size: '10 x 6 Tablets', dosage_form: 'Tablet', highlights: ['Beta-lactamase protected'], sort_order: 2, is_active: true, is_featured: false },
          { id: 'p3', subcategory_id: 'local-sub-anti', name: 'Averozid 500', slug: 'averozid-500', composition: 'Azithromycin 500 mg', description: 'Macrolide antibiotic with a convenient short course.', image_url: null, pack_size: '1 x 3 Tablets', dosage_form: 'Tablet', highlights: ['3-day course', 'Once daily'], sort_order: 3, is_active: true, is_featured: false },
        ],
      },
      {
        id: 'local-sub-pain',
        category_id: 'local-cat-pharma',
        name: 'Pain & Inflammation',
        slug: 'pain-inflammation',
        description: 'Analgesic and anti-inflammatory formulations for acute and chronic pain.',
        image_url: null,
        sort_order: 2,
        is_default: false,
        is_active: true,
        products: [
          { id: 'p4', subcategory_id: 'local-sub-pain', name: 'Averodol P', slug: 'averodol-p', composition: 'Aceclofenac 100 mg + Paracetamol 325 mg', description: 'Dual-action relief for musculoskeletal and post-operative pain.', image_url: null, pack_size: '10 x 10 Tablets', dosage_form: 'Tablet', highlights: ['Fast onset'], sort_order: 1, is_active: true, is_featured: false },
          { id: 'p5', subcategory_id: 'local-sub-pain', name: 'Averonac SP', slug: 'averonac-sp', composition: 'Aceclofenac 100 mg + Paracetamol 325 mg + Serratiopeptidase 15 mg', description: 'Anti-inflammatory combination with enzymatic anti-oedema action.', image_url: null, pack_size: '10 x 10 Tablets', dosage_form: 'Tablet', highlights: ['Reduces swelling'], sort_order: 2, is_active: true, is_featured: false },
        ],
      },
      {
        id: 'local-sub-gastro',
        category_id: 'local-cat-pharma',
        name: 'Gastro Care',
        slug: 'gastro-care',
        description: 'Acid control, digestive and gut-health formulations.',
        image_url: null,
        sort_order: 3,
        is_default: false,
        is_active: true,
        products: [
          { id: 'p6', subcategory_id: 'local-sub-gastro', name: 'Averopan DSR', slug: 'averopan-dsr', composition: 'Pantoprazole 40 mg + Domperidone 30 mg (SR)', description: 'Proton pump inhibitor with prokinetic for reflux and dyspepsia.', image_url: null, pack_size: '10 x 10 Capsules', dosage_form: 'Capsule', highlights: ['Sustained release'], sort_order: 1, is_active: true, is_featured: false },
          { id: 'p7', subcategory_id: 'local-sub-gastro', name: 'Averozyme Syrup', slug: 'averozyme-syrup', composition: 'Digestive enzyme blend', description: 'Palatable enzyme syrup supporting digestion and appetite.', image_url: null, pack_size: '200 ml Bottle', dosage_form: 'Syrup', highlights: ['Sugar-free'], sort_order: 2, is_active: true, is_featured: false },
        ],
      },
    ],
  },
  {
    id: 'local-cat-nutra',
    name: 'Nutraceuticals',
    slug: 'nutraceuticals',
    tagline: 'Science-backed nutrition',
    description:
      'Science-backed nutraceutical solutions formulated to support everyday wellness, nutrition, and preventive health.',
    image_url:
      'https://images.unsplash.com/photo-1734607402878-eeb4233cea86?auto=format&fit=crop&w=900&q=80',
    icon: 'leaf',
    accent: 'green',
    sort_order: 2,
    is_active: true,
    subcategories: [
      {
        id: 'local-sub-vit',
        category_id: 'local-cat-nutra',
        name: 'Vitamins & Minerals',
        slug: 'vitamins-minerals',
        description: 'Daily micronutrient support for energy, immunity and recovery.',
        image_url: null,
        sort_order: 1,
        is_default: true,
        is_active: true,
        products: [
          { id: 'p8', subcategory_id: 'local-sub-vit', name: 'Averovit Gold', slug: 'averovit-gold', composition: 'Multivitamin + Multimineral + Antioxidants', description: 'Comprehensive daily supplement for adults.', image_url: null, pack_size: '10 x 10 Softgels', dosage_form: 'Softgel', highlights: ['Once daily', 'Antioxidant rich'], sort_order: 1, is_active: true, is_featured: false },
          { id: 'p9', subcategory_id: 'local-sub-vit', name: 'Avero D3 60K', slug: 'avero-d3-60k', composition: 'Cholecalciferol 60000 IU', description: 'Weekly vitamin D3 sachet for deficiency correction.', image_url: null, pack_size: '4 Sachets', dosage_form: 'Sachet', highlights: ['Weekly dose'], sort_order: 2, is_active: true, is_featured: false },
          { id: 'p10', subcategory_id: 'local-sub-vit', name: 'Averofer XT', slug: 'averofer-xt', composition: 'Ferrous Ascorbate 100 mg + Folic Acid 1.5 mg', description: 'Iron supplementation with improved tolerability.', image_url: null, pack_size: '10 x 10 Tablets', dosage_form: 'Tablet', highlights: ['Gentle on stomach'], sort_order: 3, is_active: true, is_featured: false },
        ],
      },
      {
        id: 'local-sub-bone',
        category_id: 'local-cat-nutra',
        name: 'Bone & Joint',
        slug: 'bone-joint',
        description: 'Calcium, collagen and joint-mobility formulations.',
        image_url: null,
        sort_order: 2,
        is_default: false,
        is_active: true,
        products: [
          { id: 'p11', subcategory_id: 'local-sub-bone', name: 'Averocal K2', slug: 'averocal-k2', composition: 'Calcium Citrate 1000 mg + Vitamin D3 + Vitamin K2-7', description: 'Bone-mineral support with directed calcium utilisation.', image_url: null, pack_size: '10 x 10 Tablets', dosage_form: 'Tablet', highlights: ['With K2-7'], sort_order: 1, is_active: true, is_featured: false },
          { id: 'p12', subcategory_id: 'local-sub-bone', name: 'Averojoint Plus', slug: 'averojoint-plus', composition: 'Glucosamine + Diacerein + MSM', description: 'Joint comfort and cartilage support.', image_url: null, pack_size: '10 x 10 Tablets', dosage_form: 'Tablet', highlights: ['Cartilage support'], sort_order: 2, is_active: true, is_featured: false },
        ],
      },
    ],
  },
  {
    id: 'local-cat-well',
    name: 'Wellness Solutions',
    slug: 'wellness-solutions',
    tagline: 'Everyday care',
    description:
      'A growing range of wellness-oriented healthcare products, designed around the everyday needs of patients and their families.',
    image_url:
      'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&w=900&q=80',
    icon: 'heart',
    accent: 'red',
    sort_order: 3,
    is_active: true,
    subcategories: [
      {
        id: 'local-sub-immu',
        category_id: 'local-cat-well',
        name: 'Immunity & Daily Wellness',
        slug: 'immunity-daily-wellness',
        description: 'Everyday wellness products for the whole family.',
        image_url: null,
        sort_order: 1,
        is_default: true,
        is_active: true,
        products: [
          { id: 'p13', subcategory_id: 'local-sub-immu', name: 'Avero Immuno Boost', slug: 'avero-immuno-boost', composition: 'Vitamin C + Zinc + Elderberry Extract', description: 'Daily immunity support with natural antioxidants.', image_url: null, pack_size: '10 x 10 Tablets', dosage_form: 'Tablet', highlights: ['Natural extract'], sort_order: 1, is_active: true, is_featured: false },
          { id: 'p14', subcategory_id: 'local-sub-immu', name: 'Avero Protein Care', slug: 'avero-protein-care', composition: 'Whey Protein + Vitamins + Minerals', description: 'Nutritional protein blend for recovery and daily nutrition.', image_url: null, pack_size: '200 g Jar', dosage_form: 'Powder', highlights: ['Chocolate flavour'], sort_order: 2, is_active: true, is_featured: false },
        ],
      },
      {
        id: 'local-sub-skin',
        category_id: 'local-cat-well',
        name: 'Skin & Hair Care',
        slug: 'skin-hair-care',
        description: 'Dermatology-inspired wellness for skin, hair and nails.',
        image_url: null,
        sort_order: 2,
        is_default: false,
        is_active: true,
        products: [
          { id: 'p15', subcategory_id: 'local-sub-skin', name: 'Averobiotin Plus', slug: 'averobiotin-plus', composition: 'Biotin 10 mg + Amino Acids + Minerals', description: 'Supports hair strength, skin health and nail growth.', image_url: null, pack_size: '10 x 10 Tablets', dosage_form: 'Tablet', highlights: ['High-strength biotin'], sort_order: 1, is_active: true, is_featured: false },
        ],
      },
    ],
  },
];
