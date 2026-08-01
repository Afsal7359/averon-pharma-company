'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';

// ------------------------------------------------------------------ toast

export interface ToastState {
  message: string;
  kind: 'success' | 'error';
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, kind: ToastState['kind'] = 'success') => {
    setToast({ message, kind });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3800);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const node = toast ? (
    <div className={`a-toast${toast.kind === 'error' ? ' a-toast--error' : ''}`} role="status">
      <Icon name={toast.kind === 'error' ? 'alert' : 'checkCircle'} />
      {toast.message}
    </div>
  ) : null;

  return { show, node };
}

// ------------------------------------------------------------------ modal

export function Modal({
  title,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="a-modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`a-modal${wide ? ' a-modal--wide' : ''}`} role="dialog" aria-modal="true">
        <div className="a-modal-head">
          <h3>{title}</h3>
          <button className="a-btn a-btn--subtle a-btn--icon" onClick={onClose} aria-label="Close">
            <Icon name="alert" />
          </button>
        </div>
        <div className="a-modal-body">{children}</div>
        {footer && <div className="a-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ confirm modal

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="a-btn a-btn--ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="a-btn a-btn--primary" onClick={onConfirm} disabled={busy}>
            {busy ? <span className="a-spinner" /> : <Icon name="alert" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>{message}</p>
    </Modal>
  );
}

// -------------------------------------------------------------- segmented

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | undefined;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="a-seg">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ------------------------------------------------------- string list editor

export function StringList({
  values,
  onChange,
  placeholder = 'Add an item',
  label,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="a-field">
      {label && <label>{label}</label>}
      {values.map((value, i) => (
        <div className="list-line" key={i}>
          <input
            className="a-input"
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            className="a-btn a-btn--subtle a-btn--icon"
            aria-label="Move up"
            disabled={i === 0}
            onClick={() => {
              const next = [...values];
              [next[i - 1], next[i]] = [next[i], next[i - 1]];
              onChange(next);
            }}
          >
            <Icon name="arrowUp" />
          </button>
          <button
            type="button"
            className="a-btn a-btn--danger a-btn--icon"
            aria-label="Remove"
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
          >
            <Icon name="alert" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="a-btn a-btn--subtle a-btn--sm"
        onClick={() => onChange([...values, ''])}
      >
        + Add
      </button>
    </div>
  );
}

// ------------------------------------------------------------ empty state

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="a-empty">
      <Icon name="box" />
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
