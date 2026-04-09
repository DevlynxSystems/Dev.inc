import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Mail, MapPin, Phone, Sparkles } from 'lucide-react'
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
  const fullAddress = [
    user?.address?.line1,
    user?.address?.line2,
    user?.address?.city,
    user?.address?.state,
    user?.address?.postalCode,
    user?.address?.country,
  ].filter(Boolean).join(', ')

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-stone-200 transition hover:border-white/20 hover:bg-white/[0.08]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Link>
      </div>

      {loading ? (
        <AdminUserDetailSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
      ) : !user ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-stone-300">User not found.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.9fr]">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="border-b border-white/10 p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-stone-400">Account details</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                    user.role === 'admin' ? 'bg-orange-500/20 text-orange-200' : 'bg-blue-500/20 text-blue-200'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>
            <div className="grid gap-3 p-4 md:grid-cols-2 md:p-5">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-stone-400">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </p>
                <p className="text-sm font-medium text-stone-100">{user.email}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-stone-400">
                  <Phone className="h-3.5 w-3.5" />
                  Phone
                </p>
                <p className="text-sm font-medium text-stone-100">{user.phone || '—'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-stone-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Joined
                </p>
                <p className="text-sm font-medium text-stone-100">{fmt(user.createdAt)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 md:col-span-2">
                <p className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-stone-400">
                  <MapPin className="h-3.5 w-3.5" />
                  Address
                </p>
                <p className="text-sm font-medium text-stone-100">{fullAddress || '—'}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-orange-200">User activity</h3>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-sm text-stone-300">
                Favorite genre, wishlist, recently viewed books, and reviews can be displayed here when those features are implemented.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Wishlist', 'Recent views', 'Reviews'].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-300"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-orange-300/25 bg-orange-500/10 p-3 text-xs text-orange-200">
              <p className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Insights module coming soon
              </p>
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  )
}

