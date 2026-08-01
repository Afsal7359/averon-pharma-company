-- =========================================================================
-- AVERON LIFE SCIENCES — seed content
-- Run AFTER schema.sql. Re-running resets all page content back to this
-- baseline (product catalog rows are only inserted if the tables are empty).
-- =========================================================================

-- -------------------------------------------------------------------------
-- SITE SETTINGS
-- -------------------------------------------------------------------------
insert into public.site_settings (key, value) values
('brand', jsonb_build_object(
  'name',        'Averon Life Sciences',
  'tagline',     'Trust in Every Dose. Care for Every Life.',
  'logoUrl',     '/assets/logo.png',
  'faviconUrl',  '/assets/favicon.svg',
  'description', 'A pharmaceutical and healthcare company committed to delivering high-quality, safe, and effective healthcare solutions that improve lives.'
)),
('contact', jsonb_build_object(
  'addressLines', jsonb_build_array(
      '648/A, 4th Floor, OM Chambers,',
      'Binnamangala 1st Stage, Indiranagar,',
      'Bangalore – 560038, Karnataka, India.'),
  'email',    'info@averonlifesciences.com',
  'phone',    '',
  'mapQuery', 'OM Chambers, Binnamangala 1st Stage, Indiranagar, Bangalore 560038, Karnataka, India'
)),
('header', jsonb_build_object(
  'ctaLabel',       'Contact Us',
  'ctaHref',        '/contact',
  'mobileCtaLabel', 'Partner With Us',
  'mobileCtaHref',  '/contact'
)),
('footer', jsonb_build_object(
  'columns', jsonb_build_array(
    jsonb_build_object('title', 'Explore', 'links', jsonb_build_array(
      jsonb_build_object('label', 'About Us', 'href', '/about'),
      jsonb_build_object('label', 'Products', 'href', '/products'),
      jsonb_build_object('label', 'Quality', 'href', '/quality'),
      jsonb_build_object('label', 'Research & Innovation', 'href', '/research'))),
    jsonb_build_object('title', 'Company', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Careers', 'href', '/careers'),
      jsonb_build_object('label', 'Contact Us', 'href', '/contact'),
      jsonb_build_object('label', 'Home', 'href', '/')))
  ),
  'contactTitle', 'Get in Touch',
  'copyright',    'Averon Life Sciences. All rights reserved.'
)),
('seo', jsonb_build_object(
  'siteUrl',      'https://www.averonlifesciences.com',
  'titleDefault', 'Averon Life Sciences | Trust in Every Dose. Care for Every Life.',
  'description',  'Averon Life Sciences is a pharmaceutical and healthcare company delivering high-quality, safe and effective pharmaceutical, nutraceutical and wellness solutions.'
))
on conflict (key) do update set value = excluded.value, updated_at = now();

-- -------------------------------------------------------------------------
-- PAGES
-- -------------------------------------------------------------------------
insert into public.pages (slug, title, nav_label, meta_title, meta_description, sort_order, show_in_nav, is_system) values
('home', 'Home', 'Home',
 'Averon Life Sciences | Trust in Every Dose. Care for Every Life.',
 'Averon Life Sciences is a pharmaceutical and healthcare company delivering high-quality, safe and effective pharmaceutical, nutraceutical and wellness solutions.',
 1, true, true),
('about', 'About Us', 'About Us',
 'About Us | Averon Life Sciences',
 'Learn about Averon Life Sciences — our story, mission, vision and the core values that guide our pharmaceutical and healthcare work.',
 2, true, true),
('products', 'Products', 'Products',
 'Products | Averon Life Sciences',
 'Averon Life Sciences delivers trusted pharmaceutical products, nutraceuticals, and wellness solutions built on scientific excellence and quality.',
 3, true, true),
('quality', 'Quality', 'Quality',
 'Quality | Averon Life Sciences',
 'Quality is the foundation of our operations — from product development to manufacturing and distribution.',
 4, true, true),
('research', 'Research & Innovation', 'Research & Innovation',
 'Research & Innovation | Averon Life Sciences',
 'Driving healthcare forward through scientific advancement, emerging healthcare needs and continuous improvement.',
 5, true, true),
