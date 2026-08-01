-- =========================================================================
-- AVERON LIFE SCIENCES — Supabase schema
-- Run this whole file once in: Supabase Dashboard → SQL Editor → New query
-- Safe to re-run: everything is IF NOT EXISTS / idempotent.
-- =========================================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- 1. ADMIN USERS  (gate for every write in the admin panel)
-- -------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

-- Helper used by every RLS write policy.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users a where a.user_id = auth.uid());
$$;

-- -------------------------------------------------------------------------
-- 2. SITE SETTINGS  (brand, contact details, navigation, footer)
-- -------------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- 3. PAGES + SECTIONS  (every page's content lives here)
-- -------------------------------------------------------------------------
create table if not exists public.pages (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,          -- 'home', 'about', 'products', ...
  title            text not null,
  nav_label        text,
  meta_title       text,
  meta_description text,
  og_image_url     text,
  sort_order       int  not null default 0,
  show_in_nav      boolean not null default true,
  is_published     boolean not null default true,
  is_system        boolean not null default false, -- system pages cannot be deleted
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.page_sections (
  id         uuid primary key default gen_random_uuid(),
  page_id    uuid not null references public.pages (id) on delete cascade,
  type       text not null,
  content    jsonb not null default '{}'::jsonb,
  sort_order int  not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists page_sections_page_idx on public.page_sections (page_id, sort_order);

-- -------------------------------------------------------------------------
-- 4. PRODUCT CATALOG  (category → subcategory → product)
-- -------------------------------------------------------------------------
create table if not exists public.product_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  tagline     text,
  description text,
  image_url   text,
  icon        text default 'capsule',
  accent      text not null default 'red' check (accent in ('red', 'green')),
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.product_subcategories (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.product_categories (id) on delete cascade,
  name        text not null,
  slug        text not null,
  description text,
  image_url   text,
  sort_order  int  not null default 0,
  is_default  boolean not null default false,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (category_id, slug)
);

create index if not exists subcat_category_idx on public.product_subcategories (category_id, sort_order);

-- Exactly one default subcategory per category: when a row is flagged default,
-- clear the flag on its siblings.
create or replace function public.enforce_single_default_subcategory()
returns trigger
language plpgsql
as $$
begin
  if new.is_default then
    update public.product_subcategories
       set is_default = false
     where category_id = new.category_id
       and id <> new.id
       and is_default;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_single_default_subcategory on public.product_subcategories;
create trigger trg_single_default_subcategory
  after insert or update of is_default on public.product_subcategories
  for each row when (new.is_default)
  execute function public.enforce_single_default_subcategory();

create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  subcategory_id uuid not null references public.product_subcategories (id) on delete cascade,
  name           text not null,
  slug           text not null,
  composition    text,
  description    text,
  image_url      text,
  pack_size      text,
  dosage_form    text,
  highlights     text[] not null default '{}',
  sort_order     int  not null default 0,
  is_active      boolean not null default true,
  is_featured    boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (subcategory_id, slug)
);

create index if not exists products_subcategory_idx on public.products (subcategory_id, sort_order);

-- -------------------------------------------------------------------------
-- 5. ENQUIRIES  (contact form submissions)
-- -------------------------------------------------------------------------
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  source_page text,
  status      text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at  timestamptz not null default now()
);

create index if not exists enquiries_created_idx on public.enquiries (created_at desc);

-- -------------------------------------------------------------------------
-- 6. KEEP-ALIVE  (daily cron writes here so the project is never idle)
-- -------------------------------------------------------------------------
create table if not exists public.keep_alive (
  id        uuid primary key default gen_random_uuid(),
  pinged_at timestamptz not null default now(),
  source    text not null default 'cron',
  note      text
);

create index if not exists keep_alive_pinged_idx on public.keep_alive (pinged_at desc);

-- Cloudinary public_ids, so replacing/removing an image can clean up the file.
alter table public.product_categories    add column if not exists image_public_id text;
alter table public.product_subcategories add column if not exists image_public_id text;
alter table public.products              add column if not exists image_public_id text;

-- Trim old heartbeat rows so the table never grows unbounded.
create or replace function public.prune_keep_alive()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.keep_alive
   where pinged_at < now() - interval '90 days';
$$;

-- -------------------------------------------------------------------------
-- 7. updated_at TRIGGERS
-- -------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'site_settings', 'pages', 'page_sections',
    'product_categories', 'product_subcategories', 'products'
  ] loop
    execute format('drop trigger if exists trg_touch_%1$s on public.%1$I', t);
    execute format(
      'create trigger trg_touch_%1$s before update on public.%1$I
         for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- -------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY
--    Public (anon) may READ published content and INSERT enquiries.
--    Only rows in admin_users may write anything else.
-- -------------------------------------------------------------------------
alter table public.admin_users           enable row level security;
alter table public.site_settings         enable row level security;
alter table public.pages                 enable row level security;
alter table public.page_sections         enable row level security;
alter table public.product_categories    enable row level security;
alter table public.product_subcategories enable row level security;
alter table public.products              enable row level security;
alter table public.enquiries             enable row level security;
alter table public.keep_alive            enable row level security;

do $$
declare t text;
begin
  -- Readable by everyone, writable by admins.
  foreach t in array array[
    'site_settings', 'pages', 'page_sections',
    'product_categories', 'product_subcategories', 'products'
  ] loop
    execute format('drop policy if exists "%1$s_public_read" on public.%1$I', t);
    execute format('create policy "%1$s_public_read" on public.%1$I for select using (true)', t);

    execute format('drop policy if exists "%1$s_admin_write" on public.%1$I', t);
    execute format(
      'create policy "%1$s_admin_write" on public.%1$I for all
         to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Admins can see the admin roster; nobody can self-promote from the client.
drop policy if exists "admin_users_read" on public.admin_users;
create policy "admin_users_read" on public.admin_users
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- Enquiries: anyone may submit, only admins may read/manage.
drop policy if exists "enquiries_public_insert" on public.enquiries;
create policy "enquiries_public_insert" on public.enquiries
  for insert to anon, authenticated with check (true);

drop policy if exists "enquiries_admin_read" on public.enquiries;
create policy "enquiries_admin_read" on public.enquiries
  for select to authenticated using (public.is_admin());

drop policy if exists "enquiries_admin_write" on public.enquiries;
create policy "enquiries_admin_write" on public.enquiries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "enquiries_admin_delete" on public.enquiries;
create policy "enquiries_admin_delete" on public.enquiries
  for delete to authenticated using (public.is_admin());

-- Keep-alive: admins read it in the dashboard; the cron writes with the
-- service-role key, which bypasses RLS.
drop policy if exists "keep_alive_admin_read" on public.keep_alive;
create policy "keep_alive_admin_read" on public.keep_alive
  for select to authenticated using (public.is_admin());

-- -------------------------------------------------------------------------
-- 9. MEDIA LIBRARY
--    Files live in Cloudinary; this table is the searchable index the admin
--    panel browses, and it keeps the public_id needed to delete an asset.
-- -------------------------------------------------------------------------
create table if not exists public.media_assets (
  id         uuid primary key default gen_random_uuid(),
  public_id  text not null unique,     -- Cloudinary public_id
  url        text not null,            -- secure_url
  format     text,
  width      int,
  height     int,
  bytes      bigint,
  alt        text,
  folder     text default 'averon',
  created_at timestamptz not null default now()
);

create index if not exists media_created_idx on public.media_assets (created_at desc);

alter table public.media_assets enable row level security;

drop policy if exists "media_public_read" on public.media_assets;
create policy "media_public_read" on public.media_assets for select using (true);

drop policy if exists "media_admin_write" on public.media_assets;
create policy "media_admin_write" on public.media_assets for all
  to authenticated using (public.is_admin()) with check (public.is_admin());
