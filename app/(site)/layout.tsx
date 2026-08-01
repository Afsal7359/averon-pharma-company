import Footer from '@/components/site/Footer';
import Navbar from '@/components/site/Navbar';
import ScrollEffects from '@/components/site/ScrollEffects';
import { getNavPages, getSiteSettings } from '@/lib/data';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, navPages] = await Promise.all([getSiteSettings(), getNavPages()]);

  return (
    <>
      <ScrollEffects />
      <Navbar brand={settings.brand} header={settings.header} navPages={navPages} />
      <main>{children}</main>
      <Footer brand={settings.brand} contact={settings.contact} footer={settings.footer} />
    </>
  );
}
