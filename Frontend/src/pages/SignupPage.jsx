import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function SignupPage() {
  const navigate = useNavigate();
  const { user, signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  }, [user, navigate]);

  const validate = () => {
    if (!name.trim()) return 'Name is required';
    const e = email.trim().toLowerCase();
    if (!e) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(e)) return 'Enter a valid email';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!['user', 'admin'].includes(role)) return 'Invalid role';
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
      const createdUser = await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      navigate(createdUser?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-page">
      <section className="catalog-section" aria-label="Signup">
        <div className="catalog-section-intro">
          <h2 className="catalog-heading">Signup</h2>
          <p className="catalog-intro">Create your account to view your catalog.</p>
        </div>

        <form onSubmit={onSubmit} className="book-form" style={{ maxWidth: 520, margin: '0 auto' }}>
          {error && <p className="form-error">{error}</p>}

          <label htmlFor="signup-name">Name</label>
          <input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />

          <label htmlFor="signup-email">Email</label>
          <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />

          <label htmlFor="signup-password">Password</label>
          <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />

          <label htmlFor="signup-role">Role</label>
          <select id="signup-role" value={role} onChange={(e) => setRole(e.target.value)} className="catalog-filter-select" style={{ marginBottom: '1.1rem' }}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

