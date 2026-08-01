import Link from 'next/link';
import Icon from '@/components/Icon';
import { createClient } from '@/lib/supabase/server';
import { isCloudinaryConfigured } from '@/lib/cloudinary';

const QUICK_LINKS = [
  { href: '/admin/pages', icon: 'box', title: 'Pages & Sections', sub: 'Edit every page' },
  { href: '/admin/categories', icon: 'capsule', title: 'Categories', sub: 'Product categories' },
  { href: '/admin/subcategories', icon: 'leaf', title: 'Subcategories', sub: 'Ranges & defaults' },
  { href: '/admin/products', icon: 'flask', title: 'Products', sub: 'Add & edit products' },
  { href: '/admin/media', icon: 'eye', title: 'Media Library', sub: 'Uploaded images' },
  { href: '/admin/settings', icon: 'scales', title: 'Site Settings', sub: 'Brand, contact, footer' },
  { href: '/admin/enquiries', icon: 'mail', title: 'Enquiries', sub: 'Contact submissions' },
];

function daysAgo(iso: string | null) {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / 86_400_000);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [pages, categories, subcategories, products, enquiries, newEnquiries, lastPing] =
    await Promise.all([
      supabase.from('pages').select('id', { count: 'exact', head: true }),
      supabase.from('product_categories').select('id', { count: 'exact', head: true }),
      supabase.from('product_subcategories').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('enquiries').select('id', { count: 'exact', head: true }),
      supabase
        .from('enquiries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase
        .from('keep_alive')
        .select('pinged_at')
        .order('pinged_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const lastPingAt = (lastPing.data as { pinged_at: string } | null)?.pinged_at ?? null;
  const pingAge = daysAgo(lastPingAt);
  const pingStale = pingAge === null || pingAge > 2;

  const stats = [
    { label: 'Pages', value: pages.count ?? 0, sub: 'Website pages' },
    { label: 'Categories', value: categories.count ?? 0, sub: 'Product categories' },
    { label: 'Subcategories', value: subcategories.count ?? 0, sub: 'Product ranges' },
    { label: 'Products', value: products.count ?? 0, sub: 'Listed products' },
    {
      label: 'Enquiries',
      value: enquiries.count ?? 0,
      sub: `${newEnquiries.count ?? 0} unread`,
    },
  ];

  return (
    <>
      <div className="a-page-head">
        <div>
          <h2>Dashboard</h2>
          <p>
            Everything on the public website is managed from here — page content, the product
            catalogue, site-wide settings and contact enquiries.
          </p>
        </div>
      </div>

      {!isCloudinaryConfigured && (
        <div className="a-alert a-alert--warn">
          <Icon name="alert" />
          <span>
            Cloudinary isn&rsquo;t configured, so image uploads are disabled. Add{' '}
            <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code>, <code>CLOUDINARY_API_KEY</code> and{' '}
            <code>CLOUDINARY_API_SECRET</code> to your environment. You can still paste image URLs
            manually.
          </span>
        </div>
      )}

      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
            <div className="sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="a-card">
        <div className="a-card-head">
          <div>
            <h2>Database keep-alive</h2>
            <p>
              Supabase pauses free projects after a week of inactivity. A scheduled job pings the
              database every day so it never goes idle.
            </p>
          </div>
        </div>

        <div className={`a-alert ${pingStale ? 'a-alert--warn' : 'a-alert--success'}`} style={{ marginBottom: 0 }}>
          <Icon name={pingStale ? 'alert' : 'checkCircle'} />
          <span>
            {lastPingAt ? (
              <>
                Last ping{' '}
                <strong>
                  {pingAge === 0 ? 'today' : pingAge === 1 ? 'yesterday' : `${pingAge} days ago`}
                </strong>{' '}
                ({new Date(lastPingAt).toLocaleString()}).
                {pingStale && ' The daily cron may not be running — check your deployment settings.'}
              </>
            ) : (
              <>
                No ping recorded yet. Once deployed, the daily cron at{' '}
                <code>/api/keep-alive</code> will start recording here.
              </>
            )}
          </span>
        </div>
      </div>

      <div className="a-card">
        <div className="a-card-head">
          <div>
            <h2>Quick actions</h2>
          </div>
        </div>
        <div className="quick-grid">
          {QUICK_LINKS.map((q) => (
            <Link href={q.href} className="quick" key={q.href}>
              <span className="qi">
                <Icon name={q.icon} />
              </span>
              <span>
                <strong>{q.title}</strong>
                <span>{q.sub}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