('careers', 'Careers', 'Careers',
 'Careers | Averon Life Sciences',
 'Join Averon Life Sciences — we welcome talented professionals who share our passion for healthcare excellence and innovation.',
 6, true, true),
('contact', 'Contact Us', 'Contact Us',
 'Contact Us | Averon Life Sciences',
 'Get in touch with Averon Life Sciences. Corporate office in Indiranagar, Bangalore, India.',
 7, false, true)
on conflict (slug) do update set
  title = excluded.title,
  nav_label = excluded.nav_label,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  sort_order = excluded.sort_order,
  is_system = true;

-- Reset sections so this file is the single source of truth for the baseline.
delete from public.page_sections
 where page_id in (select id from public.pages
                    where slug in ('home','about','products','quality','research','careers','contact'));

-- -------------------------------------------------------------------------
-- HOME
-- -------------------------------------------------------------------------
insert into public.page_sections (page_id, type, sort_order, content)
select id, v.type, v.sort_order, v.content
from public.pages, (values
(
  'hero', 1, jsonb_build_object(
    'tag', 'Trust in Every Dose · Care for Every Life',
    'headingLines', jsonb_build_array('Advancing Healthcare', 'Through Quality, Innovation', '& Trust'),
    'gradientWord', 'Innovation',
    'subtitle', 'Welcome to Averon Life Sciences, a pharmaceutical and healthcare company committed to delivering high-quality, safe, and effective healthcare solutions that improve lives.',
    'primaryCta',   jsonb_build_object('label', 'Explore Our Products', 'href', '/products'),
    'secondaryCta', jsonb_build_object('label', 'Discover Our Story',  'href', '/about'),
    'imageUrl', 'https://images.unsplash.com/photo-1758691461957-474a7686e388?auto=format&fit=crop&w=1800&q=80',
    'imageAlt', 'Doctor consulting with a patient in a modern clinic'
  )
),
(
  'rich_text', 2, jsonb_build_object(
    'eyebrow', 'Who we are',
    'eyebrowAccent', 'red',
    'heading', 'Driven by science. Guided by care.',
    'align', 'left',
    'paragraphs', jsonb_build_array(
      'Driven by scientific excellence, ethical practices, and a patient-centric approach, we focus on developing and delivering trusted pharmaceutical products, nutraceuticals, and wellness solutions.',
      'With a commitment to quality, innovation, and responsibility, Averon Life Sciences strives to become a trusted healthcare partner for doctors, patients, pharmacies, and healthcare institutions.'),
    'cta', jsonb_build_object('label', 'More About Averon', 'href', '/about', 'style', 'ghost-green'),
    'background', 'white'
  )
),
('pulse_divider', 3, '{}'::jsonb),
(
  'checklist', 4, jsonb_build_object(
    'eyebrow', 'Our commitment',
    'eyebrowAccent', 'red',
    'heading', 'Principles that guide every product we make',
    'align', 'center',
    'items', jsonb_build_array(
      'Quality-driven healthcare solutions',
      'Scientifically backed products',
      'Ethical and transparent practices',
      'Patient-focused approach'),
    'background', 'paper'
  )
),
(
  'cards_grid', 5, jsonb_build_object(
    'eyebrow', 'Explore Averon',
    'eyebrowAccent', 'green',
    'heading', 'Everything you need to know, in one place',
    'align', 'left',
    'columns', 3,
    'cards', jsonb_build_array(
      jsonb_build_object('icon','molecule','accent','red','title','About Us','text','Our story, mission, vision and the values behind Averon Life Sciences.','href','/about'),
      jsonb_build_object('icon','capsule','accent','green','title','Products','text','Pharmaceuticals, nutraceuticals and wellness solutions built on science.','href','/products'),
      jsonb_build_object('icon','shield','accent','red','title','Quality','text','Stringent quality practices from development through to distribution.','href','/quality'),
      jsonb_build_object('icon','flask','accent','green','title','Research & Innovation','text','Continuous scientific advancement in pursuit of better health outcomes.','href','/research'),
      jsonb_build_object('icon','people','accent','red','title','Careers','text','Join a team building a healthier future through science and care.','href','/careers'),
      jsonb_build_object('icon','pin','accent','green','title','Contact Us','text','Reach our corporate office and team in Bangalore, India.','href','/contact')),
    'background', 'white'
  )
),
(
  'cta_band', 6, jsonb_build_object(
    'heading', 'Partner with Averon Life Sciences in our journey towards a healthier future.',
    'text', 'Reach out to our team to explore partnerships, products or opportunities.',
    'buttons', jsonb_build_array(jsonb_build_object('label','Get in Touch','href','/contact'))
  )
)
) as v(type, sort_order, content)
where public.pages.slug = 'home';

