import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AdminLayout } from '../components/AdminLayout'

export function AdminDashboard() {
  const { API_BASE_URL, authFetch } = useAuth()

  const [users, setUsers] = useState([])
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [uRes, bRes] = await Promise.all([
          authFetch(`${API_BASE_URL}/api/admin/users`),
          fetch(`${API_BASE_URL}/api/books`),
        ])
        const uData = await uRes.json().catch(() => ({}))
        const bData = await bRes.json().catch(() => ([]))

        if (!cancelled) {
          setUsers(Array.isArray(uData.users) ? uData.users : [])
          setBooks(Array.isArray(bData) ? bData : [])
        }
      } catch {
        if (!cancelled) {
          setUsers([])
          setBooks([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [API_BASE_URL, authFetch])

  const totalUsers = users.length
  const totalAdmins = users.filter((u) => u.role === 'admin').length
  const totalBooks = books.length
  const totalReviews = 0

  const recentUsers = useMemo(() => {
    return [...users].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5)
  }, [users])

  const recentBooks = useMemo(() => {
    return [...books].sort((a, b) => String(b._id).localeCompare(String(a._id))).slice(0, 5)
  }, [books])

  return (
    <AdminLayout title="Dashboard">
      <div className="admin-cards" aria-label="Summary cards">
        <div className="admin-card">
          <p className="admin-card-label">Total users</p>
          <p className="admin-card-value">{loading ? '—' : totalUsers}</p>
        </div>
        <div className="admin-card">
          <p className="admin-card-label">Total admins</p>
          <p className="admin-card-value">{loading ? '—' : totalAdmins}</p>
        </div>
        <div className="admin-card">
          <p className="admin-card-label">Total books</p>
          <p className="admin-card-value">{loading ? '—' : totalBooks}</p>
        </div>
        <div className="admin-card">
          <p className="admin-card-label">Total reviews</p>
          <p className="admin-card-value">{loading ? '—' : totalReviews}</p>
        </div>
      </div>

      <div className="admin-split" aria-label="Recent activity">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3 className="admin-panel-title">Recently joined users</h3>
            <Link className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem' }} to="/admin/users">
              Manage
            </Link>
          </div>
          <div className="admin-panel-body">
            <ul className="admin-list">
              {loading ? (
                <li className="admin-list-item"><span className="admin-list-meta">Loading…</span></li>
              ) : recentUsers.length === 0 ? (
                <li className="admin-list-item"><span className="admin-list-meta">No users yet.</span></li>
              ) : (
                recentUsers.map((u) => (
                  <li key={u.id} className="admin-list-item">
                    <span>
                      <strong>{u.name}</strong> <span className="admin-list-meta">({u.role})</span>
                    </span>
                    <Link to={`/admin/users/${u.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem' }}>
                      View
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3 className="admin-panel-title">Recently added books</h3>
            <Link className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem' }} to="/admin/books">
              Manage
            </Link>
          </div>
          <div className="admin-panel-body">
            <ul className="admin-list">
              {loading ? (
                <li className="admin-list-item"><span className="admin-list-meta">Loading…</span></li>
              ) : recentBooks.length === 0 ? (
                <li className="admin-list-item"><span className="admin-list-meta">No books yet.</span></li>
              ) : (
                recentBooks.map((b) => (
                  <li key={b._id} className="admin-list-item">
                    <span>
                      <strong>{b.title || 'Untitled'}</strong> <span className="admin-list-meta">by {b.author || 'Unknown'}</span>
                    </span>
                    <span className="admin-list-meta">{b.date ? new Date(b.date).getFullYear() : '—'}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

