import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom'
import './Navbar.css'
import { useAuth } from '../auth/AuthContext'

function TabLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-tab ${isActive ? 'is-active' : ''}`}
      aria-label={label}
      title={label}
    >
      {icon && <span className="nav-tab-icon" aria-hidden="true">{icon}</span>}
      <span className="nav-tab-label">{label}</span>
    </NavLink>
  )
}

function TabButton({ onClick, label, icon }) {
  return (
    <button type="button" className="nav-tab nav-tab-btn" onClick={onClick} aria-label={label} title={label}>
      {icon && <span className="nav-tab-icon" aria-hidden="true">{icon}</span>}
      <span className="nav-tab-label">{label}</span>
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
    <header className="navbar" role="banner">
      <div className="navbar-center">
        <nav className="nav-shell" aria-label="Primary">
          <Link to="/" className="nav-brand-chip" aria-label="Book Catalog Home">
            {!user ? (
              <>
                <img src="/logo.png" alt="" className="nav-brand-chip-img" />
                <span className="nav-brand-chip-title">Book Catalog</span>
              </>
            ) : (
              <>
                <span className="nav-user-chip-avatar" aria-hidden="true">
                  {initial}
                </span>
                <span className="nav-brand-chip-title">
                  {user.name?.split(' ')[0] || 'User'}
                </span>
              </>
            )}
          </Link>

          <div className="nav-shell-tabs" role="navigation" aria-label="Main navigation">
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
              <span className="nav-shell-divider" aria-hidden="true" />
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
              <span className="nav-shell-divider" aria-hidden="true" />
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
              <span className="nav-shell-divider" aria-hidden="true" />
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

          <div className="nav-shell-right">
            {user && (
              <div className="navbar-profile-wrap" ref={profileRef}>
                <button
                  type="button"
                  className="navbar-profile-trigger"
                  onClick={() => setProfileOpen((o) => !o)}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="User profile menu"
                  title={user.email}
                >
                  <span className="navbar-profile-avatar" aria-hidden="true">
                    {initial}
                  </span>
                  <svg
                    className="navbar-profile-chevron"
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
                  <div className="navbar-profile-dropdown" role="menu">
                    <div className="navbar-profile-head">
                      <span className="navbar-profile-dropdown-avatar">{initial}</span>
                      <div>
                        <span className="navbar-profile-name">{user.name}</span>
                        <span className="navbar-profile-email">{user.email}</span>
                      </div>
                    </div>
                    <div className="navbar-profile-divider" />
                    <button
                      type="button"
                      className="navbar-profile-item navbar-profile-item--danger"
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
          <div className="navbar-search-wrap">
            <input
              type="search"
              className="navbar-search"
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
