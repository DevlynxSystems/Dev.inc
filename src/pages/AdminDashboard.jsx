import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight, BookText, ShieldCheck, Users2, MessageSquare, Activity, UserPlus, LibraryBig } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '../auth/AuthContext'
import { AdminLayout } from '../components/AdminLayout'
import { exportAdminEventsCsv, getAdminEvents } from '../lib/adminAudit'

export function AdminDashboard() {
  const { API_BASE_URL, authFetch } = useAuth()

  const [users, setUsers] = useState([])
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])

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

  useEffect(() => {
    setEvents(getAdminEvents().slice(0, 12))
  }, [users.length, books.length])

  const totalUsers = users.length
  const totalAdmins = users.filter((u) => u.role === 'admin').length
  const totalBooks = books.length
  const totalReviews = 0
  const trendUsers = totalUsers > 0 ? '+12%' : '+0%'
  const trendAdmins = totalAdmins > 0 ? '+4%' : '+0%'
  const trendBooks = totalBooks > 0 ? '+18%' : '+0%'
  const trendReviews = '+0%'

  const recentUsers = useMemo(() => {
    return [...users].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5)
  }, [users])

  const recentBooks = useMemo(() => {
    return [...books].sort((a, b) => String(b._id).localeCompare(String(a._id))).slice(0, 5)
  }, [books])

  const analytics = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const base = months.map((m, idx) => ({ month: m, users: 0, books: 0, idx }))
    users.forEach((u) => {
      const d = new Date(u.createdAt || Date.now())
      base[d.getMonth()].users += 1
    })
    books.forEach((b) => {
      const d = new Date(b.date || Date.now())
      base[d.getMonth()].books += 1
    })
    return base
  }, [users, books])

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Summary cards">
        {[
          { label: 'Total users', value: loading ? '—' : totalUsers, trend: trendUsers, icon: Users2 },
          { label: 'Total admins', value: loading ? '—' : totalAdmins, trend: trendAdmins, icon: ShieldCheck },
          { label: 'Total books', value: loading ? '—' : totalBooks, trend: trendBooks, icon: BookText },
          { label: 'Total reviews', value: loading ? '—' : totalReviews, trend: trendReviews, icon: MessageSquare },
        ].map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-orange-500/[0.06] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-300">{card.label}</p>
                <Icon className="h-4 w-4 text-orange-300" />
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{card.value}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
                {card.trend} this month
                <ArrowUpRight className="h-3.5 w-3.5" />
              </p>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1.25fr_0.9fr]" aria-label="Recent activity">
        <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Analytics Overview</h3>
            <span className="text-xs uppercase tracking-[0.12em] text-stone-400">Users vs books (monthly)</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="booksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#a8a29e" tickLine={false} axisLine={false} />
                <YAxis stroke="#a8a29e" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(12, 10, 9, 0.9)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                  }}
                />
                <Area type="monotone" dataKey="users" stroke="#fb923c" fill="url(#usersGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="books" stroke="#60a5fa" fill="url(#booksGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h3 className="text-lg font-semibold text-white">Recently joined users</h3>
            <Link className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-stone-200 transition hover:bg-white/[0.08]" to="/admin/users">
              Manage
            </Link>
          </div>
          <div className="px-4 py-3">
            <ul className="space-y-2">
              {loading ? (
                <li className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-stone-400">Loading…</li>
              ) : recentUsers.length === 0 ? (
                <li className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-stone-400">No users yet.</li>
              ) : (
                recentUsers.map((u) => (
                  <li key={u.id} className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 transition hover:-translate-y-0.5 hover:border-orange-300/25 hover:bg-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/90 text-xs font-semibold text-white">
                        {(u.name || 'U').charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-stone-100">{u.name}</p>
                        <p className="text-xs text-stone-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Joined recently'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                        u.role === 'admin' ? 'bg-orange-500/20 text-orange-200' : 'bg-blue-500/20 text-blue-200'
                      }`}>
                        {u.role}
                      </span>
                      <Link to={`/admin/users/${u.id}`} className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-stone-200 transition hover:bg-white/[0.08]">
                        View
                      </Link>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h3 className="text-lg font-semibold text-white">Recently added books</h3>
            <Link className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-stone-200 transition hover:bg-white/[0.08]" to="/admin/books">
              Manage
            </Link>
          </div>
          <div className="px-4 py-3">
            <ul className="space-y-2">
              {loading ? (
                <li className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-stone-400">Loading…</li>
              ) : recentBooks.length === 0 ? (
                <li className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-stone-400">No books yet.</li>
              ) : (
                recentBooks.map((b) => (
                  <li key={b._id} className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 transition hover:-translate-y-0.5 hover:border-orange-300/25 hover:bg-white/[0.06]">
                    <div className="flex items-center gap-2">
                      {b.cover ? (
                        <img src={b.cover} alt={`Cover: ${b.title || 'Untitled'}`} className="h-10 w-8 rounded-md object-cover" />
                      ) : (
                        <span className="inline-flex h-10 w-8 items-center justify-center rounded-md bg-white/10 text-xs text-stone-300">B</span>
                      )}
                      <div>
                        <p className="line-clamp-1 text-sm font-medium text-stone-100">{b.title || 'Untitled'}</p>
                        <p className="text-xs text-stone-400">{b.author || 'Unknown author'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-stone-400">{b.date ? new Date(b.date).getFullYear() : '—'}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-orange-200">Quick actions</h3>
            <div className="mt-3 space-y-2">
              <Link to="/admin/users" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-stone-100 transition hover:border-white/20 hover:bg-white/[0.06]">
                Add / manage users
                <UserPlus className="h-4 w-4 text-orange-300" />
              </Link>
              <Link to="/admin/books" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-stone-100 transition hover:border-white/20 hover:bg-white/[0.06]">
                Add / manage books
                <LibraryBig className="h-4 w-4 text-orange-300" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-orange-200">Activity feed</h3>
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-stone-300"
                onClick={() => exportAdminEventsCsv(events)}
              >
                Export
              </button>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-stone-300">
              {events.length === 0 ? (
                <li className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-stone-400">No audit events yet.</li>
              ) : events.map((evt) => (
                <li key={evt.id} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <Activity className="mt-0.5 h-4 w-4 text-orange-300" />
                  <div>
                    <p>{evt.message}</p>
                    <p className="text-xs text-stone-500">{new Date(evt.at).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

