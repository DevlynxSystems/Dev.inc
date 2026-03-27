import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp, Download, Eye, Pencil, Search, Shield, Trash2, Users } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { AdminLayout } from '../components/AdminLayout'
import '../components/BookFormModal.css'

function formatDate(dt) {
  if (!dt) return '—'
  try {
    return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}

export function ManageUsers() {
  const navigate = useNavigate()
  const { API_BASE_URL, authFetch } = useAuth()

  const [users, setUsers] = useState([])
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [activeUser, setActiveUser] = useState(null)

  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      if (roleFilter === 'user' || roleFilter === 'admin') params.set('role', roleFilter)

      const res = await authFetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users')
      setUsers(Array.isArray(data.users) ? data.users : [])
    } catch (e) {
      setError(e.message || 'Failed to fetch users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setQ(qInput), 250)
    return () => clearTimeout(t)
  }, [qInput])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    let list = [...users]
    if (roleFilter === 'user' || roleFilter === 'admin') list = list.filter((u) => u.role === roleFilter)
    if (query) list = list.filter((u) => (u.name || '').toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query))
    if (sortBy === 'name') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    if (sortBy === 'role') list.sort((a, b) => (a.role || '').localeCompare(b.role || ''))
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    return list
  }, [users, q, roleFilter, sortBy])

  const openDrawer = (u) => {
    setActiveUser(u)
    setEditName(u?.name || '')
    setEditPhone(u?.phone || '')
  }

  const saveEdit = async () => {
    if (!activeUser?.id) return
    setSaving(true)
    setError('')
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/users/${activeUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), phone: editPhone.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to update user')
      setUsers((prev) => prev.map((u) => (u.id === activeUser.id ? data.user : u)))
      setActiveUser(data.user)
    } catch (e) {
      setError(e.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const removeUser = async (id) => {
    if (!id) return
    if (!confirm('Delete this user?')) return
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to delete user')
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (e) {
      alert(e.message || 'Failed to delete user')
    }
  }

  const setRole = async (id, role) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to update role')
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)))
      if (activeUser?.id === id) setActiveUser(data.user)
    } catch (e) {
      alert(e.message || 'Failed to update role')
    }
  }

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([])
      return
    }
    setSelectedIds(filtered.map((u) => u.id))
  }

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} selected users?`)) return
    for (const id of selectedIds) {
      // best-effort bulk delete
      // eslint-disable-next-line no-await-in-loop
      await authFetch(`${API_BASE_URL}/api/admin/users/${id}`, { method: 'DELETE' }).catch(() => {})
    }
    setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)))
    setSelectedIds([])
  }

  const bulkPromote = async () => {
    if (selectedIds.length === 0) return
    for (const id of selectedIds) {
      // eslint-disable-next-line no-await-in-loop
      await authFetch(`${API_BASE_URL}/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' }),
      }).catch(() => {})
    }
    await fetchUsers()
    setSelectedIds([])
  }

  const bulkExport = () => {
    const rows = filtered.filter((u) => selectedIds.includes(u.id))
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout title="Manage Users">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search by name or email..."
            className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-stone-100 placeholder:text-stone-500 outline-none transition focus:border-orange-300/50 focus:ring-2 focus:ring-orange-500/20"
          />
        </label>
        <select className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
        <select className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="name">Name</option>
          <option value="role">Role</option>
        </select>
        <button type="button" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-stone-200 transition hover:bg-white/[0.08]" onClick={fetchUsers} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {selectedIds.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-orange-300/35 bg-orange-500/10 px-3 py-2">
          <p className="text-sm text-orange-200">{selectedIds.length} selected</p>
          <div className="flex gap-2">
            <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs text-stone-100" onClick={bulkPromote}>
              <ArrowUp className="h-3.5 w-3.5" /> Promote
            </button>
            <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs text-stone-100" onClick={bulkExport}>
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-rose-400/35 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-200" onClick={bulkDelete}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full min-w-[840px] border-collapse">
          <thead>
            <tr className="sticky top-0 z-10 bg-black/60 backdrop-blur-xl">
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">
                <input type="checkbox" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={toggleSelectAll} />
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Name</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Email</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Role</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Joined</th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="px-3 py-4 text-sm text-stone-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="px-3 py-4 text-sm text-stone-400">No users found.</td></tr>
            ) : (
              filtered.map((u) => (
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
                      u.role === 'admin' ? 'bg-orange-500/20 text-orange-200' : 'bg-blue-500/20 text-blue-200'
                    }`}>
                      {u.role}
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
                      {u.role === 'admin' ? (
                        <button type="button" title="Demote" className="rounded-lg border border-white/10 bg-white/[0.05] p-2 text-stone-200 hover:bg-white/[0.1]" onClick={() => setRole(u.id, 'user')}>
                          <Shield className="h-4 w-4" />
                        </button>
                      ) : (
                        <button type="button" title="Promote" className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-2 text-emerald-200 hover:bg-emerald-500/20" onClick={() => setRole(u.id, 'admin')}>
                          <ArrowUp className="h-4 w-4" />
                        </button>
                      )}
                      <button type="button" title="Delete" className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-2 text-rose-200 hover:bg-rose-500/20" onClick={() => removeUser(u.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
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
              className="absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-black/85 p-5"
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

              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  saveEdit()
                }}
              >
                <label className="block text-xs uppercase tracking-[0.1em] text-stone-400">Name</label>
                <input className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                <label className="block text-xs uppercase tracking-[0.1em] text-stone-400">Phone</label>
                <input className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                <div className="pt-3">
                  <p className="mb-2 text-xs uppercase tracking-[0.1em] text-stone-400">Role</p>
                  <div className="flex gap-2">
                    <button type="button" className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-stone-200" onClick={() => setRole(activeUser.id, 'user')}>
                      Set User
                    </button>
                    <button type="button" className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200" onClick={() => setRole(activeUser.id, 'admin')}>
                      Set Admin
                    </button>
                  </div>
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
    </AdminLayout>
  )
}