-- -------------------------------------------------------------------------
-- ABOUT
-- -------------------------------------------------------------------------
insert into public.page_sections (page_id, type, sort_order, content)
select id, v.type, v.sort_order, v.content
from public.pages, (values
(
  'page_hero', 1, jsonb_build_object(
    'breadcrumb', 'About Us',
    'heading', 'Who We Are',
    'lede', 'Averon Life Sciences is a pharmaceutical and healthcare company dedicated to improving health outcomes through innovative, reliable, and quality-driven healthcare solutions.',
    'imageUrl', 'https://images.unsplash.com/photo-1758518731706-be5d5230e5a5?auto=format&fit=crop&w=1200&q=80',
    'imageAlt', 'Averon Life Sciences colleagues collaborating in a modern office'
  )
),
(
  'rich_text', 2, jsonb_build_object(
    'eyebrow', 'The name Averon',
    'eyebrowAccent', 'red',
    'heading', 'An avenue of excellence in healthcare',
    'align', 'left',
    'paragraphs', jsonb_build_array(
      'The name Averon represents our vision of creating an avenue of excellence in healthcare, combining scientific advancement, quality manufacturing, and responsible healthcare practices.',
      'We aim to build a trusted healthcare ecosystem by delivering products that meet high standards of quality, safety, and effectiveness while addressing evolving healthcare needs.'),
    'background', 'white'
  )
),
('pulse_divider', 3, '{}'::jsonb),
(
  'statement', 4, jsonb_build_object(
    'eyebrow', 'Mission & vision',
    'eyebrowAccent', 'red',
    'heading', 'What we stand for, and where we''re headed',
    'align', 'center',
    'background', 'paper',
    'statements', jsonb_build_array(
      jsonb_build_object('accent','red','kicker','Our Mission',
        'quote','To provide high-quality healthcare solutions through innovation, integrity, and excellence.',
        'items', jsonb_build_array(
          'Develop and deliver reliable pharmaceutical and healthcare products',
          'Maintain the highest standards of quality and safety',
          'Support healthcare professionals with trusted solutions',
          'Improve patient well-being through continuous innovation')),
      jsonb_build_object('accent','green','kicker','Our Vision',
        'quote','To become a globally trusted healthcare company recognized for quality, innovation, and patient care.',
        'items', jsonb_build_array(
          'A leading healthcare organization with positive impact on lives',
          'Advanced science paired with ethical practices',
          'Sustainable growth built for the long term')))
  )
),
(
  'cards_grid', 5, jsonb_build_object(
    'eyebrow', 'Our core values',
    'eyebrowAccent', 'green',
    'heading', 'The principles behind every decision',
    'align', 'center',
    'columns', 3,
    'cards', jsonb_build_array(
      jsonb_build_object('icon','shield','accent','red','title','Quality First','text','We are committed to maintaining the highest standards of quality, safety, and reliability in every product.'),
      jsonb_build_object('icon','bulb','accent','green','title','Innovation','text','We continuously explore scientific advancements to develop meaningful healthcare solutions.'),
      jsonb_build_object('icon','scales','accent','red','title','Integrity','text','We believe in ethical practices, transparency, and building long-term trust.'),
      jsonb_build_object('icon','heart','accent','green','title','Patient Care','text','Every decision we make is guided by our commitment to improving health and quality of life.'),
      jsonb_build_object('icon','medal','accent','red','title','Excellence','text','We continuously strive for improvement and excellence in everything we do.')),
    'background', 'white'
  )
),
(
  'cta_band', 6, jsonb_build_object(
    'heading', 'Partner with Averon Life Sciences in our journey towards a healthier future.',
    'text', 'We''d love to tell you more about who we are and where we''re going.',
    'buttons', jsonb_build_array(jsonb_build_object('label','Get in Touch','href','/contact'))
  )
)
) as v(type, sort_order, content)
where public.pages.slug = 'about';

