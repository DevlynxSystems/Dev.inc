import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ProfilePage } from './ProfilePage'

vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))
import { useAuth } from '../auth/AuthContext'

vi.mock('motion/react', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => ({ children, ...rest }) => <div {...rest}>{children}</div>,
  }),
  AnimatePresence: ({ children }) => <>{children}</>,
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockUpdateProfile = vi.fn()

const sampleUser = {
  name: 'Alice',
  email: 'alice@example.com',
  phone: '5551234567',
  address: { line1: '123 Main St', city: 'Toronto', country: 'Canada' },
}

function renderProfile() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({
      user: sampleUser,
      updateProfile: mockUpdateProfile,
      loading: false,
    })
  })

  it('shows loading state when auth is loading', () => {
    useAuth.mockReturnValue({ user: null, updateProfile: mockUpdateProfile, loading: true })
    const { container } = renderProfile()
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders the Complete your profile heading', () => {
    renderProfile()
    expect(screen.getByText('Complete your profile')).toBeInTheDocument()
  })

  it('renders step indicators', () => {
    renderProfile()
    expect(screen.getByText('Basic info')).toBeInTheDocument()
    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
  })

  it('renders name input prefilled with user name', () => {
    renderProfile()
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
  })

  it('renders Skip for now button', () => {
    renderProfile()
    expect(screen.getByText('Skip for now')).toBeInTheDocument()
  })

  it('renders Continue button on first step', () => {
    renderProfile()
    expect(screen.getByText('Continue')).toBeInTheDocument()
  })

  it('navigates to dashboard when Skip for now is clicked', async () => {
    renderProfile()
    await userEvent.click(screen.getByText('Skip for now'))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('advances to step 2 when Continue is clicked', async () => {
    renderProfile()
    await userEvent.click(screen.getByText('Continue'))
    await waitFor(() => expect(screen.getByText('Address line 1')).toBeInTheDocument())
  })

  it('shows Back button on step 2', async () => {
    renderProfile()
    await userEvent.click(screen.getByText('Continue'))
    await waitFor(() => expect(screen.getByText('Back')).toBeInTheDocument())
  })

  it('goes back to step 1 when Back is clicked', async () => {
    renderProfile()
    await userEvent.click(screen.getByText('Continue'))
    await waitFor(() => screen.getByText('Back'))
    await userEvent.click(screen.getByText('Back'))
    await waitFor(() => expect(screen.getByText('Continue')).toBeInTheDocument())
  })

  it('shows Save Profile button on last step', async () => {
    renderProfile()
    await userEvent.click(screen.getByText('Continue'))
    await waitFor(() => screen.getByText('Continue'))
    await userEvent.click(screen.getByText('Continue'))
    await waitFor(() => expect(screen.getByText('Save Profile')).toBeInTheDocument())
  })

  it('calls updateProfile and navigates to dashboard on save', async () => {
    mockUpdateProfile.mockResolvedValue({})
    renderProfile()
    await userEvent.click(screen.getByText('Continue'))
    await waitFor(() => screen.getByText('Continue'))
    await userEvent.click(screen.getByText('Continue'))
    await waitFor(() => screen.getByText('Save Profile'))
    await userEvent.click(screen.getByText('Save Profile'))
    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalled())
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('shows error when updateProfile fails', async () => {
    mockUpdateProfile.mockRejectedValue(new Error('Update failed'))
    renderProfile()
    await userEvent.click(screen.getByText('Continue'))
    await waitFor(() => screen.getByText('Continue'))
    await userEvent.click(screen.getByText('Continue'))
    await waitFor(() => screen.getByText('Save Profile'))
    await userEvent.click(screen.getByText('Save Profile'))
    await waitFor(() => expect(screen.getByText('Update failed')).toBeInTheDocument())
  })
})
