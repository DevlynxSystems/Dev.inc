import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState(null)
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

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    let list = [...users]
    if (roleFilter === 'user' || roleFilter === 'admin') list = list.filter((u) => u.role === roleFilter)
    if (query) list = list.filter((u) => (u.name || '').toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query))
    return list
  }, [users, q, roleFilter])

  const openEdit = (u) => {
    setEditing(u)
    setEditName(u?.name || '')
    setEditPhone(u?.phone || '')
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!editing?.id) return
    setSaving(true)
    setError('')
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/users/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), phone: editPhone.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to update user')
      setUsers((prev) => prev.map((u) => (u.id === editing.id ? data.user : u)))
      setEditOpen(false)
      setEditing(null)
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
    } catch (e) {
      alert(e.message || 'Failed to update role')
    }
  }

  return (
    <AdminLayout title="Manage Users">
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email…"
          className="navbar-search"
          style={{ maxWidth: 420 }}
        />
        <select
          className="catalog-filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
        <button type="button" className="btn btn-secondary" onClick={fetchUsers} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>Joined</th>
              <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '1rem 0.5rem', color: 'var(--color-text-muted)' }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '1rem 0.5rem', color: 'var(--color-text-muted)' }}>No users found.</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>{u.name}</td>
                  <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>
                    <span className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', cursor: 'default' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>{formatDate(u.createdAt)}</td>
                  <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Link to={`/admin/users/${u.id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem' }}>
                        View
                      </Link>
                      <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem' }} onClick={() => openEdit(u)}>
                        Edit
                      </button>
                      {u.role === 'admin' ? (
                        <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem' }} onClick={() => setRole(u.id, 'user')}>
                          Demote
                        </button>
                      ) : (
                        <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem' }} onClick={() => setRole(u.id, 'admin')}>
                          Promote
                        </button>
                      )}
                      <button type="button" className="btn btn-danger" style={{ padding: '0.35rem 0.75rem' }} onClick={() => removeUser(u.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editOpen && (
        <aside className="modal" aria-hidden="false" onClick={(e) => e.target === e.currentTarget && setEditOpen(false)}>
          <div className="modal-backdrop" aria-hidden="true" />
          <div className="modal-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit user</h2>
            <form
              className="book-form"
              onSubmit={(e) => {
                e.preventDefault()
                saveEdit()
              }}
            >
              <label htmlFor="edit-name">Name</label>
              <input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} required />

              <label htmlFor="edit-phone">Phone</label>
              <input id="edit-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditOpen(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </aside>
      )}
    </AdminLayout>
  )
}

