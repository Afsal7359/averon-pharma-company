'use client';

import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { ConfirmDialog, EmptyState, Modal, useToast } from '@/components/admin/ui';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { EnquiryRow } from '@/lib/supabase/database.types';

type Status = EnquiryRow['status'];

const STATUS_LABELS: Record<Status, string> = {
  new: 'New',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
};

const STATUS_BADGE: Record<Status, string> = {
  new: 'a-badge--red',
  read: 'a-badge--amber',
  replied: 'a-badge--green',
  archived: 'a-badge--grey',
};

export default function EnquiriesManager({ initial }: { initial: EnquiryRow[] }) {
  const supabase = getBrowserClient();
  const { show, node: toastNode } = useToast();

  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<EnquiryRow | null>(null);
  const [deleting, setDeleting] = useState<EnquiryRow | null>(null);
  const [busy, setBusy] = useState(false);

  const visible = useMemo(
    () =>
      rows
        .filter((r) => (filter === 'all' ? true : r.status === filter))
        .filter((r) =>
          search
            ? `${r.name} ${r.email} ${r.subject ?? ''} ${r.message}`
                .toLowerCase()
                .includes(search.toLowerCase())
            : true,
        ),
    [rows, filter, search],
  );

  const counts = useMemo(
    () =>
      rows.reduce<Record<string, number>>((acc, r) => {
        acc[r.status] = (acc[r.status] ?? 0) + 1;
        return acc;
      }, {}),
    [rows],
  );

  async function setStatus(row: EnquiryRow, status: Status) {
    const { error } = await supabase.from('enquiries').update({ status }).eq('id', row.id);
    if (error) return show(error.message, 'error');

    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
    setViewing((v) => (v && v.id === row.id ? { ...v, status } : v));
    show(`Marked as ${STATUS_LABELS[status].toLowerCase()}.`);
  }

  /** Opening an enquiry moves it out of "new" automatically. */
  function open(row: EnquiryRow) {
    setViewing(row);
    if (row.status === 'new') setStatus(row, 'read');
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    const { error } = await supabase.from('enquiries').delete().eq('id', deleting.id);
    setBusy(false);
    if (error) return show(error.message, 'error');

    setRows((prev) => prev.filter((r) => r.id !== deleting.id));
    setDeleting(null);
    setViewing(null);
    show('Enquiry deleted.');
  }

  return (
    <>
      <div className="a-page-head">
        <div>
          <h2>Contact Enquiries</h2>
          <p>Messages submitted through the website contact form.</p>
        </div>
      </div>

      <div className="a-card">
        <div className="a-grid a-grid-2" style={{ marginBottom: 0 }}>
          <div className="a-field" style={{ marginBottom: 0 }}>
            <label>Status</label>
            <select
              className="a-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Status | 'all')}
            >
              <option value="all">All ({rows.length})</option>
              {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]} ({counts[s] ?? 0})
                </option>
              ))}
            </select>
          </div>
          <div className="a-field" style={{ marginBottom: 0 }}>
            <label>Search</label>
            <input
              className="a-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email or message…"
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {visible.length === 0 ? (
          <EmptyState
            title={rows.length === 0 ? 'No enquiries yet' : 'No matching enquiries'}
            message={
              rows.length === 0
                ? 'Messages sent through the contact form will appear here.'
                : 'Try a different search or status filter.'
            }
          />
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="name">{row.name}</div>
                      <span className="muted">{row.email}</span>
                    </td>
                    <td className="muted">{row.subject || 'General Enquiry'}</td>
                    <td className="muted">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`a-badge ${STATUS_BADGE[row.status]}`}>
                        {STATUS_LABELS[row.status]}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="a-btn a-btn--green a-btn--sm" onClick={() => open(row)}>
                          View
                        </button>
                        <a
                          className="a-btn a-btn--ghost a-btn--sm"
                          href={`mailto:${row.email}?subject=${encodeURIComponent(
                            `Re: ${row.subject || 'Your enquiry'}`,
                          )}`}
                        >
                          Reply
                        </a>
                        <button
                          className="a-btn a-btn--danger a-btn--icon"
                          aria-label="Delete"
                          onClick={() => setDeleting(row)}
                        >
                          <Icon name="alert" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewing && (
        <Modal
          title={`Enquiry from ${viewing.name}`}
          onClose={() => setViewing(null)}
          footer={
            <>
              <a
                className="a-btn a-btn--primary"
                href={`mailto:${viewing.email}?subject=${encodeURIComponent(
                  `Re: ${viewing.subject || 'Your enquiry'}`,
                )}`}
                onClick={() => setStatus(viewing, 'replied')}
              >
                <Icon name="mail" /> Reply by email
              </a>
              <button
                className="a-btn a-btn--ghost"
                onClick={() => setStatus(viewing, 'archived')}
              >
                Archive
              </button>
              <button className="a-btn a-btn--danger" onClick={() => setDeleting(viewing)}>
                Delete
              </button>
            </>
          }
        >
          <div className="a-grid a-grid-2">
            <div className="a-field">
              <label>Email</label>
              <div className="a-hint">
                <a href={`mailto:${viewing.email}`}>{viewing.email}</a>
              </div>
            </div>
            <div className="a-field">
              <label>Phone</label>
              <div className="a-hint">{viewing.phone || 'Not provided'}</div>
            </div>
            <div className="a-field">
              <label>Subject</label>
              <div className="a-hint">{viewing.subject || 'General Enquiry'}</div>
            </div>
            <div className="a-field">
              <label>Received</label>
              <div className="a-hint">{new Date(viewing.created_at).toLocaleString()}</div>
            </div>
          </div>

          <div className="a-field">
            <label>Message</label>
            <div
              style={{
                background: 'var(--off-white)',
                border: '1px solid var(--line)',
                borderRadius: 11,
                padding: 16,
                fontSize: 14,
                lineHeight: 1.75,
                whiteSpace: 'pre-wrap',
              }}
            >
              {viewing.message}
            </div>
          </div>

          {viewing.source_page && (
            <div className="a-hint">Sent from {viewing.source_page}</div>
          )}
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this enquiry?"
          message={`The message from ${deleting.name} will be permanently removed.`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {toastNode}
    </>
  );
}
