import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SignupPage } from './SignupPage'

vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))
import { useAuth } from '../auth/AuthContext'

vi.mock('@/components/ui/modern-animated-sign-in', () => ({
  Ripple: () => null,
  TechOrbitDisplay: () => null,
  AuthTabs: ({ formFields, handleSubmit, goTo }) => (
    <div>
      <h2>{formFields.header}</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Enter your name" onChange={formFields.fields[0].onChange} />
        <input type="email" placeholder="Enter your email address" onChange={formFields.fields[1].onChange} />
        <input type="password" placeholder="Create a password (6+ chars)" onChange={formFields.fields[2].onChange} />
        <button type="submit">{formFields.submitButton}</button>
        <button type="button" onClick={goTo}>{formFields.textVariantButton}</button>
      </form>
    </div>
  ),
}))

const mockSignup = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderSignup() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>
  )
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ user: null, signup: mockSignup })
  })

  it('renders the Create your account heading', () => {
    renderSignup()
    expect(screen.getByText('Create your account')).toBeInTheDocument()
  })

  it('renders name, email and password inputs', () => {
    renderSignup()
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Create a password (6+ chars)')).toBeInTheDocument()
  })

  it('renders the Create account button', () => {
    renderSignup()
    expect(screen.getByText('Create account')).toBeInTheDocument()
  })

  it('renders the login link button', () => {
    renderSignup()
    expect(screen.getByText('Already have an account? Login')).toBeInTheDocument()
  })

  it('calls signup with name, email and password on submit', async () => {
    mockSignup.mockResolvedValue({ role: 'user' })
    renderSignup()

    await userEvent.type(screen.getByPlaceholderText('Enter your name'), 'Alice')
    await userEvent.type(screen.getByPlaceholderText('Enter your email address'), 'alice@example.com')
    await userEvent.type(screen.getByPlaceholderText('Create a password (6+ chars)'), 'password123')
    await userEvent.click(screen.getByText('Create account'))

    await waitFor(() => expect(mockSignup).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    }))
  })

  it('navigates to /dashboard for regular user after signup', async () => {
    mockSignup.mockResolvedValue({ role: 'user' })
    renderSignup()

    await userEvent.type(screen.getByPlaceholderText('Enter your name'), 'Alice')
    await userEvent.type(screen.getByPlaceholderText('Enter your email address'), 'alice@example.com')
    await userEvent.type(screen.getByPlaceholderText('Create a password (6+ chars)'), 'password123')
    await userEvent.click(screen.getByText('Create account'))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true }))
  })

  it('shows error message when signup fails', async () => {
    mockSignup.mockRejectedValue(new Error('Email already in use'))
    renderSignup()

    await userEvent.type(screen.getByPlaceholderText('Enter your name'), 'Alice')
    await userEvent.type(screen.getByPlaceholderText('Enter your email address'), 'alice@example.com')
    await userEvent.type(screen.getByPlaceholderText('Create a password (6+ chars)'), 'password123')
    await userEvent.click(screen.getByText('Create account'))

    await waitFor(() => expect(screen.getByText('Email already in use')).toBeInTheDocument())
  })

  it('redirects already logged in user to dashboard', () => {
    useAuth.mockReturnValue({ user: { role: 'user' }, signup: mockSignup })
    renderSignup()
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  it('redirects already logged in admin to /admin', () => {
    useAuth.mockReturnValue({ user: { role: 'admin' }, signup: mockSignup })
    renderSignup()
    expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true })
  })
})
