/**
 * Unit tests — IDs UT-33–UT-36.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../auth/AuthContext'

function Child() {
  return <div data-testid="protected-child">Secret</div>
}

describe('ProtectedRoute', () => {
  it('UT-33-CB: loading state', () => {
    useAuth.mockReturnValue({ user: null, loading: true })
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <Child />
        </ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('UT-34-OB: unauthenticated redirects to login', () => {
    useAuth.mockReturnValue({ user: null, loading: false })
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Child />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('UT-35-OB: authenticated user sees children', () => {
    useAuth.mockReturnValue({
      user: { id: '1', role: 'user' },
      loading: false,
    })
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <Child />
        </ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByTestId('protected-child')).toBeInTheDocument()
  })

  it('UT-36-CB: requireAdmin redirects non-admin to dashboard', () => {
    useAuth.mockReturnValue({
      user: { id: '1', role: 'user' },
      loading: false,
    })
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <Child />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<div>User Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('User Dashboard')).toBeInTheDocument()
  })
})
