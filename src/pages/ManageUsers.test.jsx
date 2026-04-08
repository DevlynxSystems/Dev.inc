import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ManageUsers } from './ManageUsers'

vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))
import { useAuth } from '../auth/AuthContext'

vi.mock('../components/AdminLayout', () => ({
  AdminLayout: ({ title, children }) => <div><h1>{title}</h1>{children}</div>,
}))

vi.mock('../lib/adminAudit', () => ({
  getAdminEvents: vi.fn(() => []),
  logAdminEvent: vi.fn(),
}))

vi.mock('motion/react', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => ({ children, ...rest }) => <div {...rest}>{children}</div>,
  }),
  AnimatePresence: ({ children }) => <>{children}</>,
}))

vi.mock('../components/BookFormModal.css', () => ({}))

const mockAuthFetch = vi.fn()

const sampleUsers = [
  { id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'user', createdAt: '2024-01-01' },
  { id: 'u2', name: 'Bob', email: 'bob@example.com', role: 'admin', createdAt: '2024-02-01' },
]

function renderManageUsers() {
  return render(
    <MemoryRouter>
      <ManageUsers />
    </MemoryRouter>
  )
}

function fetchOk(json) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(json) })
}

function fetchFail(json) {
  return Promise.resolve({ ok: false, json: () => Promise.resolve(json) })
}

describe('ManageUsers', () => {
  beforeEach(() => {
    let store = {}
    vi.stubGlobal('localStorage', {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = v },
      removeItem: (k) => { delete store[k] },
    })
    vi.clearAllMocks()
    useAuth.mockReturnValue({
      API_BASE_URL: 'http://localhost:5000',
      authFetch: mockAuthFetch,
    })
  })

  it('renders the Manage Users heading', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    renderManageUsers()
    await waitFor(() => expect(screen.getByText('Manage Users')).toBeInTheDocument())
  })

  it('shows loading state initially', () => {
    mockAuthFetch.mockReturnValue(new Promise(() => {}))
    const { container } = renderManageUsers()
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders user names after load', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: sampleUsers }))
    renderManageUsers()
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders user emails after load', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: sampleUsers }))
    renderManageUsers()
    await waitFor(() => expect(screen.getByText('alice@example.com')).toBeInTheDocument())
  })

  it('shows empty state when no users', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    renderManageUsers()
    await waitFor(() => expect(screen.getByText('No users found.')).toBeInTheDocument())
  })

  it('shows error message when fetch fails', async () => {
    mockAuthFetch.mockResolvedValue(fetchFail({ error: 'Unauthorized' }))
    renderManageUsers()
    await waitFor(() => expect(screen.getByText('Unauthorized')).toBeInTheDocument())
  })

  it('renders search input', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    renderManageUsers()
    await waitFor(() => expect(screen.getByPlaceholderText('Search by name, email, role...')).toBeInTheDocument())
  })

  it('renders invite email input', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    renderManageUsers()
    await waitFor(() => expect(screen.getByPlaceholderText('Invite by email')).toBeInTheDocument())
  })

  it('renders filter dropdowns', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    renderManageUsers()
    await waitFor(() => expect(screen.getByText('All roles')).toBeInTheDocument())
    expect(screen.getByText('All status')).toBeInTheDocument()
    expect(screen.getByText('All time')).toBeInTheDocument()
  })

  it('renders pagination controls', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: sampleUsers }))
    renderManageUsers()
    await waitFor(() => expect(screen.getByText(/Page 1/)).toBeInTheDocument())
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('shows user count in footer', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: sampleUsers }))
    renderManageUsers()
    await waitFor(() => expect(screen.getByText(/Showing 2 of 2 users/)).toBeInTheDocument())
  })

  it('renders table column headers', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    renderManageUsers()
    await waitFor(() => expect(screen.getAllByText('Name').length).toBeGreaterThanOrEqual(1))
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Joined')).toBeInTheDocument()
  })

  it('renders Refresh button', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    renderManageUsers()
    await waitFor(() => expect(screen.getByText('Refresh')).toBeInTheDocument())
  })

  it('renders Invite button', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    renderManageUsers()
    await waitFor(() => expect(screen.getByText('Invite')).toBeInTheDocument())
  })
})