-- -------------------------------------------------------------------------
-- PRODUCTS
-- -------------------------------------------------------------------------
insert into public.page_sections (page_id, type, sort_order, content)
select id, v.type, v.sort_order, v.content
from public.pages, (values
(
  'page_hero', 1, jsonb_build_object(
    'breadcrumb', 'Products',
    'heading', 'Our Product Portfolio',
    'lede', 'We focus on developing and delivering trusted pharmaceutical products, nutraceuticals, and wellness solutions — each built on scientific excellence, ethical practice, and a patient-centric approach.',
    'imageUrl', 'https://images.unsplash.com/photo-1523299174285-a59d80640155?auto=format&fit=crop&w=1200&q=80',
    'imageAlt', 'Close-up of white pharmaceutical capsules'
  )
),
(
  'product_catalog', 2, jsonb_build_object(
    'eyebrow', 'Product categories',
    'eyebrowAccent', 'red',
    'heading', 'Browse our range by category',
    'intro', 'Choose a category, then pick a range to see the products within it.',
    'align', 'left',
    'background', 'white',
    'emptyText', 'Products for this range are being added shortly. Please check back soon.'
  )
),
('pulse_divider', 3, '{}'::jsonb),
(
  'process_steps', 4, jsonb_build_object(
    'eyebrow', 'From development to delivery',
    'eyebrowAccent', 'green',
    'heading', 'How every product reaches you',
    'align', 'left',
    'showIcons', false,
    'background', 'paper',
    'steps', jsonb_build_array(
      jsonb_build_object('label','01 / Research & Development','title','Grounded in science','text','Formulations shaped by scientific advancement and evolving healthcare needs.'),
      jsonb_build_object('label','02 / Quality Manufacturing','title','Built to a standard','text','Stringent quality practices are followed at every stage of production.'),
      jsonb_build_object('label','03 / Distribution & Access','title','Reaching every partner','text','Reliable distribution to doctors, pharmacies and healthcare institutions.'))
  )
),
(
  'cta_band', 5, jsonb_build_object(
    'heading', 'Interested in our product portfolio?',
    'text', 'Get in touch with our team to learn more about our pharmaceutical, nutraceutical and wellness offerings.',
    'buttons', jsonb_build_array(jsonb_build_object('label','Contact Our Team','href','/contact'))
  )
)
) as v(type, sort_order, content)
where public.pages.slug = 'products';

-- -------------------------------------------------------------------------
-- QUALITY
-- -------------------------------------------------------------------------
insert into public.page_sections (page_id, type, sort_order, content)
select id, v.type, v.sort_order, v.content
from public.pages, (values
(
  'page_hero', 1, jsonb_build_object(
    'breadcrumb', 'Quality',
    'heading', 'Committed to Quality. Dedicated to Care.',
    'lede', 'At Averon Life Sciences, quality is the foundation of our operations.',
    'imageUrl', 'https://images.unsplash.com/photo-1599727277643-b0c9cfb7705d?auto=format&fit=crop&w=1200&q=80',
    'imageAlt', 'Automated laboratory equipment analyzing samples'
  )
),
(
  'process_steps', 2, jsonb_build_object(
    'lede', 'From product development to manufacturing and distribution, we follow stringent quality practices to ensure safety, reliability, and effectiveness.',
    'align', 'left',
    'showIcons', true,
    'background', 'white',
    'steps', jsonb_build_array(
      jsonb_build_object('icon','flask','accent','red','title','Product Development','text','Every formulation begins with careful research and adherence to scientific and regulatory best practices.'),
      jsonb_build_object('icon','shield','accent','green','title','Manufacturing','text','Stringent quality checks are maintained throughout the manufacturing process to ensure consistency and safety.'),
      jsonb_build_object('icon','truck','accent','red','title','Distribution','text','Reliable distribution practices help ensure our products reach healthcare partners safely and efficiently.'))
  )
),
('pulse_divider', 3, '{}'::jsonb),
(
  'statement', 4, jsonb_build_object(
    'background', 'paper',
    'statements', jsonb_build_array(
      jsonb_build_object('accent','green','kicker','Our Promise',
        'quote','Our promise is to deliver healthcare solutions that healthcare professionals and patients can trust.',
        'items', jsonb_build_array()))
  )
),
(
  'chips', 5, jsonb_build_object(
    'eyebrow', 'What quality means to us',
    'eyebrowAccent', 'red',
    'heading', 'Safety. Reliability. Effectiveness.',
    'align', 'center',
    'background', 'white',
    'chips', jsonb_build_array(
      jsonb_build_object('label','Safety-first formulation','accent','red'),
      jsonb_build_object('label','Consistent reliability','accent','green'),
      jsonb_build_object('label','Proven effectiveness','accent','red'),
      jsonb_build_object('label','Transparent practices','accent','green'),
      jsonb_build_object('label','Continuous quality checks','accent','red'))
  )
),
(
  'cta_band', 6, jsonb_build_object(
    'heading', 'Questions about our quality standards?',
    'text', 'Our team is happy to walk you through how we approach quality at every stage.',
    'buttons', jsonb_build_array(jsonb_build_object('label','Talk to Us','href','/contact'))
  )
)
) as v(type, sort_order, content)
where public.pages.slug = 'quality';

