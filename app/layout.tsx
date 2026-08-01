import type { Metadata } from 'next';
import { JetBrains_Mono, Open_Sans } from 'next/font/google';
import { getSiteSettings } from '@/lib/data';
import './styles/site.css';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-open-sans',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const { brand, seo } = await getSiteSettings();

  return {
    metadataBase: seo.siteUrl ? new URL(seo.siteUrl) : undefined,
    title: { default: seo.titleDefault, template: `%s | ${brand.name}` },
    description: seo.description,
    icons: { icon: brand.faviconUrl },
    openGraph: {
      type: 'website',
      siteName: brand.name,
      title: seo.titleDefault,
      description: seo.description,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior tells Next the smooth scrolling in site.css is
    // intentional, so it suppresses it during route transitions only.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${openSans.variable} ${jetbrains.variable}`}
    >
      <body>
        {/* Gradient referenced by the ECG pulse dividers. */}
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <defs>
            <linearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#D6321E" />
              <stop offset="0.5" stopColor="#E8452D" />
              <stop offset="0.5" stopColor="#3B9A4E" />
              <stop offset="1" stopColor="#2D8F3D" />
            </linearGradient>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
