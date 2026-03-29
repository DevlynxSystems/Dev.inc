import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LandingPage } from './LandingPage'

vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))
import { useAuth } from '../auth/AuthContext'

vi.mock('motion/react', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => ({ children, ...rest }) => <div {...rest}>{children}</div>,
  }),
}))

vi.mock('../components/BookDetailsModal', () => ({
  BookDetailsModal: () => null,
}))

vi.mock('../data/books', () => ({
  sampleBooks: [
    { id: 'sb1', title: 'Sample Book', author: 'Sample Author', genre: 'Fiction', year: '2020', pages: 300 },
  ],
}))

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  )
}

describe('LandingPage', () => {
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
      user: null,
    })
  })

  it('renders the main heading', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderLanding()
    await waitFor(() => expect(screen.getByText(/Discover your next great read/)).toBeInTheDocument())
  })

  it('renders Browse Books button', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderLanding()
    await waitFor(() => expect(screen.getByText('Browse Books')).toBeInTheDocument())
  })

  it('shows Create Account button when user is not logged in', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderLanding()
    await waitFor(() => expect(screen.getByText('Create Account')).toBeInTheDocument())
  })

  it('shows Dashboard button for regular users', async () => {
    useAuth.mockReturnValue({ API_BASE_URL: 'http://localhost:5000', user: { role: 'user' } })
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderLanding()
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
  })

  it('shows Admin Dashboard button for admin users', async () => {
    useAuth.mockReturnValue({ API_BASE_URL: 'http://localhost:5000', user: { role: 'admin' } })
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderLanding()
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument())
  })

  it('does not show Create Account button when logged in', async () => {
    useAuth.mockReturnValue({ API_BASE_URL: 'http://localhost:5000', user: { role: 'user' } })
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderLanding()
    await waitFor(() => expect(screen.queryByText('Create Account')).not.toBeInTheDocument())
  })

  it('renders featured books from API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([
        { _id: 'b1', title: 'Dune', author: 'Frank Herbert', genre: 'Sci-Fi', date: '1965-01-01' },
      ]),
    })
    renderLanding()
    await waitFor(() => expect(screen.getByText('Dune')).toBeInTheDocument())
  })

  it('falls back to sample books when API returns empty', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderLanding()
    await waitFor(() => expect(screen.getByText('Sample Book')).toBeInTheDocument())
  })

  it('falls back to sample books when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    renderLanding()
    await waitFor(() => expect(screen.getByText('Sample Book')).toBeInTheDocument())
  })

  it('renders overview feature titles', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderLanding()
    await waitFor(() => expect(screen.getByText('Browse & search')).toBeInTheDocument())
    expect(screen.getAllByText('View details').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Role-based access').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the how-to steps', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderLanding()
    await waitFor(() => expect(screen.getByText('Explore')).toBeInTheDocument())
    expect(screen.getByText('Inspect')).toBeInTheDocument()
    expect(screen.getByText('Organize')).toBeInTheDocument()
  })
})
