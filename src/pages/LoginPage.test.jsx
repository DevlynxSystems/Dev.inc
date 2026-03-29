// npm install @testing-library/user-event
// you have to install this as well ^^^

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from './LoginPage'

vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))
import { useAuth } from '../auth/AuthContext'

vi.mock('motion/react', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => ({ children, ...rest }) => <div {...rest}>{children}</div>,
  }),
  useAnimation: () => ({ start: vi.fn() }),
  useInView: () => true,
  useMotionTemplate: () => '',
  useMotionValue: () => ({ set: vi.fn() }),
}))

vi.mock('@/components/ui/modern-animated-sign-in', () => ({
  Ripple: () => null,
  TechOrbitDisplay: () => null,
  AuthTabs: ({ formFields, handleSubmit, goTo }) => (
    <div>
      <h2>{formFields.header}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email address"
          onChange={formFields.fields[0].onChange}
        />
        <input
          type="password"
          placeholder="Enter your password"
          onChange={formFields.fields[1].onChange}
        />
        <button type="submit">{formFields.submitButton}</button>
        <button type="button" onClick={goTo}>{formFields.textVariantButton}</button>
      </form>
    </div>
  ),
}))

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({
      user: null,
      login: mockLogin,
    })
  })

  it('renders the Welcome back heading', () => {
    renderLogin()
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
  })

  it('renders the Sign in button', () => {
    renderLogin()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('renders the Create an account button', () => {
    renderLogin()
    expect(screen.getByText('Create an account')).toBeInTheDocument()
  })

  it('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValue({ role: 'user' })
    renderLogin()

    await userEvent.type(screen.getByPlaceholderText('Enter your email address'), 'alice@example.com')
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'password123')
    await userEvent.click(screen.getByText('Sign in'))

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'password123',
    }))
  })

  it('navigates to /dashboard for regular user after login', async () => {
    mockLogin.mockResolvedValue({ role: 'user' })
    renderLogin()

    await userEvent.type(screen.getByPlaceholderText('Enter your email address'), 'alice@example.com')
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'password123')
    await userEvent.click(screen.getByText('Sign in'))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true }))
  })

  it('navigates to /admin for admin user after login', async () => {
    mockLogin.mockResolvedValue({ role: 'admin' })
    renderLogin()

    await userEvent.type(screen.getByPlaceholderText('Enter your email address'), 'admin@example.com')
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'password123')
    await userEvent.click(screen.getByText('Sign in'))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true }))
  })

  it('shows error message when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'))
    renderLogin()

    await userEvent.type(screen.getByPlaceholderText('Enter your email address'), 'wrong@example.com')
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'wrongpass')
    await userEvent.click(screen.getByText('Sign in'))

    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument())
  })

  it('redirects already logged in user to dashboard', () => {
    useAuth.mockReturnValue({ user: { role: 'user' }, login: mockLogin })
    renderLogin()
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  it('redirects already logged in admin to /admin', () => {
    useAuth.mockReturnValue({ user: { role: 'admin' }, login: mockLogin })
    renderLogin()
    expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true })
  })
})
