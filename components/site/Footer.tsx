import Link from 'next/link';
import Icon from '@/components/Icon';
import type { BrandSettings, ContactSettings, FooterSettings } from '@/lib/types';

interface Props {
  brand: BrandSettings;
  contact: ContactSettings;
  footer: FooterSettings;
}

export default function Footer({ brand, contact, footer }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brand.logoUrl} alt={brand.name} />
            </Link>
            <p>{brand.description}</p>
            <div className="footer-tagline">{brand.tagline}</div>
          </div>

          {footer.columns?.map((col) => (
            <div className="footer-col" key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links?.map((l) => (
                  <li key={`${l.href}-${l.label}`}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer-col footer-contact">
            <h4>{footer.contactTitle || 'Get in Touch'}</h4>
            <ul>
              {contact.addressLines?.length > 0 && (
                <li>
                  <Icon name="pin" />
                  <span>{contact.addressLines.join(' ')}</span>
                </li>
              )}
              {contact.email && (
                <li>
                  <Icon name="mail" />
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <Icon name="phone" />
                  <a href={`tel:${contact.phone.replace(/\s+/g, '')}`}>{contact.phone}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} {footer.copyright}
          </span>
          <span>{brand.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
