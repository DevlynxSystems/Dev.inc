/*
Unit tests for AdminDashboard.jsx
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AdminDashboard } from './AdminDashboard'


vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))
import { useAuth } from '../auth/AuthContext'


vi.mock('../lib/adminAudit', () => ({
  getAdminEvents: vi.fn(() => []),
  exportAdminEventsCsv: vi.fn(),
}))
import { getAdminEvents } from '../lib/adminAudit'


vi.mock('../components/AdminLayout', () => ({
  AdminLayout: ({ title, children }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))


vi.mock('motion/react', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => ({ children, ...rest }) => <div {...rest}>{children}</div>,
  }),
}))


vi.mock('recharts', () => ({
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}))



const mockAuthFetch = vi.fn()


function renderDashboard() {
  return render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  )
}


function fetchOk(json) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(json),
  })
}

// Tests

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({
      API_BASE_URL: 'http://localhost:5000',
      authFetch: mockAuthFetch,
    })
    getAdminEvents.mockReturnValue([])
  })

  //Loading state

  it('shows loading placeholders while data is being fetched', () => {
    // Never resolve so we stay in loading state
    mockAuthFetch.mockReturnValue(new Promise(() => {}))
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))

    renderDashboard()

    // Summary cards show "—" when loading
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(4)
  })

  //Summary cards

  it('displays correct user and book counts after data loads', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({
      users: [
        { id: '1', name: 'Alice', role: 'user', createdAt: '2024-01-01' },
        { id: '2', name: 'Bob',   role: 'admin', createdAt: '2024-02-01' },
      ],
    }))
    global.fetch = vi.fn().mockResolvedValue(fetchOk([
      { _id: 'b1', title: 'Dune', author: 'Frank Herbert', date: '2024-01-01' },
    ]))

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument() // total users
    })
    const ones = screen.getAllByText('1')
    expect(ones.length).toBeGreaterThanOrEqual(1)
  })

  //Empty states

  it('shows "No users yet." when users list is empty', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    global.fetch = vi.fn().mockResolvedValue(fetchOk([]))

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('No users yet.')).toBeInTheDocument()
    })
  })

  it('shows "No books yet." when books list is empty', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    global.fetch = vi.fn().mockResolvedValue(fetchOk([]))

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('No books yet.')).toBeInTheDocument()
    })
  })

  it('shows "No audit events yet." when there are no audit events', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    global.fetch = vi.fn().mockResolvedValue(fetchOk([]))
    getAdminEvents.mockReturnValue([])

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('No audit events yet.')).toBeInTheDocument()
    })
  })

  // Data renders 

  it('renders recent user names after load', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({
      users: [{ id: '1', name: 'Alice', role: 'user', createdAt: '2024-01-01' }],
    }))
    global.fetch = vi.fn().mockResolvedValue(fetchOk([]))

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
  })

  it('renders recent book titles after load', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    global.fetch = vi.fn().mockResolvedValue(fetchOk([
      { _id: 'b1', title: 'Dune', author: 'Frank Herbert', date: '2024-01-01' },
    ]))

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Dune')).toBeInTheDocument()
    })
  })

  it('renders audit events in the activity feed', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    global.fetch = vi.fn().mockResolvedValue(fetchOk([]))
    getAdminEvents.mockReturnValue([
      { id: 'e1', message: 'Admin logged in', at: new Date().toISOString() },
    ])

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Admin logged in')).toBeInTheDocument()
    })
  })

  // Error / network failure

  it('falls back to empty state when API calls fail', async () => {
    mockAuthFetch.mockRejectedValue(new Error('Network error'))
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('No users yet.')).toBeInTheDocument()
      expect(screen.getByText('No books yet.')).toBeInTheDocument()
    })
  })

  //Navigation links 

  it('renders "Add / manage users" quick action link', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    global.fetch = vi.fn().mockResolvedValue(fetchOk([]))

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Add / manage users')).toBeInTheDocument()
    })
  })

  it('renders "Add / manage books" quick action link', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    global.fetch = vi.fn().mockResolvedValue(fetchOk([]))

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Add / manage books')).toBeInTheDocument()
    })
  })


  it('renders the analytics chart area', async () => {
    mockAuthFetch.mockResolvedValue(fetchOk({ users: [] }))
    global.fetch = vi.fn().mockResolvedValue(fetchOk([]))

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })
  })
})
