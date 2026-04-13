import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './lib/a11yHooks'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { ProtectedRoute } from './components/ProtectedRoute'

import { LandingPage } from './pages/LandingPage'
import { CatalogPage } from './pages/CatalogPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { UserDashboard } from './pages/UserDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { ProfilePage } from './pages/ProfilePage'
import { ManageUsers } from './pages/ManageUsers'
import { AdminUserProfile } from './pages/AdminUserProfile'
import { ManageBooks } from './pages/ManageBooks'
import { Analytics } from '@vercel/analytics/react'
import './App.css'

export default function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [location.pathname, prefersReducedMotion])

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main id="main-content" className="main home-page" tabIndex={-1}>
        <div className="page-transition" key={location.pathname}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/catalog" element={<CatalogPage searchQuery={searchQuery} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute requireAdmin>
                  <ManageBooks />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <Footer />

      <Analytics />
    </div>
  )
}
