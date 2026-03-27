import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp, Download, Eye, Pencil, Search, Shield, Trash2, Users, UserRoundPlus, UserX } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { AdminLayout } from '../components/AdminLayout'
import { getAdminEvents, logAdminEvent } from '../lib/adminAudit'
import '../components/BookFormModal.css'

const USER_STATUS_KEY = 'devinc_admin_user_status';
const USER_ROLE_OVERRIDE_KEY = 'devinc_admin_user_role_overrides';
const PAGE_SIZE = 10;

function formatDate(dt) {
  if (!dt) return '—';
  try {
    return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

function formatDateTime(dt) {
  if (!dt) return '—';
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return '—';
  }
}

export function ManageUsers() {
  const navigate = useNavigate();
  const { API_BASE_URL, authFetch } = useAuth();

  const [users, setUsers] = useState([]);
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [page, setPage] = useState(1);

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [confirmAction, setConfirmAction] = useState(null);
  const [auditEvents, setAuditEvents] = useState([]);

  const [statusMap, setStatusMap] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(USER_STATUS_KEY) || '{}');
      return raw && typeof raw === 'object' ? raw : {};
    } catch {
      return {};
    }
  });
  const [roleOverrides, setRoleOverrides] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(USER_ROLE_OVERRIDE_KEY) || '{}');
      return raw && typeof raw === 'object' ? raw : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(USER_STATUS_KEY, JSON.stringify(statusMap));
  }, [statusMap]);

  useEffect(() => {
    localStorage.setItem(USER_ROLE_OVERRIDE_KEY, JSON.stringify(roleOverrides));
  }, [roleOverrides]);

  const getStatus = (u) => statusMap[u.id] || 'active';
  const getEffectiveRole = (u) => roleOverrides[u.id] || u.role || 'user';

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (roleFilter === 'user' || roleFilter === 'admin') params.set('role', roleFilter);

      const res = await authFetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      const incoming = Array.isArray(data.users) ? data.users : [];
      setUsers(incoming);
      setAuditEvents(getAdminEvents().slice(0, 40));
      logAdminEvent({ type: 'users.refresh', message: 'Refreshed users list', meta: { count: incoming.length } });
    } catch (e) {
      setError(e.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setQ(qInput), 250);
    return () => clearTimeout(t);
  }, [qInput]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = [...users];

    if (roleFilter !== 'all') list = list.filter((u) => getEffectiveRole(u) === roleFilter);
    if (statusFilter !== 'all') list = list.filter((u) => getStatus(u) === statusFilter);

    if (dateFilter === '7d') {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      list = list.filter((u) => new Date(u.createdAt || 0).getTime() >= cutoff);
    }
    if (dateFilter === '30d') {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      list = list.filter((u) => new Date(u.createdAt || 0).getTime() >= cutoff);
    }

    if (query) {
      list = list.filter((u) =>
        (u.name || '').toLowerCase().includes(query) ||
        (u.email || '').toLowerCase().includes(query) ||
        getEffectiveRole(u).toLowerCase().includes(query)
      );
    }

    if (sortBy === 'name') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    if (sortBy === 'role') list.sort((a, b) => getEffectiveRole(a).localeCompare(getEffectiveRole(b)));
    if (sortBy === 'status') list.sort((a, b) => getStatus(a).localeCompare(getStatus(b)));
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (sortBy === 'oldest') list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    return list;
  }, [users, q, roleFilter, statusFilter, dateFilter, sortBy, roleOverrides, statusMap]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [q, roleFilter, statusFilter, dateFilter, sortBy]);

  const openDrawer = (u) => {
    setActiveUser(u);
    setEditName(u?.name || '');
    setEditPhone(u?.phone || '');
  };

  const saveEdit = async () => {
    if (!activeUser?.id) return;
    setSaving(true);
    setError('');
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/users/${activeUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), phone: editPhone.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update user');
      setUsers((prev) => prev.map((u) => (u.id === activeUser.id ? data.user : u)));
      setActiveUser(data.user);
      logAdminEvent({ type: 'users.edit', message: `Updated user ${data.user?.email || activeUser.email}`, meta: { id: activeUser.id } });
      setAuditEvents(getAdminEvents().slice(0, 40));
    } catch (e) {
      setError(e.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const hardDeleteUser = async (id) => {
    const res = await authFetch(`${API_BASE_URL}/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to delete user');
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logAdminEvent({ type: 'users.delete', message: `Deleted user ${id}`, meta: { id } });
    setAuditEvents(getAdminEvents().slice(0, 40));
  };

  const setRole = async (id, role) => {
    if (role === 'moderator') {
      setRoleOverrides((prev) => ({ ...prev, [id]: role }));
      logAdminEvent({ type: 'users.role', message: `Set role moderator for ${id}`, meta: { id, role } });
      setAuditEvents(getAdminEvents().slice(0, 40));
      return;
    }
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update role');
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
      setRoleOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (activeUser?.id === id) setActiveUser(data.user);
      logAdminEvent({ type: 'users.role', message: `Set role ${role} for ${data.user?.email || id}`, meta: { id, role } });
      setAuditEvents(getAdminEvents().slice(0, 40));
    } catch (e) {
      alert(e.message || 'Failed to update role');
    }
  };

  const setStatus = (id, status) => {
    setStatusMap((prev) => ({ ...prev, [id]: status }));
    logAdminEvent({ type: 'users.status', message: `Set status ${status} for ${id}`, meta: { id, status } });
    setAuditEvents(getAdminEvents().slice(0, 40));
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filtered.map((u) => u.id));
  };

  const bulkDeactivate = () => {
    selectedIds.forEach((id) => setStatus(id, 'suspended'));
    logAdminEvent({ type: 'users.bulk-deactivate', message: `Suspended ${selectedIds.length} users`, meta: { count: selectedIds.length } });
    setAuditEvents(getAdminEvents().slice(0, 40));
    setSelectedIds([]);
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    for (const id of selectedIds) {
      // eslint-disable-next-line no-await-in-loop
      await hardDeleteUser(id).catch(() => {});
    }
    setSelectedIds([]);
    logAdminEvent({ type: 'users.bulk-delete', message: `Deleted ${selectedIds.length} users`, meta: { count: selectedIds.length } });
    setAuditEvents(getAdminEvents().slice(0, 40));
  };

  const bulkPromote = async () => {
    if (selectedIds.length === 0) return;
    for (const id of selectedIds) {
      // eslint-disable-next-line no-await-in-loop
      await setRole(id, 'admin');
    }
    await fetchUsers();
    setSelectedIds([]);
    logAdminEvent({ type: 'users.bulk-promote', message: `Promoted ${selectedIds.length} users`, meta: { count: selectedIds.length } });
    setAuditEvents(getAdminEvents().slice(0, 40));
  };

  const bulkExport = () => {
    const rows = filtered.map((u) => ({
      ...u,
      effectiveRole: getEffectiveRole(u),
      status: getStatus(u),
    })).filter((u) => selectedIds.includes(u.id));
    const header = ['id', 'name', 'email', 'effectiveRole', 'status', 'createdAt'];
    const csv = [
      header.join(','),
      ...rows.map((r) => header.map((k) => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    logAdminEvent({ type: 'users.export', message: `Exported ${rows.length} users`, meta: { count: rows.length } });
    setAuditEvents(getAdminEvents().slice(0, 40));
  };

  const sendInvite = () => {
    if (!inviteEmail.trim()) return;
    logAdminEvent({
      type: 'users.invite',
      message: `Invitation sent to ${inviteEmail.trim()} as ${inviteRole}`,
      meta: { email: inviteEmail.trim(), role: inviteRole },
    });
    setAuditEvents(getAdminEvents().slice(0, 40));
    setInviteEmail('');
    setInviteRole('user');
  };

  const userActivity = useMemo(() => {
    if (!activeUser?.id) return [];
    return auditEvents.filter((e) => e?.meta?.id === activeUser.id).slice(0, 6);
  }, [activeUser?.id, auditEvents]);

  return (
    <AdminLayout title="Manage Users">
      <div className="mb-4 grid gap-3 xl:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-72 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search by name, email, role..."
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-stone-100 placeholder:text-stone-500 outline-none transition focus:border-orange-300/50 focus:ring-2 focus:ring-orange-500/20"
            />
          </label>
          <select className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            <option value="user">Users</option>
            <option value="moderator">Moderators</option>
            <option value="admin">Admins</option>
          </select>
          <select className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <select className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="all">All time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <select className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
            <option value="role">Role</option>
            <option value="status">Status</option>
          </select>
          <button type="button" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-stone-200 transition hover:bg-white/[0.08]" onClick={fetchUsers} disabled={loading}>
            Refresh
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
          <UserRoundPlus className="h-4 w-4 text-orange-300" />
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Invite by email"
            className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-sm text-stone-100 outline-none"
          />
          <select className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-sm text-stone-100" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          <button type="button" className="rounded-lg border border-orange-300/30 bg-orange-500/90 px-3 py-1.5 text-sm font-semibold text-white" onClick={sendInvite}>
            Invite
          </button>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      {selectedIds.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-orange-300/35 bg-orange-500/10 px-3 py-2">
          <p className="text-sm text-orange-200">{selectedIds.length} selected</p>
          <div className="flex gap-2">
            <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs text-stone-100" onClick={bulkPromote}>
              <ArrowUp className="h-3.5 w-3.5" /> Promote
            </button>
            <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-amber-400/35 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-200" onClick={bulkDeactivate}>
              <UserX className="h-3.5 w-3.5" /> Deactivate
            </button>
            <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs text-stone-100" onClick={bulkExport}>
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-rose-400/35 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-200"
              onClick={() => setConfirmAction({ kind: 'bulk-delete', count: selectedIds.length })}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr className="sticky top-0 z-10 bg-black/60 backdrop-blur-xl">
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">
                <input type="checkbox" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={toggleSelectAll} />
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Name</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Email</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Role</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Status</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Joined</th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="px-3 py-4 text-sm text-stone-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" className="px-3 py-4 text-sm text-stone-400">No users found.</td></tr>
            ) : (
              paged.map((u) => {
                const effectiveRole = getEffectiveRole(u);
                const status = getStatus(u);
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="cursor-pointer border-t border-white/10 odd:bg-white/[0.02] even:bg-transparent transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
                    onClick={() => openDrawer(u)}
                  >
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelected(u.id)} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/90 text-xs font-semibold text-white">
                          {(u.name || 'U').charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium text-stone-100">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-stone-200">{u.email}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                        effectiveRole === 'admin'
                          ? 'bg-orange-500/20 text-orange-200'
                          : effectiveRole === 'moderator'
                            ? 'bg-violet-500/20 text-violet-200'
                            : 'bg-blue-500/20 text-blue-200'
                      }`}>
                        {effectiveRole}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                        status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-200'
                          : status === 'pending'
                            ? 'bg-amber-500/15 text-amber-200'
                            : 'bg-rose-500/15 text-rose-200'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-stone-400">{formatDate(u.createdAt)}</td>
                    <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button type="button" title="View" className="rounded-lg border border-white/10 bg-white/[0.05] p-2 text-stone-200 hover:bg-white/[0.1]" onClick={() => navigate(`/admin/users/${u.id}`)}>
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" title="Edit" className="rounded-lg border border-white/10 bg-white/[0.05] p-2 text-stone-200 hover:bg-white/[0.1]" onClick={() => openDrawer(u)}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" title="Deactivate" className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2 text-amber-200 hover:bg-amber-500/20" onClick={() => setStatus(u.id, 'suspended')}>
                          <UserX className="h-4 w-4" />
                        </button>
                        <button type="button" title="Delete" className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-2 text-rose-200 hover:bg-rose-500/20" onClick={() => setConfirmAction({ kind: 'delete-one', id: u.id, email: u.email })}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-stone-400">
        <p>Showing {paged.length} of {filtered.length} users</p>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Prev
          </button>
          <span>Page {page} / {totalPages}</span>
          <button type="button" className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      </div>

      <AnimatePresence>
        {activeUser && (
          <motion.aside
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveUser(null)}
          >
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-black/90 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
                  {(activeUser.name || 'U').charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-lg font-semibold text-white">{activeUser.name}</p>
                  <p className="text-sm text-stone-400">{activeUser.email}</p>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-stone-300">
                <p><span className="text-stone-500">Role:</span> {getEffectiveRole(activeUser)}</p>
                <p><span className="text-stone-500">Status:</span> {getStatus(activeUser)}</p>
                <p><span className="text-stone-500">Joined:</span> {formatDate(activeUser.createdAt)}</p>
                <p><span className="text-stone-500">Last login:</span> {formatDateTime(activeUser.updatedAt || activeUser.createdAt)}</p>
                <p><span className="text-stone-500">Books added:</span> {auditEvents.filter((e) => e.type === 'books.add').length}</p>
              </div>

              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveEdit();
                }}
              >
                <label className="block text-xs uppercase tracking-[0.1em] text-stone-400">Name</label>
                <input className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                <label className="block text-xs uppercase tracking-[0.1em] text-stone-400">Phone</label>
                <input className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                <div className="pt-2">
                  <p className="mb-2 text-xs uppercase tracking-[0.1em] text-stone-400">Role</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-stone-200" onClick={() => setRole(activeUser.id, 'user')}>User</button>
                    <button type="button" className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200" onClick={() => setRole(activeUser.id, 'moderator')}>Moderator</button>
                    <button type="button" className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200" onClick={() => setRole(activeUser.id, 'admin')}>Admin</button>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="mb-2 text-xs uppercase tracking-[0.1em] text-stone-400">Status</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200" onClick={() => setStatus(activeUser.id, 'active')}>Active</button>
                    <button type="button" className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200" onClick={() => setStatus(activeUser.id, 'pending')}>Pending</button>
                    <button type="button" className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200" onClick={() => setStatus(activeUser.id, 'suspended')}>Suspended</button>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="mb-2 text-xs uppercase tracking-[0.1em] text-stone-400">Audit trail</p>
                  <ul className="max-h-28 space-y-1 overflow-auto rounded-lg border border-white/10 bg-white/[0.03] p-2">
                    {userActivity.length === 0 ? (
                      <li className="text-xs text-stone-500">No recent actions for this user.</li>
                    ) : (
                      userActivity.map((evt) => (
                        <li key={evt.id} className="text-xs text-stone-300">
                          {evt.message} <span className="text-stone-500">({formatDateTime(evt.at)})</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <Link to={`/admin/users/${activeUser.id}`} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-stone-200">
                    <Users className="h-3.5 w-3.5" /> Full profile
                  </Link>
                  <div className="flex gap-2">
                    <button type="button" className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-stone-200" onClick={() => setActiveUser(null)}>
                      Close
                    </button>
                    <button type="submit" className="rounded-lg border border-orange-300/30 bg-orange-500/90 px-3 py-2 text-xs font-semibold text-white" disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmAction && (
          <motion.aside
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="mx-auto mt-36 w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white">Confirm destructive action</h3>
              <p className="mt-2 text-sm text-stone-300">
                {confirmAction.kind === 'bulk-delete'
                  ? `Delete ${confirmAction.count} selected users permanently? This cannot be undone.`
                  : `Delete ${confirmAction.email || confirmAction.id} permanently? This cannot be undone.`}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-stone-200" onClick={() => setConfirmAction(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200"
                  onClick={async () => {
                    if (confirmAction.kind === 'bulk-delete') await bulkDelete();
                    if (confirmAction.kind === 'delete-one') await hardDeleteUser(confirmAction.id).catch(() => {});
                    setConfirmAction(null);
                  }}
                >
                  Delete permanently
                </button>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

