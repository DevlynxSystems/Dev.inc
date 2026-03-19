import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, loading } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [line1, setLine1] = useState(user?.address?.line1 || '');
  const [line2, setLine2] = useState(user?.address?.line2 || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');
  const [country, setCountry] = useState(user?.address?.country || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const nextName = name.trim();
    if (!nextName) return 'Name cannot be empty';
    if (phone && phone.trim().length < 7) return 'Enter a valid phone number';
    if (password || confirmPassword) {
      if (!password) return 'Enter a new password';
      if (password.length < 6) return 'Password must be at least 6 characters';
      if (password !== confirmPassword) return 'Passwords do not match';
    }
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await updateProfile({
        name: name.trim(),
        password: password || undefined,
        phone: phone.trim(),
        address: {
          line1: line1.trim(),
          line2: line2.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="catalog-section">
        <div className="catalog-section-intro">
          <h2 className="catalog-heading">Profile</h2>
          <p className="catalog-intro">Loading…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="catalog-section" aria-label="Profile setup">
      <div className="catalog-section-intro">
        <h2 className="catalog-heading">Profile setup</h2>
        <p className="catalog-intro">Add your phone number, address, and update your profile details.</p>
      </div>

      <form className="book-form" onSubmit={onSubmit} style={{ maxWidth: 520, margin: '0 auto' }}>
        {error && <p className="form-error">{error}</p>}

        <label htmlFor="profile-name">Name</label>
        <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />

        <label htmlFor="profile-email">Email</label>
        <input id="profile-email" type="email" value={user?.email || ''} disabled />

        <label htmlFor="profile-phone">Phone</label>
        <input
          id="profile-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. +1 555 123 4567"
          autoComplete="tel"
        />

        <label htmlFor="profile-line1">Address line 1</label>
        <input id="profile-line1" type="text" value={line1} onChange={(e) => setLine1(e.target.value)} autoComplete="address-line1" />

        <label htmlFor="profile-line2">Address line 2</label>
        <input id="profile-line2" type="text" value={line2} onChange={(e) => setLine2(e.target.value)} autoComplete="address-line2" />

        <label htmlFor="profile-city">City</label>
        <input id="profile-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />

        <label htmlFor="profile-state">State / Province</label>
        <input id="profile-state" type="text" value={state} onChange={(e) => setState(e.target.value)} autoComplete="address-level1" />

        <label htmlFor="profile-postal">Postal code</label>
        <input id="profile-postal" type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} autoComplete="postal-code" />

        <label htmlFor="profile-country">Country</label>
        <input id="profile-country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country" />

        <label htmlFor="profile-password">New password (optional)</label>
        <input id="profile-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />

        <label htmlFor="profile-password-confirm">Confirm new password</label>
        <input
          id="profile-password-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </section>
  );
}

