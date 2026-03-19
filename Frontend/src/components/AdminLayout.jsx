import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import './AdminLayout.css'

export function AdminLayout({ title, children }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const doLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" aria-label="Admin sidebar">
        <div className="admin-sidebar-head">
          <span className="admin-sidebar-title">Admin</span>
          <span className="admin-sidebar-subtitle">Dev.inc Book Catalog</span>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'is-active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link ${isActive ? 'is-active' : ''}`}>
            Users
          </NavLink>
          <NavLink to="/admin/books" className={({ isActive }) => `admin-nav-link ${isActive ? 'is-active' : ''}`}>
            Books
          </NavLink>
          <button type="button" className="admin-nav-link admin-nav-link--danger" onClick={doLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <section className="admin-main" aria-label="Admin content">
        <header className="admin-main-head">
          <h2 className="admin-main-title">{title}</h2>
        </header>
        <div className="admin-main-body">{children}</div>
      </section>
    </div>
  )
}

