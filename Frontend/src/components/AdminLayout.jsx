import { NavLink, useNavigate } from 'react-router-dom'
import { Bell, BookCopy, LayoutDashboard, LogOut, Search, Shield, Users } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export function AdminLayout({ title, children }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const doLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="grid w-full gap-4 lg:grid-cols-[270px_1fr]">
      <aside
        className="sticky top-[calc(var(--navbar-height)+0.85rem)] h-fit overflow-hidden rounded-3xl border border-white/10 bg-black/35 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        aria-label="Admin sidebar"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <Shield className="h-4 w-4 text-orange-300" />
            Admin Console
          </span>
          <span className="mt-1 block text-xs text-stone-400">Dev.inc Book Catalog</span>
        </div>

        <nav className="mt-4 space-y-2" aria-label="Admin navigation">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'border-orange-300/35 bg-orange-500/15 text-orange-100 shadow-[inset_0_0_0_1px_rgba(251,146,60,0.2)]'
                  : 'border-transparent bg-transparent text-stone-200 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/5',
              ].join(' ')
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'border-orange-300/35 bg-orange-500/15 text-orange-100 shadow-[inset_0_0_0_1px_rgba(251,146,60,0.2)]'
                  : 'border-transparent bg-transparent text-stone-200 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/5',
              ].join(' ')
            }
          >
            <Users className="h-4 w-4" />
            Users
          </NavLink>
          <NavLink
            to="/admin/books"
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'border-orange-300/35 bg-orange-500/15 text-orange-100 shadow-[inset_0_0_0_1px_rgba(251,146,60,0.2)]'
                  : 'border-transparent bg-transparent text-stone-200 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/5',
              ].join(' ')
            }
          >
            <BookCopy className="h-4 w-4" />
            Books
          </NavLink>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-rose-300 transition hover:-translate-y-0.5 hover:border-rose-400/25 hover:bg-rose-500/10"
            onClick={doLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </aside>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-[0_18px_55px_rgba(0,0,0,0.45)] backdrop-blur-xl" aria-label="Admin content">
        <header className="border-b border-white/10 px-4 py-3 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">{title}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  placeholder="Search users, books, actions..."
                  className="h-10 w-56 rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-stone-100 placeholder:text-stone-500 outline-none transition focus:border-orange-300/45 focus:ring-2 focus:ring-orange-500/20"
                />
              </label>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-stone-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/books')}
                className="rounded-xl border border-orange-300/35 bg-orange-500/90 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                Add Book
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </span>
                <span className="hidden text-sm font-medium text-stone-200 sm:inline">{user?.name || 'Admin'}</span>
              </button>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </section>
    </div>
  )
}

