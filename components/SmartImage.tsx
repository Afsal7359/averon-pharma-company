import { cld } from '@/lib/cloudinary';

interface Props {
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit';
  priority?: boolean;
  className?: string;
}

/**
 * Thin <img> wrapper that runs Cloudinary URLs through f_auto/q_auto plus the
 * requested dimensions. Any other URL (Unsplash, /assets/…) is left untouched,
 * so the site works before Cloudinary is wired up.
 */
export default function SmartImage({
  src,
  alt = '',
  width,
  height,
  crop = 'fill',
  priority = false,
  className,
}: Props) {
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cld(src, { w: width, h: height, crop })}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
    />
  );
}
