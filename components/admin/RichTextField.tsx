'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { sanitizeHtml } from '@/lib/sanitize';

interface Props {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  hint?: string;
  minHeight?: number;
}

type Cmd = { id: string; label: string; title: string; arg?: string; block?: boolean };

const COMMANDS: Cmd[] = [
  { id: 'bold', label: 'B', title: 'Bold  (⌘B)' },
  { id: 'italic', label: 'I', title: 'Italic  (⌘I)' },
  { id: 'formatBlock', arg: 'h2', label: 'H2', title: 'Heading', block: true },
  { id: 'formatBlock', arg: 'h3', label: 'H3', title: 'Subheading', block: true },
  { id: 'formatBlock', arg: 'p', label: '¶', title: 'Normal text', block: true },
  { id: 'insertUnorderedList', label: '•', title: 'Bullet list' },
  { id: 'insertOrderedList', label: '1.', title: 'Numbered list' },
  { id: 'blockquote', arg: 'blockquote', label: '❝', title: 'Quote', block: true },
];

/**
 * Rich-text editor for long-form product copy.
 *
 * contentEditable + execCommand: deprecated, but universally supported and the
 * only way to get a formatting toolbar without pulling in an editor library.
 * Everything it produces goes through the same allow-list sanitiser the public
 * page uses, so pasted markup can only ever contain the tags we render.
 */
export default function RichTextField({
  label = 'Details',
  value,
  onChange,
  hint,
  minHeight = 220,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const savedRange = useRef<Range | null>(null);

  // Only push external values in when they differ, otherwise React would reset
  // the caret to the start of the box on every keystroke.
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value;
  }, [value]);

  function emit() {
    if (ref.current) onChange(sanitizeHtml(ref.current.innerHTML));
  }

  function run(cmd: Cmd) {
    ref.current?.focus();
    if (cmd.block) {
      document.execCommand('formatBlock', false, `<${cmd.arg}>`);
    } else {
      document.execCommand(cmd.id, false);
    }
    emit();
  }

  function openLink() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setLinkUrl('');
      return;
    }
    savedRange.current = sel.getRangeAt(0).cloneRange();
    setLinkUrl('https://');
    setLinkOpen(true);
  }

  function applyLink() {
    const el = ref.current;
    const range = savedRange.current;
    if (el && range) {
      el.focus();
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand('createLink', false, linkUrl);
    }
    setLinkOpen(false);
    emit();
  }

  return (
    <div className="a-field">
      <label>{label}</label>

      <div className="rt-wrap">
        <div className="rt-toolbar">
          {COMMANDS.map((cmd) => (
            <button
              key={cmd.id + (cmd.arg ?? '')}
              type="button"
              className="rt-btn"
              title={cmd.title}
              // Buttons must not steal the selection from the editable area.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(cmd)}
            >
              {cmd.label}
            </button>
          ))}

          <span className="rt-sep" />

          <button
            type="button"
            className="rt-btn"
            title="Add link to the selected text"
            onMouseDown={(e) => e.preventDefault()}
            onClick={openLink}
          >
            <Icon name="arrow" />
          </button>
          <button
            type="button"
            className="rt-btn"
            title="Remove formatting"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              ref.current?.focus();
              document.execCommand('removeFormat', false);
              document.execCommand('unlink', false);
              emit();
            }}
          >
            ⌫
          </button>
        </div>

        <div
          ref={ref}
          className="rt-editor"
          contentEditable
          suppressContentEditableWarning
          style={{ minHeight }}
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          onInput={emit}
          onBlur={emit}
          // Paste as plain text: keeps Word/Google Docs styling out entirely.
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
            emit();
          }}
        />
      </div>

      {linkOpen && (
        <div className="rt-link-row">
          <input
            className="a-input"
            value={linkUrl}
            autoFocus
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyLink();
              if (e.key === 'Escape') setLinkOpen(false);
            }}
            placeholder="https://example.com"
          />
          <button type="button" className="a-btn a-btn--primary a-btn--sm" onClick={applyLink}>
            Link
          </button>
          <button
            type="button"
            className="a-btn a-btn--ghost a-btn--sm"
            onClick={() => setLinkOpen(false)}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="a-hint">
        {hint ?? 'Shown as the full description on the product detail page.'}
      </div>
    </div>
  );
}