-- -------------------------------------------------------------------------
-- RESEARCH & INNOVATION
-- -------------------------------------------------------------------------
insert into public.page_sections (page_id, type, sort_order, content)
select id, v.type, v.sort_order, v.content
from public.pages, (values
(
  'page_hero', 1, jsonb_build_object(
    'breadcrumb', 'Research & Innovation',
    'heading', 'Driving Healthcare Through Innovation',
    'lede', 'Healthcare is constantly evolving, and innovation is essential for progress.',
    'imageUrl', 'https://images.unsplash.com/photo-1655814563963-0fe0a7d6c279?auto=format&fit=crop&w=1200&q=80',
    'imageAlt', 'Scientist working in a laboratory'
  )
),
(
  'rich_text', 2, jsonb_build_object(
    'eyebrow', 'Our approach',
    'eyebrowAccent', 'red',
    'heading', 'Focused on what moves healthcare forward',
    'align', 'left',
    'paragraphs', jsonb_build_array(
      'We focus on scientific advancement, emerging healthcare needs, and continuous improvement to develop solutions that contribute to better health outcomes.'),
    'background', 'white'
  )
),
('pulse_divider', 3, '{}'::jsonb),
(
  'cards_grid', 4, jsonb_build_object(
    'eyebrow', 'Focus areas',
    'eyebrowAccent', 'green',
    'heading', 'Where we direct our energy',
    'align', 'left',
    'columns', 3,
    'background', 'paper',
    'cards', jsonb_build_array(
      jsonb_build_object('icon','flask','accent','red','title','Scientific Advancement','text','Exploring emerging science to develop meaningful, evidence-based healthcare solutions.'),
      jsonb_build_object('icon','eye','accent','green','title','Emerging Healthcare Needs','text','Staying attuned to evolving patient and healthcare-provider needs to guide our focus.'),
      jsonb_build_object('icon','medal','accent','red','title','Continuous Improvement','text','Refining our processes and products on an ongoing basis for better health outcomes.'))
  )
),
(
  'statement', 5, jsonb_build_object(
    'background', 'white',
    'statements', jsonb_build_array(
      jsonb_build_object('accent','red','kicker','Why it matters',
        'quote','Every advancement we pursue is measured against one question: does it help us keep our promise — trust in every dose, care for every life.',
        'items', jsonb_build_array()))
  )
),
(
  'cta_band', 6, jsonb_build_object(
    'heading', 'Passionate about advancing healthcare?',
    'text', 'We''re always glad to connect with people who share our curiosity and commitment.',
    'buttons', jsonb_build_array(jsonb_build_object('label','Explore Careers','href','/careers'))
  )
)
) as v(type, sort_order, content)
where public.pages.slug = 'research';

