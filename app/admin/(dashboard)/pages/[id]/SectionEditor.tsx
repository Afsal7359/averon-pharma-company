'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import SectionFields from '@/components/admin/SectionFields';
import { ConfirmDialog, EmptyState, Modal, useToast } from '@/components/admin/ui';
import { getBrowserClient } from '@/lib/supabase/browser';
import { revalidateSite } from '@/app/actions/revalidate';
import { SECTION_META, SECTION_TYPES, sectionSummary } from '@/lib/section-schema';
import type { PageRow, PageSectionRow } from '@/lib/supabase/database.types';

interface Props {
  page: PageRow;
  initialSections: PageSectionRow[];
}

/** The row as edited locally — `content` is a plain object, not raw Json. */
type Draft = Omit<PageSectionRow, 'content'> & { content: Record<string, any> };

export default function SectionEditor({ page, initialSections }: Props) {
  const supabase = getBrowserClient();
  const { show, node: toastNode } = useToast();

  const [sections, setSections] = useState<Draft[]>(
    initialSections.map((s) => ({ ...s, content: (s.content ?? {}) as Record<string, any> })),
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const pageUrl = page.slug === 'home' ? '/' : `/${page.slug}`;

  const markDirty = useCallback((id: string) => {
    setDirty((prev) => new Set(prev).add(id));
  }, []);

  const patchContent = useCallback(
    (id: string, partial: Record<string, any>) => {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, content: { ...s.content, ...partial } } : s)),
      );
      markDirty(id);
    },
    [markDirty],
  );

  async function saveSection(section: Draft) {
    setSavingId(section.id);
    const { error } = await supabase
      .from('page_sections')
      .update({ content: section.content })
      .eq('id', section.id);
    setSavingId(null);

    if (error) return show(error.message, 'error');

    setDirty((prev) => {
      const next = new Set(prev);
      next.delete(section.id);
      return next;
    });
    await revalidateSite([pageUrl]);
    show('Section saved.');
  }

  async function saveAll() {
    const pending = sections.filter((s) => dirty.has(s.id));
    if (pending.length === 0) return show('Nothing to save.');

    setSavingAll(true);
    const results = await Promise.all(
      pending.map((s) =>
        supabase.from('page_sections').update({ content: s.content }).eq('id', s.id),
      ),
    );
    setSavingAll(false);

    const failed = results.find((r) => r.error);
    if (failed?.error) return show(failed.error.message, 'error');

    setDirty(new Set());
    await revalidateSite([pageUrl]);
    show(`Saved ${pending.length} section${pending.length === 1 ? '' : 's'}.`);
  }

  async function toggleVisible(section: Draft) {
    const { error } = await supabase
      .from('page_sections')
      .update({ is_visible: !section.is_visible })
      .eq('id', section.id);
    if (error) return show(error.message, 'error');

    setSections((prev) =>
      prev.map((s) => (s.id === section.id ? { ...s, is_visible: !s.is_visible } : s)),
    );
    await revalidateSite([pageUrl]);
    show(section.is_visible ? 'Section hidden from the website.' : 'Section is now visible.');
  }

  async function move(section: Draft, dir: -1 | 1) {
    const index = sections.findIndex((s) => s.id === section.id);
    const target = sections[index + dir];
    if (!target) return;

    // Swap the stored sort_order of the two rows, then mirror it locally.
    const results = await Promise.all([
      supabase.from('page_sections').update({ sort_order: target.sort_order }).eq('id', section.id),
      supabase.from('page_sections').update({ sort_order: section.sort_order }).eq('id', target.id),
    ]);
    const failed = results.find((r) => r.error);
    if (failed?.error) return show(failed.error.message, 'error');

    const next = [...sections];
    next[index] = { ...target, sort_order: section.sort_order };
    next[index + dir] = { ...section, sort_order: target.sort_order };
    setSections(next);
    await revalidateSite([pageUrl]);
  }

  async function addSection(type: string) {
    const meta = SECTION_META[type as keyof typeof SECTION_META];
    setBusy(true);

    const { data, error } = await supabase
      .from('page_sections')
      .insert({
        page_id: page.id,
        type,
        content: structuredClone(meta.defaults),
        sort_order: (sections.at(-1)?.sort_order ?? 0) + 1,
      })
      .select()
      .single();

    setBusy(false);
    setAdding(false);

    if (error || !data) return show(error?.message ?? 'Could not add the section.', 'error');

    const created = { ...(data as PageSectionRow), content: (data as PageSectionRow).content as Record<string, any> };
    setSections((prev) => [...prev, created]);
    setOpenId(created.id);
    await revalidateSite([pageUrl]);
    show(`${meta.label} added.`);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    const { error } = await supabase.from('page_sections').delete().eq('id', deleting.id);
    setBusy(false);
    if (error) return show(error.message, 'error');

    setSections((prev) => prev.filter((s) => s.id !== deleting.id));
    setDeleting(null);
    await revalidateSite([pageUrl]);
    show('Section deleted.');
  }

  /** Section types already used, so singletons can be greyed out. */
  const usedTypes = useMemo(() => new Set(sections.map((s) => s.type)), [sections]);

  return (
    <>
      <div className="a-page-head">
        <div>
          <h2>{page.title}</h2>
          <p>
            Sections render top to bottom on{' '}
            <a href={pageUrl} target="_blank" rel="noopener noreferrer">
              {pageUrl}
            </a>
            . Open one to edit its content, then save.
          </p>
        </div>
        <span className="spacer" />
        <div className="a-btn-row">
          <Link href="/admin/pages" className="a-btn a-btn--ghost">
            ← All pages
          </Link>
          <button className="a-btn a-btn--ghost" onClick={() => setAdding(true)}>
            <Icon name="arrow" /> Add section
          </button>
          <button
            className="a-btn a-btn--primary"
            onClick={saveAll}
            disabled={savingAll || dirty.size === 0}
          >
            {savingAll ? <span className="a-spinner" /> : <Icon name="check" />}
            Save all{dirty.size > 0 ? ` (${dirty.size})` : ''}
          </button>
        </div>
      </div>

      {dirty.size > 0 && (
        <div className="a-alert a-alert--warn">
          <Icon name="alert" />
          <span>
            You have unsaved changes in {dirty.size} section{dirty.size === 1 ? '' : 's'}. They
            won&rsquo;t appear on the website until you save.
          </span>
        </div>
      )}

      {sections.length === 0 ? (
        <EmptyState
          title="This page has no sections yet"
          message="Add your first section to start building the page."
          action={
            <button className="a-btn a-btn--primary" onClick={() => setAdding(true)}>
              <Icon name="arrow" /> Add section
            </button>
          }
        />
      ) : (
        <div className="sec-list">
          {sections.map((section, i) => {
            const meta = SECTION_META[section.type as keyof typeof SECTION_META];
            const isOpen = openId === section.id;
            const isDirty = dirty.has(section.id);

            return (
              <div
                key={section.id}
                className={`sec-item${isOpen ? ' is-open' : ''}${section.is_visible ? '' : ' is-hidden'}`}
              >
                <div className="sec-head">
                  <span className="sec-type">{meta?.label ?? section.type}</span>
                  <button
                    className="sec-title"
                    style={{ textAlign: 'left' }}
                    onClick={() => setOpenId(isOpen ? null : section.id)}
                  >
                    {sectionSummary(section.type, section.content)}
                  </button>

                  {isDirty && <span className="a-badge a-badge--amber">Unsaved</span>}
                  {!section.is_visible && <span className="a-badge a-badge--grey">Hidden</span>}

                  <div className="sec-tools">
                    <button
                      className="a-btn a-btn--subtle a-btn--icon"
                      aria-label="Move up"
                      disabled={i === 0}
                      onClick={() => move(section, -1)}
                    >
                      <Icon name="arrowUp" />
                    </button>
                    <button
                      className="a-btn a-btn--subtle a-btn--icon"
                      aria-label="Move down"
                      disabled={i === sections.length - 1}
                      onClick={() => move(section, 1)}
                      style={{ transform: 'rotate(180deg)' }}
                    >
                      <Icon name="arrowUp" />
                    </button>
                    <button
                      className="a-btn a-btn--subtle a-btn--icon"
                      aria-label={section.is_visible ? 'Hide section' : 'Show section'}
                      onClick={() => toggleVisible(section)}
                    >
                      <Icon name="eye" />
                    </button>
                    <button
                      className="a-btn a-btn--danger a-btn--icon"
                      aria-label="Delete section"
                      onClick={() => setDeleting(section)}
                    >
                      <Icon name="alert" />
                    </button>
                    <button
                      className="a-btn a-btn--ghost a-btn--sm"
                      onClick={() => setOpenId(isOpen ? null : section.id)}
                    >
                      {isOpen ? 'Close' : 'Edit'}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="sec-body">
                    {meta?.description && (
                      <div className="a-hint" style={{ margin: '14px 0 4px' }}>
                        {meta.description}
                      </div>
                    )}

                    <SectionFields
                      type={section.type}
                      content={section.content}
                      patch={(partial) => patchContent(section.id, partial)}
                    />

                    <div className="a-btn-row" style={{ marginTop: 20 }}>
                      <button
                        className="a-btn a-btn--primary"
                        onClick={() => saveSection(section)}
                        disabled={savingId === section.id || !isDirty}
                      >
                        {savingId === section.id ? (
                          <span className="a-spinner" />
                        ) : (
                          <Icon name="check" />
                        )}
                        Save section
                      </button>
                      <button className="a-btn a-btn--ghost" onClick={() => setOpenId(null)}>
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {adding && (
        <Modal title="Add a section" onClose={() => setAdding(false)} wide>
          <div className="a-grid a-grid-auto">
            {SECTION_TYPES.map((meta) => {
              const disabled = Boolean(meta.singleton && usedTypes.has(meta.type));
              return (
                <button
                  key={meta.type}
                  className="quick"
                  style={{
                    textAlign: 'left',
                    opacity: disabled ? 0.45 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                  disabled={disabled || busy}
                  onClick={() => addSection(meta.type)}
                >
                  <span className="qi">
                    <Icon name={meta.icon} />
                  </span>
                  <span>
                    <strong>{meta.label}</strong>
                    <span>{disabled ? 'Already on this page' : meta.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this section?"
          message="The section and its content will be permanently removed from this page."
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {toastNode}
    </>
  );
}
