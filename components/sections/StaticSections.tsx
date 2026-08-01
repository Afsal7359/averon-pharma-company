import Link from 'next/link';
import Icon from '@/components/Icon';
import SmartImage from '@/components/SmartImage';
import {
  Button,
  MaybeLinkCard,
  SectionHead,
  accentIconClass,
  sectionClass,
} from './primitives';
import type {
  CalloutContent,
  CardsGridContent,
  CategoryCardsContent,
  ChecklistContent,
  ChipsContent,
  CtaBandContent,
  HeroContent,
  PageHeroContent,
  PerksContent,
  ProcessStepsContent,
  RichTextContent,
  StatementContent,
} from '@/lib/types';

// ---------------------------------------------------------------- hero

export function Hero({ c }: { c: HeroContent }) {
  const lines = c.headingLines?.length ? c.headingLines : [];
  const gradient = c.gradientWord?.trim();

  /** Highlight the admin-chosen word with the brand gradient. */
  const renderLine = (line: string, i: number) => {
    if (!gradient || !line.includes(gradient)) return line;
    const [before, ...after] = line.split(gradient);
    return (
      <>
        {before}
        <span className="grad-text">{gradient}</span>
        {after.join(gradient)}
      </>
    );
  };

  return (
    <section className="hero">
      {c.imageUrl && (
        <div className="hero-media">
          <SmartImage src={c.imageUrl} alt={c.imageAlt || ''} width={1800} priority />
        </div>
      )}

      <div className="container hero-inner">
        <div className="hero-panel">
          {c.tag && (
            <div className="hero-tag">
              <span className="dot" /> {c.tag}
            </div>
          )}

          {lines.length > 0 && (
            <h1>
              {lines.map((line, i) => (
                <span className="line" key={i}>
                  <span>{renderLine(line, i)}</span>
                </span>
              ))}
            </h1>
          )}

          {c.subtitle && <p className="hero-sub">{c.subtitle}</p>}

          {(c.primaryCta?.label || c.secondaryCta?.label) && (
            <div className="hero-actions">
              <Button link={c.primaryCta} className="btn btn--primary" />
              {c.secondaryCta?.label && c.secondaryCta?.href && (
                <Link href={c.secondaryCta.href} className="btn btn--outline">
                  {c.secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="hero-scroll-cue">
        <span>Scroll</span>
        <span className="track" />
      </div>
    </section>
  );
}

// ----------------------------------------------------------- page hero

export function PageHero({ c }: { c: PageHeroContent }) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="page-hero-text">
          {c.breadcrumb && (
            <div className="crumb">
              <Link href="/">Home</Link> / <span className="current">{c.breadcrumb}</span>
            </div>
          )}
          {c.heading && <h1 className="reveal">{c.heading}</h1>}
          {c.lede && <p className="lede reveal">{c.lede}</p>}
        </div>
        {c.imageUrl && (
          <div className="page-hero-media reveal-scale">
            <SmartImage src={c.imageUrl} alt={c.imageAlt || ''} width={1200} priority />
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------- rich text

export function RichText({ c }: { c: RichTextContent }) {
  const paragraphs = (c.paragraphs ?? []).filter(Boolean);
  const centered = c.align === 'center';

  return (
    <section className={sectionClass(c)}>
      <div className="container">
        <div
          className={`section-head${centered ? ' section-head--center' : ''}`}
          style={{ maxWidth: 760, marginBottom: paragraphs.length ? 32 : 0 }}
        >
          {c.eyebrow && (
            <div
              className={`eyebrow${c.eyebrowAccent === 'green' ? ' eyebrow--green' : ''}`}
              style={centered ? { justifyContent: 'center' } : undefined}
            >
              {c.eyebrow}
            </div>
          )}
          {c.heading && <h2 className="reveal">{c.heading}</h2>}
          {c.lede && <p className="lede reveal">{c.lede}</p>}
        </div>

        {(paragraphs.length > 0 || c.cta?.label) && (
          <div style={{ maxWidth: 760, ...(centered ? { marginInline: 'auto' } : {}) }}>
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="reveal"
                style={i === 0 ? { fontSize: 'var(--fs-md)' } : { marginTop: 18 }}
              >
                {p}
              </p>
            ))}
            {c.cta?.label && (
              <Button link={c.cta} style={{ marginTop: 32 }} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------- checklist

export function Checklist({ c }: { c: ChecklistContent }) {
  const items = (c.items ?? []).filter(Boolean);

  return (
    <section className={sectionClass(c)}>
      <div className="container">
        <SectionHead content={c} />
        <ul className="checklist" data-stagger style={{ maxWidth: 760, margin: '0 auto' }}>
          {items.map((item, i) => (
            <li className="reveal" key={i}>
              <span className="check-badge">
                <Icon name="check" style={{ stroke: 'white', strokeWidth: 3 }} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// -------------------------------------------------------- cards grid

export function CardsGrid({ c }: { c: CardsGridContent }) {
  const cards = c.cards ?? [];
  const cols = c.columns ?? 3;

  return (
    <section className={sectionClass(c)}>
      <div className="container">
        <SectionHead content={c} />
        <div className={`grid grid-${cols}`} data-stagger>
          {cards.map((card, i) => (
            <MaybeLinkCard key={i} href={card.href} className="card reveal">
              <div className={accentIconClass(card.accent)}>
                <Icon name={card.icon} />
              </div>
              {card.title && <h3>{card.title}</h3>}
              {card.text && <p>{card.text}</p>}
            </MaybeLinkCard>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------- category cards

export function CategoryCards({ c }: { c: CategoryCardsContent }) {
  const cards = c.cards ?? [];

  return (
    <section className={sectionClass(c)}>
      <div className="container">
        <SectionHead content={c} />
        <div className="grid grid-3" data-stagger>
          {cards.map((card, i) => (
            <div className="category-card reveal" key={i}>
              {card.imageUrl && (
                <div className="category-card-media">
                  <SmartImage src={card.imageUrl} alt={card.imageAlt || ''} width={900} />
                </div>
              )}
              <div className="category-card-body">
                <div
                  className="cap-icon"
                  style={
                    card.accent === 'green'
                      ? { background: 'var(--green-100)', color: 'var(--green-700)' }
                      : { background: 'var(--red-100)', color: 'var(--red-600)' }
                  }
                >
                  <Icon name={card.icon} />
                </div>
                {card.title && <h3>{card.title}</h3>}
                {card.text && <p>{card.text}</p>}
                {card.bullets && card.bullets.length > 0 && (
                  <ul>
                    {card.bullets.map((b, bi) => (
                      <li key={bi}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------- process steps

export function ProcessSteps({ c }: { c: ProcessStepsContent }) {
  const steps = c.steps ?? [];

  return (
    <section className={sectionClass(c)}>
      <div className="container">
        <SectionHead content={c} />
        <div className="process-row" data-stagger>
          {steps.map((step, i) => (
            <div className="process-step reveal" key={i}>
              {c.showIcons && (
                <div className={accentIconClass(step.accent)} style={{ marginBottom: 20 }}>
                  <Icon name={step.icon} />
                </div>
              )}
              {step.label && <span className="num">{step.label}</span>}
              {step.title && <h4>{step.title}</h4>}
              {step.text && <p>{step.text}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------- statement

export function Statement({ c }: { c: StatementContent }) {
  const statements = c.statements ?? [];
  const single = statements.length === 1;

  return (
    <section className={sectionClass(c)}>
      <div className="container">
        <SectionHead content={c} />
        <div className={single ? '' : 'grid grid-2'} data-stagger>
          {statements.map((s, i) => (
            <div
              className={`statement-block statement-block--${s.accent === 'green' ? 'green' : 'red'} ${
                single ? 'reveal-scale' : 'reveal'
              }`}
              key={i}
              style={single ? { maxWidth: 900, margin: '0 auto' } : undefined}
            >
              <span className="mark">&ldquo;</span>
              {s.kicker && <div className="kicker">{s.kicker}</div>}
              {s.quote && <blockquote>{s.quote}</blockquote>}
              {s.items && s.items.length > 0 && (
                <ul>
                  {s.items.map((item, ii) => (
                    <li key={ii}>
                      <Icon name="check" style={{ stroke: 'white' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------- chips

export function Chips({ c }: { c: ChipsContent }) {
  const chips = c.chips ?? [];

  return (
    <section className={sectionClass(c)}>
      <div className="container">
        <SectionHead content={c} />
        <div
          className="chip-row"
          data-stagger
          style={c.align === 'center' ? { justifyContent: 'center' } : undefined}
        >
          {chips.map((chip, i) => (
            <span className="chip reveal" key={i}>
              <span className={`swatch swatch--${chip.accent === 'green' ? 'green' : 'red'}`} />
              {chip.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------- perks

export function Perks({ c }: { c: PerksContent }) {
  const items = c.items ?? [];

  return (
    <section className={sectionClass(c)}>
      <div className="container">
        <SectionHead content={c} className="stack-narrow" />
        <div className="grid grid-2" data-stagger style={{ columnGap: 64 }}>
          {items.map((item, i) => (
            <div className="perk-row reveal" key={i}>
              <span className="idx">{String(i + 1).padStart(2, '0')}</span>
              <div>
                {item.title && <h4>{item.title}</h4>}
                {item.text && <p>{item.text}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------- callout

export function Callout({ c }: { c: CalloutContent }) {
  return (
    <section className={sectionClass(c)}>
      <div className="container">
        <SectionHead content={c} />
        <div
          className="contact-info-card reveal-scale"
          style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}
        >
          {c.text && (
            <p style={{ fontSize: 'var(--fs-md)', color: 'var(--ink)', marginBottom: 28 }}>
              {c.text}
            </p>
          )}
          <Button link={c.cta} />
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ cta band

export function CtaBand({ c }: { c: CtaBandContent }) {
  const buttons = c.buttons ?? [];

  return (
    <section className="section section--tight">
      <div className="container">
        <div className="cta-band reveal-scale">
          <div>
            {c.heading && <h2>{c.heading}</h2>}
            {c.text && <p>{c.text}</p>}
          </div>
          {buttons.length > 0 && (
            <div className="cta-actions">
              {buttons.map((b, i) => (
                <Button key={i} link={b} className="btn btn--primary" hideIcon />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------- pulse divider

export function PulseDivider() {
  return (
    <div className="pulse-divider reveal">
      <svg viewBox="0 0 1240 60" preserveAspectRatio="none">
        <path d="M0,30 L280,30 L310,8 L335,52 L360,30 L620,30 L650,8 L675,52 L700,30 L960,30 L990,8 L1015,52 L1040,30 L1240,30" />
      </svg>
    </div>
  );
}