-- -------------------------------------------------------------------------
-- CAREERS
-- -------------------------------------------------------------------------
insert into public.page_sections (page_id, type, sort_order, content)
select id, v.type, v.sort_order, v.content
from public.pages, (values
(
  'page_hero', 1, jsonb_build_object(
    'breadcrumb', 'Careers',
    'heading', 'Join Our Journey',
    'lede', 'At Averon Life Sciences, we believe people are the foundation of our success.',
    'imageUrl', 'https://images.unsplash.com/photo-1758873269276-9518d0cb4a0b?auto=format&fit=crop&w=1200&q=80',
    'imageAlt', 'Averon Life Sciences team collaborating together'
  )
),
(
  'rich_text', 2, jsonb_build_object(
    'lede', 'We welcome talented professionals who share our passion for healthcare excellence and innovation.',
    'align', 'left',
    'paragraphs', jsonb_build_array(),
    'background', 'white',
    'spacing', 'tight'
  )
),
(
  'perks', 3, jsonb_build_object(
    'eyebrow', 'Why build your career here',
    'eyebrowAccent', 'red',
    'heading', 'A culture shaped by our values',
    'align', 'left',
    'background', 'paper',
    'spacing', 'tight',
    'items', jsonb_build_array(
      jsonb_build_object('title','A Culture of Quality','text','We hold ourselves to high standards in everything we do, and support each other to meet them.'),
      jsonb_build_object('title','Room to Innovate','text','We encourage curiosity and welcome ideas that move healthcare forward.'),
      jsonb_build_object('title','Built on Integrity','text','We believe in transparency and ethical practice, inside the company and out.'),
      jsonb_build_object('title','Purpose-Driven Work','text','Every role here connects back to improving someone''s health and quality of life.'))
  )
),
('pulse_divider', 4, '{}'::jsonb),
(
  'callout', 5, jsonb_build_object(
    'eyebrow', 'Current openings',
    'eyebrowAccent', 'green',
    'heading', 'Don''t see a role listed? Introduce yourself anyway.',
    'align', 'center',
    'background', 'white',
    'text', 'We don''t have specific positions listed here right now, but we''re always glad to hear from talented, passionate people. Send us your CV and a short note on what you''re looking for, and we''ll reach out when there''s a fit.',
    'cta', jsonb_build_object('label','Email Your CV','href','mailto:info@averonlifesciences.com?subject=Career%20Enquiry%20-%20Averon%20Life%20Sciences','icon','mail')
  )
),
(
  'cta_band', 6, jsonb_build_object(
    'heading', 'Have questions before you apply?',
    'text', 'Reach out to our team — we''re happy to talk through where you might fit in.',
    'buttons', jsonb_build_array(jsonb_build_object('label','Contact Us','href','/contact'))
  )
)
) as v(type, sort_order, content)
where public.pages.slug = 'careers';

-- -------------------------------------------------------------------------
-- CONTACT
-- -------------------------------------------------------------------------
insert into public.page_sections (page_id, type, sort_order, content)
select id, v.type, v.sort_order, v.content
from public.pages, (values
(
  'page_hero', 1, jsonb_build_object(
    'breadcrumb', 'Contact Us',
    'heading', 'Let''s Start a Conversation',
    'lede', 'Partner with Averon Life Sciences in our journey towards a healthier future.',
    'imageUrl', 'https://images.unsplash.com/photo-1758691461957-474a7686e388?auto=format&fit=crop&w=1200&q=80',
    'imageAlt', 'Doctor consulting with a patient'
  )
),
(
  'contact_block', 2, jsonb_build_object(
    'eyebrow', 'Send a message',
    'eyebrowAccent', 'red',
    'heading', 'We''d love to hear from you',
    'background', 'white',
    'subjects', jsonb_build_array('General Enquiry','Product Enquiry','Partnership','Careers','Other'),
    'note', 'We usually reply within one working day.',
    'successMessage', 'Thank you — your message has reached our team. We''ll be in touch shortly.',
    'showMap', true,
    'infoCards', jsonb_build_array(
      jsonb_build_object('icon','pin','accent','red','title','Corporate Office','lines', jsonb_build_array(
        '648/A, 4th Floor, OM Chambers,','Binnamangala 1st Stage, Indiranagar,','Bangalore – 560038, Karnataka, India.')),
      jsonb_build_object('icon','mail','accent','green','title','Email','lines', jsonb_build_array('info@averonlifesciences.com'),
        'href','mailto:info@averonlifesciences.com'))
  )
)
) as v(type, sort_order, content)
where public.pages.slug = 'contact';

-- -------------------------------------------------------------------------
-- PRODUCT CATALOG — sample structure (only seeded when tables are empty)
-- -------------------------------------------------------------------------
do $$
declare
  cat_pharma uuid; cat_nutra uuid; cat_well uuid;
  sub uuid;
