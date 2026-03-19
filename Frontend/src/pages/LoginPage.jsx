import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  }, [user, navigate]);

  const validate = () => {
    const e = email.trim().toLowerCase();
    if (!e) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(e)) return 'Enter a valid email';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const loggedInUser = await login({ email: email.trim().toLowerCase(), password });
      navigate(loggedInUser?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-page">
      <section className="catalog-section" aria-label="Login">
        <div className="catalog-section-intro">
          <h2 className="catalog-heading">Login</h2>
          <p className="catalog-intro">Access your dashboard to manage books.</p>
        </div>

        <form onSubmit={onSubmit} className="book-form" style={{ maxWidth: 520, margin: '0 auto' }}>
          {error && <p className="form-error">{error}</p>}
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />

          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Login'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

