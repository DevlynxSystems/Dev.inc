import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AdminUserProfile } from './AdminUserProfile'

vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))
import { useAuth } from '../auth/AuthContext'

vi.mock('../components/AdminLayout', () => ({
  AdminLayout: ({ title, children }) => <div><h1>{title}</h1>{children}</div>,
}))

const mockAuthFetch = vi.fn()

function renderProfile(id = 'user-1') {
  return render(
    <MemoryRouter initialEntries={[`/admin/users/${id}`]}>
      <Routes>
        <Route path="/admin/users/:id" element={<AdminUserProfile />} />
        <Route path="/admin/users" element={<div>Users List</div>} />
      </Routes>
    </MemoryRouter>
  )
}

function fetchOk(json) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(json) })
}

function fetchFail(json) {
  return Promise.resolve({ ok: false, json: () => Promise.resolve(json) })
}

const sampleUser = {
  name: 'Alice',
  email: 'alice@example.com',
  role: 'user',
  createdAt: '2024-01-15T00:00:00Z',
  phone: '555-1234',
  address: { line1: '123 Main St', city: 'Toronto', country: 'Canada' },
}

describe('AdminUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({
      API_BASE_URL: 'http://localhost:5000',
      authFetch: mockAuthFetch,
    })
  })

  it('shows skeleton while fetching', () => {
    mockAuthFetch.mockReturnValue(new Promise(() => {}))
    const { container } = renderProfile()
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders user name and email after load', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ user: sampleUser }))
    renderProfile()
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })

  it('renders user role', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ user: sampleUser }))
    renderProfile()
    await waitFor(() => expect(screen.getByText('user')).toBeInTheDocument())
  })

  it('renders user phone', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ user: sampleUser }))
    renderProfile()
    await waitFor(() => expect(screen.getByText('555-1234')).toBeInTheDocument())
  })

  it('renders address fields', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ user: sampleUser }))
    renderProfile()
    await waitFor(() => expect(screen.getByText(/123 Main St/)).toBeInTheDocument())
  })

  it('shows "User not found." when API returns no user', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ user: null }))
    renderProfile()
    await waitFor(() => expect(screen.getByText('User not found.')).toBeInTheDocument())
  })

  it('shows error message when API call fails', async () => {
    mockAuthFetch.mockResolvedValue(fetchFail({ error: 'Not authorized' }))
    renderProfile()
    await waitFor(() => expect(screen.getByText('Not authorized')).toBeInTheDocument())
  })

  it('shows back to users link', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ user: sampleUser }))
    renderProfile()
    await waitFor(() => expect(screen.getByText('Back to users')).toBeInTheDocument())
  })
})
