import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ManageBooks } from './ManageBooks'

vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))
import { useAuth } from '../auth/AuthContext'

vi.mock('../components/AdminLayout', () => ({
  AdminLayout: ({ title, children }) => <div><h1>{title}</h1>{children}</div>,
}))

vi.mock('../components/BookFormModal', () => ({
  BookFormModal: () => null,
}))

vi.mock('../components/BookDetailsModal', () => ({
  BookDetailsModal: () => null,
}))

vi.mock('../lib/adminAudit', () => ({
  logAdminEvent: vi.fn(),
}))

vi.mock('motion/react', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => ({ children, ...rest }) => <div {...rest}>{children}</div>,
  }),
  AnimatePresence: ({ children }) => <>{children}</>,
}))

const mockAuthFetch = vi.fn()

const sampleBooks = [
  { _id: 'b1', title: 'Dune', author: 'Frank Herbert', genre: 'Sci-Fi', date: '1965-01-01', pageCount: 412 },
  { _id: 'b2', title: 'Foundation', author: 'Isaac Asimov', genre: 'Sci-Fi', date: '1951-01-01', pageCount: 255 },
]

function renderManageBooks() {
  return render(
    <MemoryRouter>
      <ManageBooks />
    </MemoryRouter>
  )
}

describe('ManageBooks', () => {
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

  it('renders the Manage Books heading', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderManageBooks()
    await waitFor(() => expect(screen.getByText('Manage Books')).toBeInTheDocument())
  })

  it('renders book titles after load', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve(sampleBooks) })
    renderManageBooks()
    await waitFor(() => expect(screen.getByText('Dune')).toBeInTheDocument())
    expect(screen.getByText('Foundation')).toBeInTheDocument()
  })

  it('shows empty state when no books', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderManageBooks()
    await waitFor(() => expect(screen.getByText('No books in the catalog yet.')).toBeInTheDocument())
  })

  it('shows book count in footer', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve(sampleBooks) })
    renderManageBooks()
    await waitFor(() => expect(screen.getByText(/Showing 2 of 2 books/)).toBeInTheDocument())
  })

  it('renders search input', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderManageBooks()
    await waitFor(() => expect(screen.getByPlaceholderText('Search title, author, genre...')).toBeInTheDocument())
  })

  it('renders Add book button', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderManageBooks()
    await waitFor(() => expect(screen.getByText('Add book')).toBeInTheDocument())
  })

  it('renders sort and filter dropdowns', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderManageBooks()
    await waitFor(() => expect(screen.getByText('Newest')).toBeInTheDocument())
    expect(screen.getByText('All dates')).toBeInTheDocument()
  })

  it('renders pagination controls', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve(sampleBooks) })
    renderManageBooks()
    await waitFor(() => expect(screen.getByText(/Page 1/)).toBeInTheDocument())
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('renders table column headers', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) })
    renderManageBooks()
    await waitFor(() => expect(screen.getByText('Title / Genre')).toBeInTheDocument())
    expect(screen.getAllByText('Author').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Pages')).toBeInTheDocument()
  })

  it('falls back to empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    renderManageBooks()
    await waitFor(() => expect(screen.getByText('No books in the catalog yet.')).toBeInTheDocument())
  })
})
