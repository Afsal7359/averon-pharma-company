import Link from 'next/link';
import Icon from '@/components/Icon';
import type { Accent, BaseSectionContent, Link as LinkModel } from '@/lib/types';

/** Section band: background colour + vertical rhythm, both admin-editable. */
export function sectionClass(c: BaseSectionContent, extra = '') {
  const bg =
    c.background === 'paper'
      ? ' section--paper'
      : c.background === 'off'
        ? ' section--off'
        : '';
  const tight = c.spacing === 'tight' ? ' section--tight' : '';
  return `section${bg}${tight}${extra ? ` ${extra}` : ''}`;
}

export function Eyebrow({ text, accent }: { text?: string; accent?: Accent }) {
  if (!text) return null;
  return <div className={`eyebrow${accent === 'green' ? ' eyebrow--green' : ''}`}>{text}</div>;
}

/** Shared heading block used by nearly every section type. */
export function SectionHead({
  content,
  className = '',
}: {
  content: BaseSectionContent;
  className?: string;
}) {
  const { eyebrow, eyebrowAccent, heading, lede, align } = content;
  if (!eyebrow && !heading && !lede) return null;

  const centered = align === 'center';

  return (
    <div className={`section-head${centered ? ' section-head--center' : ''}${className ? ` ${className}` : ''}`}>
      {eyebrow && (
        <div
          className={`eyebrow${eyebrowAccent === 'green' ? ' eyebrow--green' : ''}`}
          style={centered ? { justifyContent: 'center' } : undefined}
        >
          {eyebrow}
        </div>
      )}
      {heading && <h2 className="reveal">{heading}</h2>}
      {lede && <p className="lede reveal">{lede}</p>}
    </div>
  );
}

const BTN_CLASS: Record<string, string> = {
  primary: 'btn btn--primary',
  outline: 'btn btn--outline',
  'ghost-green': 'btn btn--ghost-green',
};

/** Renders internal links with <Link> and mailto:/tel:/external with <a>. */
export function Button({
  link,
  className,
  style,
  hideIcon = false,
}: {
  link?: LinkModel | null;
  className?: string;
  style?: React.CSSProperties;
  /** CTA-band buttons are label-only in the original design. */
  hideIcon?: boolean;
}) {
  if (!link?.label || !link?.href) return null;

  const cls = className ?? BTN_CLASS[link.style ?? 'primary'] ?? BTN_CLASS.primary;
  const inner = (
    <>
      {link.label}
      {!hideIcon && <Icon name={link.icon || 'arrow'} />}
    </>
  );

  const isInternal = link.href.startsWith('/');
  if (isInternal) {
    return (
      <Link href={link.href} className={cls} style={style}>
        {inner}
      </Link>
    );
  }

  return (
    <a
      href={link.href}
      className={cls}
      style={style}
      {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {inner}
    </a>
  );
}

export function accentIconClass(accent?: Accent) {
  return accent === 'green' ? 'card-icon card-icon--green' : 'card-icon card-icon--red';
}

/** Card that becomes a link when the admin supplies an href. */
export function MaybeLinkCard({
  href,
  children,
  className,
}: {
  href?: string;
  children: React.ReactNode;
  className: string;
}) {
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
