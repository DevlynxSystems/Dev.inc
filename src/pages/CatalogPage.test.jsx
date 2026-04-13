import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CatalogPage } from './CatalogPage'

vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))
import { useAuth } from '../auth/AuthContext'

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }) => <>{children}</>,
  motion: new Proxy({}, {
    get: (_, tag) => ({ children, ...rest }) => <div {...rest}>{children}</div>,
  }),
}))

vi.mock('../components/BookDetailsModal', () => ({
  BookDetailsModal: () => null,
}))

vi.mock('../components/BookFormModal', () => ({
  BookFormModal: () => null,
}))

vi.mock('../components/CatalogFilters', () => ({
  DATE_FILTER_OPTIONS: [{ value: 'all', label: 'All' }],
  SORT_OPTIONS: [{ value: 'newest', label: 'Newest' }],
  filterByDateFilter: (books) => books,
  filterByGenre: (books) => books,
  sortBooks: (books) => books,
}))

const mockAuthFetch = vi.fn()

const sampleBooks = [
  { _id: 'b1', title: 'Dune', author: 'Frank Herbert', genre: 'Sci-Fi', date: '1965-01-01', pageCount: 412 },
  { _id: 'b2', title: 'Foundation', author: 'Isaac Asimov', genre: 'Sci-Fi', date: '1951-01-01', pageCount: 255 },
]

function renderCatalog(props = {}) {
  return render(
    <MemoryRouter>
      <CatalogPage {...props} />
    </MemoryRouter>
  )
}

describe('CatalogPage', () => {
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
      authFetch: mockAuthFetch,
    })
  })

  it('shows welcome message with user first name', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(sampleBooks),
    })
    renderCatalog()
    await waitFor(() => expect(screen.getByText(/Welcome back, Alice/)).toBeInTheDocument())
  })

  it('shows book count after load', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(sampleBooks),
    })
    renderCatalog()
    await waitFor(() => expect(screen.getByText(/2 books ready to explore/)).toBeInTheDocument())
  })

  it('renders book titles after load', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(sampleBooks),
    })
    renderCatalog()
    await waitFor(() => expect(screen.getByText('Dune')).toBeInTheDocument())
    expect(screen.getByText('Foundation')).toBeInTheDocument()
  })

  it('shows empty library message when no books', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([]),
    })
    renderCatalog()
    await waitFor(() => expect(screen.getByText('Your library is empty.')).toBeInTheDocument())
  })

  it('shows ask admin message for regular user when library is empty', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([]),
    })
    renderCatalog()
    await waitFor(() => expect(screen.getByText(/Ask an admin to add books/)).toBeInTheDocument())
  })

  it('shows Add book button for admin users', async () => {
    useAuth.mockReturnValue({
      user: { name: 'Bob', role: 'admin' },
      API_BASE_URL: 'http://localhost:5000',
      authFetch: mockAuthFetch,
    })
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(sampleBooks),
    })
    renderCatalog()
    await waitFor(() => expect(screen.getByText('Add book')).toBeInTheDocument())
  })

  it('does not show Add book button for regular users', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(sampleBooks),
    })
    renderCatalog()
    await waitFor(() => expect(screen.queryByText('Add book')).not.toBeInTheDocument())
  })

  it('shows search input', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([]),
    })
    renderCatalog()
    await waitFor(() => expect(screen.getByPlaceholderText('Search your library...')).toBeInTheDocument())
  })

  it('falls back to empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    renderCatalog()
    await waitFor(() => expect(screen.getByText('Your library is empty.')).toBeInTheDocument())
  })
})
