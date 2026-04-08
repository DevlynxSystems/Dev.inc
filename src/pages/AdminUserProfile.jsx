import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AdminLayout } from '../components/AdminLayout'
import { AdminUserDetailSkeleton } from '../components/Skeleton'

function fmt(dt) {
  if (!dt) return '—'
  try {
    return new Date(dt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}

export function AdminUserProfile() {
  const { id } = useParams()
  const { API_BASE_URL, authFetch } = useAuth()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await authFetch(`${API_BASE_URL}/api/admin/users/${id}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Failed to fetch user')
        if (!cancelled) setUser(data.user || null)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to fetch user')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (id) load()
    return () => { cancelled = true }
  }, [API_BASE_URL, authFetch, id])

  return (
    <AdminLayout title="User Profile">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <Link to="/admin/users" className="btn btn-secondary">Back to users</Link>
      </div>

      {loading ? (
        <AdminUserDetailSkeleton />
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : !user ? (
        <p className="catalog-intro">User not found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3 className="admin-panel-title">Details</h3>
            </div>
            <div className="admin-panel-body">
              <dl className="details-list">
                <div className="details-row"><dt>Name</dt><dd>{user.name}</dd></div>
                <div className="details-row"><dt>Email</dt><dd>{user.email}</dd></div>
                <div className="details-row"><dt>Role</dt><dd>{user.role}</dd></div>
                <div className="details-row"><dt>Joined</dt><dd>{fmt(user.createdAt)}</dd></div>
                <div className="details-row"><dt>Phone</dt><dd>{user.phone || '—'}</dd></div>
                <div className="details-row">
                  <dt>Address</dt>
                  <dd>
                    {[
                      user.address?.line1,
                      user.address?.line2,
                      user.address?.city,
                      user.address?.state,
                      user.address?.postalCode,
                      user.address?.country,
                    ].filter(Boolean).join(', ') || '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3 className="admin-panel-title">User activity</h3>
            </div>
            <div className="admin-panel-body">
              <p className="catalog-intro" style={{ margin: 0 }}>
                Favorite genre, wishlist, recently viewed books, and reviews can be displayed here when those features are implemented.
              </p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