begin
  if exists (select 1 from public.product_categories) then
    return;
  end if;

  insert into public.product_categories (name, slug, tagline, description, image_url, icon, accent, sort_order)
  values ('Pharmaceuticals', 'pharmaceuticals', 'Quality-assured formulations',
          'Quality-assured pharmaceutical formulations, developed to support healthcare professionals and patients with safe, effective and reliable options.',
          'https://images.unsplash.com/photo-1523299174285-a59d80640155?auto=format&fit=crop&w=900&q=80',
          'capsule', 'red', 1)
  returning id into cat_pharma;

  insert into public.product_categories (name, slug, tagline, description, image_url, icon, accent, sort_order)
  values ('Nutraceuticals', 'nutraceuticals', 'Science-backed nutrition',
          'Science-backed nutraceutical solutions formulated to support everyday wellness, nutrition, and preventive health.',
          'https://images.unsplash.com/photo-1734607402878-eeb4233cea86?auto=format&fit=crop&w=900&q=80',
          'leaf', 'green', 2)
  returning id into cat_nutra;

  insert into public.product_categories (name, slug, tagline, description, image_url, icon, accent, sort_order)
  values ('Wellness Solutions', 'wellness-solutions', 'Everyday care',
          'A growing range of wellness-oriented healthcare products, designed around the everyday needs of patients and their families.',
          'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&w=900&q=80',
          'heart', 'red', 3)
  returning id into cat_well;

  -- Pharmaceuticals → Anti-Infectives (default)
  insert into public.product_subcategories (category_id, name, slug, description, sort_order, is_default)
  values (cat_pharma, 'Anti-Infectives', 'anti-infectives',
          'Antibacterial and antimicrobial formulations for common and resistant infections.', 1, true)
  returning id into sub;
  insert into public.products (subcategory_id, name, slug, composition, description, pack_size, dosage_form, highlights, sort_order) values
    (sub, 'Averocef 200', 'averocef-200', 'Cefixime 200 mg', 'Third-generation cephalosporin for respiratory and urinary tract infections.', '10 x 10 Tablets', 'Tablet', array['Broad spectrum','Twice daily'], 1),
    (sub, 'Averoclav 625', 'averoclav-625', 'Amoxycillin 500 mg + Clavulanic Acid 125 mg', 'Beta-lactam combination for a wide range of bacterial infections.', '10 x 6 Tablets', 'Tablet', array['Beta-lactamase protected'], 2),
    (sub, 'Averozid 500', 'averozid-500', 'Azithromycin 500 mg', 'Macrolide antibiotic with a convenient short course.', '1 x 3 Tablets', 'Tablet', array['3-day course','Once daily'], 3);

  -- Pharmaceuticals → Pain & Inflammation
  insert into public.product_subcategories (category_id, name, slug, description, sort_order)
  values (cat_pharma, 'Pain & Inflammation', 'pain-inflammation',
          'Analgesic and anti-inflammatory formulations for acute and chronic pain.', 2)
  returning id into sub;
  insert into public.products (subcategory_id, name, slug, composition, description, pack_size, dosage_form, highlights, sort_order) values
    (sub, 'Averodol P', 'averodol-p', 'Aceclofenac 100 mg + Paracetamol 325 mg', 'Dual-action relief for musculoskeletal and post-operative pain.', '10 x 10 Tablets', 'Tablet', array['Fast onset'], 1),
    (sub, 'Averonac SP', 'averonac-sp', 'Aceclofenac 100 mg + Paracetamol 325 mg + Serratiopeptidase 15 mg', 'Anti-inflammatory combination with enzymatic anti-oedema action.', '10 x 10 Tablets', 'Tablet', array['Reduces swelling'], 2);

  -- Pharmaceuticals → Gastro Care
  insert into public.product_subcategories (category_id, name, slug, description, sort_order)
  values (cat_pharma, 'Gastro Care', 'gastro-care',
          'Acid control, digestive and gut-health formulations.', 3)
  returning id into sub;
  insert into public.products (subcategory_id, name, slug, composition, description, pack_size, dosage_form, highlights, sort_order) values
    (sub, 'Averopan DSR', 'averopan-dsr', 'Pantoprazole 40 mg + Domperidone 30 mg (SR)', 'Proton pump inhibitor with prokinetic for reflux and dyspepsia.', '10 x 10 Capsules', 'Capsule', array['Sustained release'], 1),
    (sub, 'Averozyme Syrup', 'averozyme-syrup', 'Digestive enzyme blend', 'Palatable enzyme syrup supporting digestion and appetite.', '200 ml Bottle', 'Syrup', array['Sugar-free'], 2);

  -- Nutraceuticals → Vitamins & Minerals (default)
  insert into public.product_subcategories (category_id, name, slug, description, sort_order, is_default)
  values (cat_nutra, 'Vitamins & Minerals', 'vitamins-minerals',
          'Daily micronutrient support for energy, immunity and recovery.', 1, true)
  returning id into sub;
  insert into public.products (subcategory_id, name, slug, composition, description, pack_size, dosage_form, highlights, sort_order) values
    (sub, 'Averovit Gold', 'averovit-gold', 'Multivitamin + Multimineral + Antioxidants', 'Comprehensive daily supplement for adults.', '10 x 10 Softgels', 'Softgel', array['Once daily','Antioxidant rich'], 1),
    (sub, 'Avero D3 60K', 'avero-d3-60k', 'Cholecalciferol 60000 IU', 'Weekly vitamin D3 sachet for deficiency correction.', '4 Sachets', 'Sachet', array['Weekly dose'], 2),
    (sub, 'Averofer XT', 'averofer-xt', 'Ferrous Ascorbate 100 mg + Folic Acid 1.5 mg', 'Iron supplementation with improved tolerability.', '10 x 10 Tablets', 'Tablet', array['Gentle on stomach'], 3);

  -- Nutraceuticals → Bone & Joint
  insert into public.product_subcategories (category_id, name, slug, description, sort_order)
  values (cat_nutra, 'Bone & Joint', 'bone-joint',
          'Calcium, collagen and joint-mobility formulations.', 2)
  returning id into sub;
  insert into public.products (subcategory_id, name, slug, composition, description, pack_size, dosage_form, highlights, sort_order) values
    (sub, 'Averocal K2', 'averocal-k2', 'Calcium Citrate 1000 mg + Vitamin D3 + Vitamin K2-7', 'Bone-mineral support with directed calcium utilisation.', '10 x 10 Tablets', 'Tablet', array['With K2-7'], 1),
    (sub, 'Averojoint Plus', 'averojoint-plus', 'Glucosamine + Diacerein + MSM', 'Joint comfort and cartilage support.', '10 x 10 Tablets', 'Tablet', array['Cartilage support'], 2);

  -- Wellness → Immunity & Daily Wellness (default)
  insert into public.product_subcategories (category_id, name, slug, description, sort_order, is_default)
  values (cat_well, 'Immunity & Daily Wellness', 'immunity-daily-wellness',
          'Everyday wellness products for the whole family.', 1, true)
  returning id into sub;
  insert into public.products (subcategory_id, name, slug, composition, description, pack_size, dosage_form, highlights, sort_order) values
    (sub, 'Avero Immuno Boost', 'avero-immuno-boost', 'Vitamin C + Zinc + Elderberry Extract', 'Daily immunity support with natural antioxidants.', '10 x 10 Tablets', 'Tablet', array['Natural extract'], 1),
    (sub, 'Avero Protein Care', 'avero-protein-care', 'Whey Protein + Vitamins + Minerals', 'Nutritional protein blend for recovery and daily nutrition.', '200 g Jar', 'Powder', array['Chocolate flavour'], 2);

  -- Wellness → Skin & Hair Care
  insert into public.product_subcategories (category_id, name, slug, description, sort_order)
  values (cat_well, 'Skin & Hair Care', 'skin-hair-care',
          'Dermatology-inspired wellness for skin, hair and nails.', 2)
  returning id into sub;
  insert into public.products (subcategory_id, name, slug, composition, description, pack_size, dosage_form, highlights, sort_order) values
    (sub, 'Averobiotin Plus', 'averobiotin-plus', 'Biotin 10 mg + Amino Acids + Minerals', 'Supports hair strength, skin health and nail growth.', '10 x 10 Tablets', 'Tablet', array['High-strength biotin'], 1);
end $$;
