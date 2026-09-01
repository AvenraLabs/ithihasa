import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentAdmin } from '../api/auth.js';

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('ithihasa_admin_token');
  const isAuthenticated = localStorage.getItem('ithihasa_admin_authenticated') === 'true';
  const adminUser = getCurrentAdmin();

  // If no valid auth token or user session is found, redirect to /login
  if (!token || !isAuthenticated || !adminUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
