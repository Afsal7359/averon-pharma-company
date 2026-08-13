# Averon Life Sciences — Next.js website + admin panel

The original static site, rebuilt as a Next.js 16 (App Router) application where
**every page's content is managed from an admin panel**, backed by Supabase for
data and Cloudinary for images.

---

## What's in here

| Path | What it is |
| --- | --- |
| `app/(site)/` | Public website — one route renders any page from the database |
| `app/admin/` | Admin panel (login + dashboard) |
| `app/api/` | Contact form, Cloudinary signing, keep-alive cron |
| `components/sections/` | One React component per section type |
| `components/admin/` | Admin UI kit (modals, toasts, image field, media picker) |
| `lib/` | Supabase clients, data layer, Cloudinary helpers, types |
| `supabase/schema.sql` | Database schema, RLS policies, triggers — run once |
| `supabase/seed.sql` | All original page content + a sample product catalogue |
| `legacy/` | The original HTML/CSS/JS, kept for reference |

---

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → Run.
3. New query → paste all of `supabase/seed.sql` → Run.
   This loads the current website content and a sample catalogue.
4. **Project Settings → API Keys** — copy into `.env.local`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `publishable` key (`sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     *(older projects show an `anon` `public` JWT instead — put it in
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`; the app accepts either)*
   - `secret` key (`sb_secret_…`, or the legacy `service_role` key) →
     `SUPABASE_SERVICE_ROLE_KEY` *(server-only — never expose)*

Both SQL files are safe to re-run. Re-running `seed.sql` resets page content back
to the baseline but leaves your product catalogue alone.

### 3. Create your admin login

**Authentication → Users → Add user** (tick *Auto Confirm User*), then run in the
SQL editor:

```sql
insert into public.admin_users (user_id, email, full_name, role)
select id, email, 'Your Name', 'admin' from auth.users where email = 'you@example.com';
```

Signing in is not enough on its own — an account must also appear in
`admin_users`, and every write is additionally enforced by RLS.

### 4. Cloudinary (images)

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. **Settings → API Keys**, then fill in `.env.local`:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_CLOUDINARY_FOLDER` (optional, defaults to `averon`)

Uploads are **signed**: the browser requests a signature from the server, then
posts the file straight to Cloudinary. The API secret never reaches the browser
and large files never pass through Next.js. Delivery URLs get `f_auto,q_auto`
plus sizing applied automatically.

**Cleaning up unused images.** Replacing or deleting anything that holds an image
(product, range, category, page section, whole page, or the logo) removes the old
file from Cloudinary too — but only after checking nothing else still uses it,
since one image can be reused in several places. Deleting an in-use image from
the Media Library tells you exactly where it appears and asks before proceeding.

One case is deliberately left alone: an image uploaded while a form is open and
then cancelled stays in the Media Library, where you can see and delete it. It is
never auto-deleted, because it may have been picked from the library rather than
freshly uploaded.

### 5. Run

```bash
npm run dev      # http://localhost:3000  ·  admin at /admin
npm run build    # production build
npm run typecheck
```

The site renders with bundled default content even before Supabase is connected,
so you can develop the front end independently.

---

## Keeping Supabase awake

Supabase pauses free projects after ~7 days of inactivity, which would take the
site down. `GET /api/keep-alive` writes a row to `keep_alive`, reads it back and
prunes rows older than 90 days — real activity, not just an HTTP ping. The
dashboard shows when it last ran.

**On Vercel** — already configured in `vercel.json` (daily at 06:00 UTC). Set
`CRON_SECRET` in your project's environment variables; Vercel sends it
automatically as a Bearer token.

**Anywhere else** — point any scheduler at the endpoint once a day:

```
https://your-site.com/api/keep-alive?secret=YOUR_CRON_SECRET
```

Free options: [cron-job.org](https://cron-job.org), GitHub Actions, UptimeRobot.
Test it manually any time by opening that URL.

> Vercel's Hobby plan runs cron jobs once per day, which is exactly what's needed
> here. If `CRON_SECRET` is unset the endpoint is open — set it in production.

---

## How content management works

### Pages are built from sections

Each page is a list of ordered, typed sections stored in `page_sections`, with
its content in a JSON column. In **Admin → Pages & Sections** you can:

- add a section from a picker of 15 types,
- reorder, hide/show, or delete any section,
- edit every piece of text, image, icon, colour and link inside it,
- change each section's background band and vertical spacing,
- create entirely new pages, which appear in the menu automatically.

Available section types: Home Hero, Page Header, Text Block, Checklist, Icon
Cards, Image Cards, Process Steps, Statement Block, Chip Row, Numbered List,
Callout Box, CTA Banner, Pulse Divider, Product Catalogue, Contact Form.

### Products: category → range → product

Three levels, spread over two pages:

1. **Categories** (e.g. Pharmaceuticals) — `/products` shows *only* these, as
   cards with an image, description and range/product counts.
2. **Subcategories / ranges** (e.g. Anti-Infectives) — clicking a category opens
   its own page at `/products/<category>`, which lands on the range flagged
   **default** in the admin. A database trigger guarantees exactly one default
   per category. A **← All categories** button returns to the grid.
3. **Products** — name, composition, description, image, dosage form, pack size
   and highlight tags, listed for the selected range.

Switching range is a sidebar list on desktop; on mobile it's a button that
expands the full list directly beneath it.

Category pages reuse the trailing sections of the Products page (the process
steps and CTA banner), so editing those in the admin updates every category
page at once.

### Everything else

- **Site Settings** — brand, logo, contact details, header buttons, footer
  columns, SEO defaults. These apply to every page.
- **Media Library** — every uploaded image, reusable from any image field.
- **Enquiries** — contact-form submissions with status tracking and reply links.

Saving anything revalidates the affected public pages immediately.

---

## The logo asset

`public/assets/logo.png` is cropped to the artwork's edges. The supplied file had
roughly 34px of transparent padding baked in on every side, so only 62% of its
height was actual logo — a `height: 38px` rule rendered a ~24px-tall wordmark and
looked undersized no matter what the CSS said.

Cropping means the CSS height now equals the height you actually see, so the
navbar (46px, 38px once scrolled), footer (54px), admin sidebar (38px) and login
card (46px) are all predictable. The untouched original is kept at
`legacy/assets/logo.png`.

Replacing the logo from **Admin → Settings** overrides this file entirely; upload
a tightly-cropped image there for the same reason.

## Notes on the build

- **Caching** — public pages are statically generated and revalidated every 60s;
  admin saves call `revalidatePath()` so changes appear at once. Public reads use
  a cookie-free Supabase client so pages stay statically renderable.
- **Security** — RLS is on for every table. The public may read published content
  and insert enquiries, nothing more. All writes require a row in `admin_users`.
  Middleware guards `/admin`, and the admin layout re-checks server-side.
- **Contact form** — posts to `/api/contact`, validated server-side, stored in
  `enquiries`, with a honeypot field for bots. Set `RESEND_API_KEY`,
  `CONTACT_NOTIFY_TO` and `CONTACT_NOTIFY_FROM` to also receive it by email;
  without them, submissions are still saved and visible in the admin panel.
- **Design** — the original stylesheet is preserved as `app/styles/site.css`,
  with fonts loaded via `next/font`. Verified for zero horizontal overflow at a
  390 px viewport across all pages.

## Deploying

Push to GitHub, import into Vercel, and add every variable from `.env.example` to
the project's environment settings. `vercel.json` sets up the daily cron. Then
update `siteUrl` under **Admin → Site Settings → Search engines**.
