import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AuthLoadingSkeleton } from './Skeleton';

/**
 * Route guard for authenticated screens with optional admin-only enforcement.
 * Redirects unauthenticated users to login and non-admin users away from admin routes.
 * @param {{ children: React.ReactNode, requireAdmin?: boolean }} props
 * @returns {JSX.Element}
 */
export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingSkeleton />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

