const AUDIT_KEY = 'devinc_admin_audit_events';
const MAX_EVENTS = 300;

export function getAdminEvents() {
  try {
    const raw = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

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
