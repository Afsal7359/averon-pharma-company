import Link from 'next/link';
import Icon from '@/components/Icon';

export default function NotFound() {
  return (
    <section className="page-hero" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ gridTemplateColumns: '1fr' }}>
        <div className="page-hero-text" style={{ maxWidth: 620 }}>
          <div className="crumb">
            <Link href="/">Home</Link> / <span className="current">Not found</span>
          </div>
          <h1>This page doesn&rsquo;t exist</h1>
          <p className="lede" style={{ marginTop: 20 }}>
            The page you were looking for may have been moved or renamed. Let&rsquo;s get you back
            on track.
          </p>
          <div className="hero-actions" style={{ marginTop: 34 }}>
            <Link href="/" className="btn btn--primary">
              Back to Home
              <Icon name="arrow" />
            </Link>
            <Link href="/contact" className="btn btn--outline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
