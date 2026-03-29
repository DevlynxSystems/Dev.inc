import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UserDashboard } from './UserDashboard'

vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))
import { useAuth } from '../auth/AuthContext'

vi.mock('motion/react', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => ({ children, ...rest }) => <div {...rest}>{children}</div>,
  }),
  AnimatePresence: ({ children }) => <>{children}</>,
}))

vi.mock('../components/BookDetailsModal', () => ({
  BookDetailsModal: () => null,
}))

vi.mock('../data/books', () => ({
  sampleBooks: [
    { id: 'sb1', title: 'Sample Book', author: 'Sample Author', genre: 'Fiction', year: '2020', pageCount: 300 },
    { id: 'sb2', title: 'Another Book', author: 'Another Author', genre: 'Mystery', year: '2019', pageCount: 250 },
    { id: 'sb3', title: 'Third Book', author: 'Third Author', genre: 'Sci-Fi', year: '2018', pageCount: 400 },
  ],
}))

function renderDashboard() {
  return render(
    <MemoryRouter>
      <UserDashboard />
    </MemoryRouter>
  )
}

describe('UserDashboard', () => {
  beforeEach(() => {
    let store = {}
    vi.stubGlobal('localStorage', {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = v },
      removeItem: (k) => { delete store[k] },
    })
    vi.clearAllMocks()
    useAuth.mockReturnValue({
      user: { name: 'Alice', role: 'user' },
      API_BASE_URL: 'http://localhost:5000',
    })
  })

  it('renders welcome message with user first name', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderDashboard()
    await waitFor(() => expect(screen.getByText(/Welcome back, Alice/)).toBeInTheDocument())
  })

  it('renders stat labels', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderDashboard()
    await waitFor(() => expect(screen.getByText('Books read')).toBeInTheDocument())
    expect(screen.getByText('Currently reading')).toBeInTheDocument()
    expect(screen.getAllByText('Wishlist').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Reading streak')).toBeInTheDocument()
  })

  it('renders section headings', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderDashboard()
    await waitFor(() => expect(screen.getByText('Continue Reading')).toBeInTheDocument())
    expect(screen.getByText('Recommended for You')).toBeInTheDocument()
    expect(screen.getByText('Recently Viewed')).toBeInTheDocument()
  })

  it('renders wishlist section', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderDashboard()
    await waitFor(() => expect(screen.getByText('Books you saved for later')).toBeInTheDocument())
  })

  it('shows empty wishlist message when wishlist is empty', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderDashboard()
    await waitFor(() => expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument())
  })

  it('renders Browse Books and Update Profile links', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderDashboard()
    await waitFor(() => expect(screen.getByText('Browse Books')).toBeInTheDocument())
    expect(screen.getByText('Update Profile')).toBeInTheDocument()
  })

  it('falls back to sample books when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    renderDashboard()
    await waitFor(() => expect(screen.getAllByText('Sample Book').length).toBeGreaterThanOrEqual(1))
  })

  it('renders sample books from API when available', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([
        { _id: 'b1', title: 'Dune', author: 'Frank Herbert', genre: 'Sci-Fi' },
        { _id: 'b2', title: 'Foundation', author: 'Isaac Asimov', genre: 'Sci-Fi' },
        { _id: 'b3', title: 'Neuromancer', author: 'William Gibson', genre: 'Sci-Fi' },
      ]),
    })
    renderDashboard()
    await waitFor(() => expect(screen.getAllByText('Dune').length).toBeGreaterThanOrEqual(1))
  })

  it('renders Continue reading section with a book title', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderDashboard()
    await waitFor(() => expect(screen.getByText('Continue reading')).toBeInTheDocument())
  })
})
