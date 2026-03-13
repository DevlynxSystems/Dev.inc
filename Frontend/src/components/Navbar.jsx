import { useState, useRef, useEffect } from 'react'
import './Navbar.css'

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light'
}

export function Navbar({ searchQuery, onSearchChange, onAddBook }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [theme, setTheme] = useState(getTheme)
  const profileRef = useRef(null)

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

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    setTheme(next)
  }

  return (
    <header className="navbar" role="banner">
      <div className="navbar-brand">
        <img
          src="/logo.png"
          alt="Dev.inc – Book & ideas"
          className="navbar-logo"
        />
        <span className="navbar-title">Book Catalog</span>
      </div>
      <div className="navbar-center">
        <input
          type="search"
          className="navbar-search"
          placeholder="Search by title, author, or genre…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search books"
        />
      </div>
      <div className="navbar-actions">
        <button
          type="button"
          className="btn btn-primary navbar-add"
          onClick={onAddBook}
          aria-label="Add a new book"
        >
          Add book
        </button>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
        <div className="navbar-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className="navbar-profile-trigger"
            onClick={() => setProfileOpen((o) => !o)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label="Admin profile menu"
          >
            <span className="navbar-profile-avatar" aria-hidden="true">
              A
            </span>
            <span className="navbar-profile-label">Admin</span>
            <svg className="navbar-profile-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {profileOpen && (
            <div className="navbar-profile-dropdown" role="menu">
              <div className="navbar-profile-head">
                <span className="navbar-profile-dropdown-avatar">A</span>
                <div>
                  <span className="navbar-profile-name">Admin User</span>
                  <span className="navbar-profile-email">admin@dev.inc</span>
                </div>
              </div>
              <div className="navbar-profile-divider" />
              <a href="#" className="navbar-profile-item" role="menuitem">Profile</a>
              <a href="#" className="navbar-profile-item" role="menuitem">Settings</a>
              <div className="navbar-profile-divider" />
              <a href="#" className="navbar-profile-item navbar-profile-item--danger" role="menuitem">Log out</a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
