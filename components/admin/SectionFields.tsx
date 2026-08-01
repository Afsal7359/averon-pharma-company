'use client';

import Icon, { ICON_KEYS } from '@/components/Icon';
import ImageField from './ImageField';
import { Segmented, StringList } from './ui';
import type { Accent, Background } from '@/lib/types';

type Content = Record<string, any>;
type Patch = (partial: Content) => void;

interface FieldsProps {
  type: string;
  content: Content;
  patch: Patch;
}

// ------------------------------------------------------------- small inputs

function Text({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="a-field">
      <label>{label}</label>
      <input
        className="a-input"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <div className="a-hint">{hint}</div>}
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="a-field">
      <label>{label}</label>
      <textarea
        className="a-textarea"
        value={value ?? ''}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function IconPicker({
  label = 'Icon',
  value,
  onChange,
}: {
  label?: string;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="a-field">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: 'var(--green-100)',
            color: 'var(--green-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name={value} style={{ width: 19, height: 19 }} />
        </span>
        <select
          className="a-select"
          value={value ?? 'capsule'}
          onChange={(e) => onChange(e.target.value)}
        >
          {ICON_KEYS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function AccentPicker({
  value,
  onChange,
  label = 'Accent colour',
}: {
  value: Accent | undefined;
  onChange: (v: Accent) => void;
  label?: string;
}) {
  return (
    <div className="a-field">
      <label>{label}</label>
      <Segmented
        value={value ?? 'red'}
        onChange={onChange}
        options={[
          { value: 'red', label: 'Red' },
          { value: 'green', label: 'Green' },
        ]}
      />
    </div>
  );
}

function LinkFields({
  label,
  value,
  onChange,
  withStyle = false,
}: {
  label: string;
  value: Content | undefined;
  onChange: (v: Content) => void;
  withStyle?: boolean;
}) {
  const link = value ?? {};
  return (
    <fieldset className="sec-fieldset">
      <div className="legend">{label}</div>
      <div className="a-grid a-grid-2">
        <Text
          label="Button text"
          value={link.label}
          onChange={(v) => onChange({ ...link, label: v })}
          placeholder="Leave empty to hide"
        />
        <Text
          label="Link"
          value={link.href}
          onChange={(v) => onChange({ ...link, href: v })}
          placeholder="/contact or https://…"
        />
      </div>
      {withStyle && (
        <div className="a-field">
          <label>Style</label>
          <Segmented
            value={link.style ?? 'primary'}
            onChange={(v) => onChange({ ...link, style: v })}
            options={[
              { value: 'primary', label: 'Solid red' },
              { value: 'outline', label: 'Outline' },
              { value: 'ghost-green', label: 'Soft green' },
            ]}
          />
        </div>
      )}
    </fieldset>
  );
}

/** Add / remove / reorder controls shared by every repeatable list. */
function RepeaterControls({
  index,
  total,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <>
      <span className="spacer" />
      <button
        type="button"
        className="a-btn a-btn--subtle a-btn--icon"
        aria-label="Move up"
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        <Icon name="arrowUp" />
      </button>
      <button
        type="button"
        className="a-btn a-btn--subtle a-btn--icon"
        aria-label="Move down"
        disabled={index === total - 1}
        onClick={() => onMove(1)}
        style={{ transform: 'rotate(180deg)' }}
      >
        <Icon name="arrowUp" />
      </button>
      <button
        type="button"
        className="a-btn a-btn--danger a-btn--icon"
        aria-label="Remove"
        onClick={onRemove}
      >
        <Icon name="alert" />
      </button>
    </>
  );
}

function Repeater({
  label,
  items,
  onChange,
  blank,
  addLabel = 'Add item',
  render,
}: {
  label: string;
  items: Content[];
  onChange: (next: Content[]) => void;
  blank: Content;
  addLabel?: string;
  render: (item: Content, update: (partial: Content) => void, index: number) => React.ReactNode;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <fieldset className="sec-fieldset">
      <div className="legend">{label}</div>
      {items.map((item, i) => (
        <div className="rep-item" key={i}>
          <div className="rep-head">
            <span className="rep-idx">{String(i + 1).padStart(2, '0')}</span>
            <RepeaterControls
              index={i}
              total={items.length}
              onMove={(dir) => move(i, dir)}
              onRemove={() => onChange(items.filter((_, idx) => idx !== i))}
            />
          </div>
          {render(
            item,
            (partial) =>
              onChange(items.map((it, idx) => (idx === i ? { ...it, ...partial } : it))),
            i,
          )}
        </div>
      ))}
      <button
        type="button"
        className="a-btn a-btn--subtle a-btn--sm"
        style={{ marginTop: 10 }}
        onClick={() => onChange([...items, structuredClone(blank)])}
      >
        + {addLabel}
      </button>
    </fieldset>
  );
}

// -------------------------------------------------- shared band + head block

function BandFields({ content, patch }: { content: Content; patch: Patch }) {
  return (
    <div className="a-grid a-grid-2">
      <div className="a-field">
        <label>Background</label>
        <Segmented<Background>
          value={content.background ?? 'white'}
          onChange={(v) => patch({ background: v })}
          options={[
            { value: 'white', label: 'White' },
            { value: 'paper', label: 'Soft green' },
            { value: 'off', label: 'Off-white' },
          ]}
        />
      </div>
      <div className="a-field">
        <label>Vertical spacing</label>
        <Segmented
          value={content.spacing ?? 'normal'}
          onChange={(v) => patch({ spacing: v })}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'tight', label: 'Tight' },
          ]}
        />
      </div>
    </div>
  );
}

function HeadFields({
  content,
  patch,
  withLede = false,
}: {
  content: Content;
  patch: Patch;
  withLede?: boolean;
}) {
  return (
    <>
      <div className="a-grid a-grid-2">
        <Text
          label="Eyebrow (small label above heading)"
          value={content.eyebrow}
          onChange={(v) => patch({ eyebrow: v })}
          placeholder="Optional"
        />
        <AccentPicker
          label="Eyebrow colour"
          value={content.eyebrowAccent}
          onChange={(v) => patch({ eyebrowAccent: v })}
        />
      </div>
      <Text label="Heading" value={content.heading} onChange={(v) => patch({ heading: v })} />
      {withLede && (
        <Area
          label="Intro text"
          value={content.lede}
          onChange={(v) => patch({ lede: v })}
          rows={2}
        />
      )}
      <div className="a-field">
        <label>Alignment</label>
        <Segmented
          value={content.align ?? 'left'}
          onChange={(v) => patch({ align: v })}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Centred' },
          ]}
        />
      </div>
    </>
  );
}

