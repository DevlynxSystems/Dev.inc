const AUDIT_KEY = 'devinc_admin_audit_events';
const MAX_EVENTS = 300;

/**
 * Reads admin audit events from browser localStorage.
 * @returns {Array<Object>} Audit events in reverse chronological order.
 */
export function getAdminEvents() {
  try {
    const raw = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

/**
 * Adds a normalized admin event to localStorage.
 * @param {{ actor?: string, type?: string, message?: string, meta?: Object }} event
 * @returns {{ id: string, at: string, actor: string, type: string, message: string, meta: Object }}
 */
export function logAdminEvent(event) {
  const now = new Date().toISOString();
  const normalized = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    at: now,
    actor: event.actor || 'Admin',
    type: event.type || 'info',
    message: event.message || 'Admin action',
    meta: event.meta || {},
  };
  const prev = getAdminEvents();
  const next = [normalized, ...prev].slice(0, MAX_EVENTS);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(next));
  return normalized;
}

/**
 * Exports audit events to a CSV file in the browser.
 * @param {Array<{ at?: string, actor?: string, type?: string, message?: string, meta?: Object }>} events
 * @returns {void}
 */
export function exportAdminEventsCsv(events) {
  const rows = (events || []).map((e) => ({
    at: e.at,
    actor: e.actor,
    type: e.type,
    message: e.message,
    meta: JSON.stringify(e.meta || {}),
  }));
  const header = ['at', 'actor', 'type', 'message', 'meta'];
  const csv = [
    header.join(','),
    ...rows.map((r) =>
      header
        .map((k) => `"${String(r[k] ?? '').replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'admin-audit-trail.csv';
  a.click();
  URL.revokeObjectURL(url);
}
