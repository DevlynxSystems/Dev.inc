import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const TOKEN_STORAGE_KEY = 'devinc_auth_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_STORAGE_KEY));
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMe() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Unauthorized');

        const data = await res.json();
        setUser(data.user || null);
      } catch (err) {
        // Token is invalid/expired: clear it and treat as logged out.
        setToken(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadMe();
  }, [token]);

  const login = async ({ email, password }) => {
    setError('');
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Failed to log in');
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(data.user || null);
    return data.user;
  };

  const signup = async ({ name, email, password, role }) => {
    setError('');
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sign up');
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(data.user || null);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const authFetch = useMemo(() => {
    return (url, options = {}) => {
      const opts = { ...options };
      opts.headers = { ...(opts.headers || {}) };
      if (token) opts.headers.Authorization = `Bearer ${token}`;
      return fetch(url, opts);
    };
  }, [token]);

  const updateProfile = async ({ name, password, phone, address }) => {
    const res = await authFetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password, phone, address }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');

    setUser(data.user || null);
    return data.user;
  };

  const value = {
    token,
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    authFetch,
    API_BASE_URL,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