// ---------------------------------------------------------------- dispatcher

export default function SectionFields({ type, content, patch }: FieldsProps) {
  const c = content ?? {};

  switch (type) {
    case 'hero':
      return (
        <>
          <Text
            label="Top badge text"
            value={c.tag}
            onChange={(v) => patch({ tag: v })}
            placeholder="Trust in Every Dose · Care for Every Life"
          />
          <StringList
            label="Headline lines (one line per row)"
            values={c.headingLines ?? ['']}
            onChange={(v) => patch({ headingLines: v })}
            placeholder="Advancing Healthcare"
          />
          <Text
            label="Gradient word"
            value={c.gradientWord}
            onChange={(v) => patch({ gradientWord: v })}
            hint="This word is highlighted with the brand gradient wherever it appears in the headline."
          />
          <Area label="Subtitle" value={c.subtitle} onChange={(v) => patch({ subtitle: v })} />
          <ImageField
            label="Background image"
            value={c.imageUrl}
            publicId={c.imagePublicId}
            onChange={(url, publicId) => patch({ imageUrl: url, imagePublicId: publicId })}
            onClear={() => patch({ imageUrl: '', imagePublicId: '' })}
          />
          <Text
            label="Image description (alt text)"
            value={c.imageAlt}
            onChange={(v) => patch({ imageAlt: v })}
          />
          <LinkFields
            label="Primary button"
            value={c.primaryCta}
            onChange={(v) => patch({ primaryCta: v })}
          />
          <LinkFields
            label="Secondary button"
            value={c.secondaryCta}
            onChange={(v) => patch({ secondaryCta: v })}
          />
        </>
      );

    case 'page_hero':
      return (
        <>
          <div className="a-grid a-grid-2">
            <Text
              label="Breadcrumb label"
              value={c.breadcrumb}
              onChange={(v) => patch({ breadcrumb: v })}
              placeholder="About Us"
            />
            <Text label="Heading" value={c.heading} onChange={(v) => patch({ heading: v })} />
          </div>
          <Area label="Intro text" value={c.lede} onChange={(v) => patch({ lede: v })} />
          <ImageField
            label="Side image"
            value={c.imageUrl}
            publicId={c.imagePublicId}
            onChange={(url, publicId) => patch({ imageUrl: url, imagePublicId: publicId })}
            onClear={() => patch({ imageUrl: '', imagePublicId: '' })}
          />
          <Text
            label="Image description (alt text)"
            value={c.imageAlt}
            onChange={(v) => patch({ imageAlt: v })}
          />
        </>
      );

    case 'rich_text':
      return (
        <>
          <HeadFields content={c} patch={patch} withLede />
          <StringList
            label="Paragraphs"
            values={c.paragraphs ?? ['']}
            onChange={(v) => patch({ paragraphs: v })}
            placeholder="Write a paragraph…"
          />
          <LinkFields label="Button" value={c.cta} onChange={(v) => patch({ cta: v })} withStyle />
          <BandFields content={c} patch={patch} />
        </>
      );

    case 'checklist':
      return (
        <>
          <HeadFields content={c} patch={patch} />
          <StringList
            label="Checklist items"
            values={c.items ?? ['']}
            onChange={(v) => patch({ items: v })}
            placeholder="Quality-driven healthcare solutions"
          />
          <BandFields content={c} patch={patch} />
        </>
      );

    case 'cards_grid':
      return (
        <>
          <HeadFields content={c} patch={patch} />
          <div className="a-field">
            <label>Columns</label>
            <Segmented
              value={String(c.columns ?? 3)}
              onChange={(v) => patch({ columns: Number(v) })}
              options={[
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
              ]}
            />
          </div>
          <Repeater
            label="Cards"
            addLabel="Add card"
            items={c.cards ?? []}
            onChange={(v) => patch({ cards: v })}
            blank={{ icon: 'shield', accent: 'red', title: '', text: '', href: '' }}
            render={(item, update) => (
              <>
                <div className="a-grid a-grid-2">
                  <IconPicker value={item.icon} onChange={(v) => update({ icon: v })} />
                  <AccentPicker value={item.accent} onChange={(v) => update({ accent: v })} />
                </div>
                <Text label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <Area label="Text" value={item.text} onChange={(v) => update({ text: v })} rows={2} />
                <Text
                  label="Link (optional)"
                  value={item.href}
                  onChange={(v) => update({ href: v })}
                  placeholder="/about"
                />
              </>
            )}
          />
          <BandFields content={c} patch={patch} />
        </>
      );

    case 'category_cards':
      return (
        <>
          <HeadFields content={c} patch={patch} />
          <Repeater
            label="Cards"
            addLabel="Add card"
            items={c.cards ?? []}
            onChange={(v) => patch({ cards: v })}
            blank={{ imageUrl: '', imageAlt: '', icon: 'capsule', accent: 'red', title: '', text: '', bullets: [''] }}
            render={(item, update) => (
              <>
                <ImageField
                  label="Card image"
                  value={item.imageUrl}
                  publicId={item.imagePublicId}
                  onChange={(url, publicId) => update({ imageUrl: url, imagePublicId: publicId })}
                  onClear={() => update({ imageUrl: '', imagePublicId: '' })}
                />
                <Text
                  label="Image description (alt text)"
                  value={item.imageAlt}
                  onChange={(v) => update({ imageAlt: v })}
                />
                <div className="a-grid a-grid-2">
                  <IconPicker value={item.icon} onChange={(v) => update({ icon: v })} />
                  <AccentPicker value={item.accent} onChange={(v) => update({ accent: v })} />
                </div>
                <Text label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <Area label="Text" value={item.text} onChange={(v) => update({ text: v })} rows={2} />
                <StringList
                  label="Bullet points"
                  values={item.bullets ?? []}
                  onChange={(v) => update({ bullets: v })}
                />
              </>
            )}
          />
          <BandFields content={c} patch={patch} />
        </>
      );

    case 'process_steps':
      return (
        <>
          <HeadFields content={c} patch={patch} withLede />
          <div className="a-field">
            <label className="a-check">
              <input
                type="checkbox"
                checked={Boolean(c.showIcons)}
                onChange={(e) => patch({ showIcons: e.target.checked })}
              />
              Show icons instead of numbered labels
            </label>
          </div>
          <Repeater
            label="Steps"
            addLabel="Add step"
            items={c.steps ?? []}
            onChange={(v) => patch({ steps: v })}
            blank={{ label: '', icon: 'flask', accent: 'red', title: '', text: '' }}
            render={(item, update) => (
              <>
                {c.showIcons ? (
                  <div className="a-grid a-grid-2">
                    <IconPicker value={item.icon} onChange={(v) => update({ icon: v })} />
                    <AccentPicker value={item.accent} onChange={(v) => update({ accent: v })} />
                  </div>
                ) : (
                  <Text
                    label="Step label"
                    value={item.label}
                    onChange={(v) => update({ label: v })}
                    placeholder="01 / Research & Development"
                  />
                )}
                <Text label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <Area label="Text" value={item.text} onChange={(v) => update({ text: v })} rows={2} />
              </>
            )}
          />
          <BandFields content={c} patch={patch} />
        </>
      );

    case 'statement':
      return (
        <>
          <HeadFields content={c} patch={patch} />
          <Repeater
            label="Statement panels"
            addLabel="Add panel"
            items={c.statements ?? []}
            onChange={(v) => patch({ statements: v })}
            blank={{ accent: 'red', kicker: '', quote: '', items: [] }}
            render={(item, update) => (
              <>
                <div className="a-grid a-grid-2">
                  <Text
                    label="Kicker"
                    value={item.kicker}
                    onChange={(v) => update({ kicker: v })}
                    placeholder="Our Mission"
                  />
                  <AccentPicker value={item.accent} onChange={(v) => update({ accent: v })} />
                </div>
                <Area label="Quote" value={item.quote} onChange={(v) => update({ quote: v })} />
                <StringList
                  label="Bullet points (optional)"
                  values={item.items ?? []}
                  onChange={(v) => update({ items: v })}
                />
              </>
            )}
          />
          <div className="a-hint" style={{ marginTop: 8 }}>
            One panel renders full-width; two panels render side by side.
          </div>
          <BandFields content={c} patch={patch} />
        </>
      );

    case 'chips':
      return (
        <>
          <HeadFields content={c} patch={patch} />
          <Repeater
            label="Chips"
            addLabel="Add chip"
            items={c.chips ?? []}
            onChange={(v) => patch({ chips: v })}
            blank={{ label: '', accent: 'red' }}
            render={(item, update) => (
              <div className="a-grid a-grid-2">
                <Text label="Label" value={item.label} onChange={(v) => update({ label: v })} />
                <AccentPicker
                  label="Dot colour"
                  value={item.accent}
                  onChange={(v) => update({ accent: v })}
                />
              </div>
            )}
          />
          <BandFields content={c} patch={patch} />
        </>
      );

    case 'perks':
      return (
        <>
          <HeadFields content={c} patch={patch} />
          <Repeater
            label="Rows"
            addLabel="Add row"
            items={c.items ?? []}
            onChange={(v) => patch({ items: v })}
            blank={{ title: '', text: '' }}
            render={(item, update) => (
              <>
                <Text label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <Area label="Text" value={item.text} onChange={(v) => update({ text: v })} rows={2} />
              </>
            )}
          />
          <div className="a-hint" style={{ marginTop: 8 }}>
            Row numbers (01, 02, …) are generated automatically.
          </div>
          <BandFields content={c} patch={patch} />
        </>
      );

    case 'callout':
      return (
        <>
          <HeadFields content={c} patch={patch} />
          <Area label="Body text" value={c.text} onChange={(v) => patch({ text: v })} rows={4} />
          <LinkFields label="Button" value={c.cta} onChange={(v) => patch({ cta: v })} />
          <IconPicker
            label="Button icon"
            value={c.cta?.icon}
            onChange={(v) => patch({ cta: { ...(c.cta ?? {}), icon: v } })}
          />
          <BandFields content={c} patch={patch} />
        </>
      );

    case 'cta_band':
      return (
        <>
          <Text label="Heading" value={c.heading} onChange={(v) => patch({ heading: v })} />
          <Area label="Text" value={c.text} onChange={(v) => patch({ text: v })} rows={2} />
          <Repeater
            label="Buttons"
            addLabel="Add button"
            items={c.buttons ?? []}
            onChange={(v) => patch({ buttons: v })}
            blank={{ label: '', href: '' }}
            render={(item, update) => (
              <div className="a-grid a-grid-2">
                <Text label="Button text" value={item.label} onChange={(v) => update({ label: v })} />
                <Text
                  label="Link"
                  value={item.href}
                  onChange={(v) => update({ href: v })}
                  placeholder="/contact"
                />
              </div>
            )}
          />
        </>
      );

    case 'pulse_divider':
      return (
        <div className="a-alert a-alert--info" style={{ marginBottom: 0 }}>
          <Icon name="heart" />
          <span>
            This is a decorative animated heartbeat line. It has no editable content — reorder or
            hide it using the controls above.
          </span>
        </div>
      );

    case 'product_catalog':
      return (
        <>
          <HeadFields content={c} patch={patch} />
          <Area
            label="Intro text under the heading"
            value={c.intro}
            onChange={(v) => patch({ intro: v })}
            rows={2}
          />
          <Area
            label="Message when a range has no products"
            value={c.emptyText}
            onChange={(v) => patch({ emptyText: v })}
            rows={2}
          />
          <div className="a-alert a-alert--info">
            <Icon name="flask" />
            <span>
              The categories, ranges and products shown here come from the Products area of the
              admin panel — not from this section.
            </span>
          </div>
          <BandFields content={c} patch={patch} />
        </>
      );

    case 'contact_block':
      return (
        <>
          <div className="a-grid a-grid-2">
            <Text label="Eyebrow" value={c.eyebrow} onChange={(v) => patch({ eyebrow: v })} />
            <AccentPicker
              label="Eyebrow colour"
              value={c.eyebrowAccent}
              onChange={(v) => patch({ eyebrowAccent: v })}
            />
          </div>
          <Text label="Heading" value={c.heading} onChange={(v) => patch({ heading: v })} />
          <StringList
            label="Subject dropdown options"
            values={c.subjects ?? []}
            onChange={(v) => patch({ subjects: v })}
            placeholder="General Enquiry"
          />
          <Text
            label="Note under the send button"
            value={c.note}
            onChange={(v) => patch({ note: v })}
          />
          <Area
            label="Message shown after sending"
            value={c.successMessage}
            onChange={(v) => patch({ successMessage: v })}
            rows={2}
          />
          <Repeater
            label="Contact detail cards"
            addLabel="Add card"
            items={c.infoCards ?? []}
            onChange={(v) => patch({ infoCards: v })}
            blank={{ icon: 'pin', accent: 'red', title: '', lines: [''], href: '' }}
            render={(item, update) => (
              <>
                <div className="a-grid a-grid-2">
                  <IconPicker value={item.icon} onChange={(v) => update({ icon: v })} />
                  <AccentPicker value={item.accent} onChange={(v) => update({ accent: v })} />
                </div>
                <Text label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <StringList
                  label="Lines"
                  values={item.lines ?? ['']}
                  onChange={(v) => update({ lines: v })}
                />
                <Text
                  label="Link (optional)"
                  value={item.href}
                  onChange={(v) => update({ href: v })}
                  placeholder="mailto:info@…"
                />
              </>
            )}
          />
          <div className="a-field">
            <label className="a-check">
              <input
                type="checkbox"
                checked={c.showMap !== false}
                onChange={(e) => patch({ showMap: e.target.checked })}
              />
              Show the map
            </label>
          </div>
          <Text
            label="Map location override"
            value={c.mapQuery}
            onChange={(v) => patch({ mapQuery: v })}
            hint="Leave empty to use the address from Site Settings."
          />
          <BandFields content={c} patch={patch} />
        </>
      );

    default:
      return (
        <div className="a-alert a-alert--warn" style={{ marginBottom: 0 }}>
          <Icon name="alert" />
          <span>No editor is defined for the section type &ldquo;{type}&rdquo;.</span>
        </div>
      );
  }
}
