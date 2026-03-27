import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function TabLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-300',
          isActive
            ? 'border-orange-300/40 bg-orange-500/20 text-orange-100 shadow-[0_0_24px_rgba(251,146,60,0.22)]'
            : 'border-transparent text-stone-200 hover:border-white/10 hover:bg-white/10 hover:text-white',
        ].join(' ')
      }
      aria-label={label}
      title={label}
    >
      {icon && <span className="hidden h-4 w-4 md:inline-flex" aria-hidden="true">{icon}</span>}
      <span className="whitespace-nowrap">{label}</span>
    </NavLink>
  )
}

function TabButton({ onClick, label, icon }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-1.5 text-sm font-medium text-stone-200 transition-all duration-300 hover:border-white/10 hover:bg-white/10 hover:text-white"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {icon && <span className="hidden h-4 w-4 md:inline-flex" aria-hidden="true">{icon}</span>}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}

export function Navbar({ searchQuery, onSearchChange, onAddBook }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [profileOpen])

  const isCatalogRoute = location.pathname === '/catalog'

  const doLogout = () => {
    setProfileOpen(false)
    logout()
    navigate('/')
  }

  const initial = user?.name?.[0]?.toUpperCase() || '?'

  return (
    <header className="sticky top-3 z-50 px-4 md:px-6" role="banner">
      <div className="mx-auto flex w-full max-w-6xl justify-center">
        <nav
          className="flex w-full items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-black/35 px-2.5 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          aria-label="Primary"
        >
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-stone-100" aria-label="Book Catalog Home">
            {!user ? (
              <>
                <img src="/logo.png" alt="" className="h-5 w-5 object-contain" />
                <span className="whitespace-nowrap font-semibold tracking-tight">Book Catalog</span>
              </>
            ) : (
              <>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white" aria-hidden="true">
                  {initial}
                </span>
                <span className="whitespace-nowrap font-semibold tracking-tight">
                  {user.name?.split(' ')[0] || 'User'}
                </span>
              </>
            )}
          </Link>

          <div className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
            <TabLink
              to="/"
              label="Home"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5 10v10a1 1 0 0 0 1 1h4v-7h4v7h4a1 1 0 0 0 1-1V10" />
                </svg>
              }
            />

            {user?.role !== 'admin' && (
              <TabLink
                to="/catalog"
                label="Catalog"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <path d="M8 7h8" />
                    <path d="M8 11h8" />
                  </svg>
                }
              />
            )}

          {!user && (
            <>
              <span className="mx-1 hidden h-6 w-px bg-white/15 md:inline-block" aria-hidden="true" />
              <TabLink
                to="/login"
                label="Login"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                  </svg>
                }
              />
              <TabLink
                to="/signup"
                label="Signup"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6" />
                    <path d="M23 11h-6" />
                  </svg>
                }
              />
            </>
          )}

          {user?.role === 'user' && (
            <>
              <span className="mx-1 hidden h-6 w-px bg-white/15 md:inline-block" aria-hidden="true" />
              <TabLink
                to="/dashboard"
                label="Dashboard"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 13h8V3H3v10z" />
                    <path d="M13 21h8V11h-8v10z" />
                    <path d="M13 3h8v6h-8V3z" />
                    <path d="M3 21h8v-6H3v6z" />
                  </svg>
                }
              />
              <TabButton
                onClick={doLogout}
                label="Logout"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                }
              />
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <span className="mx-1 hidden h-6 w-px bg-white/15 md:inline-block" aria-hidden="true" />
              <TabLink
                to="/admin"
                label="Admin Dashboard"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                }
              />
              <TabLink
                to="/admin/users"
                label="Manage Users"
              />
              <TabLink
                to="/admin/books"
                label="Manage Books"
              />
              <TabButton
                onClick={doLogout}
                label="Logout"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                }
              />
            </>
          )}
          </div>

          <div className="ml-auto">
            {user && (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-stone-200 transition hover:border-white/20 hover:bg-white/10"
                  onClick={() => setProfileOpen((o) => !o)}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="User profile menu"
                  title={user.email}
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 font-semibold text-white" aria-hidden="true">
                    {initial}
                  </span>
                  <svg
                    className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 4.5L6 8l3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-52 rounded-2xl border border-white/10 bg-black/70 p-2 shadow-2xl backdrop-blur-xl" role="menu">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 font-semibold text-white">{initial}</span>
                      <div>
                        <span className="block text-sm font-semibold text-white">{user.name}</span>
                        <span className="block text-xs text-stone-400">{user.email}</span>
                      </div>
                    </div>
                    <div className="my-1 h-px bg-white/10" />
                    <button
                      type="button"
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                      role="menuitem"
                      onClick={doLogout}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {isCatalogRoute && (
          <div className="mt-3 w-full max-w-xl">
            <input
              type="search"
              className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-stone-100 placeholder:text-stone-400 focus:border-orange-400/60 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="Search by title, author, or genre…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search books"
            />
          </div>
        )}
      </div>

    </header>
  )
}
