import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, AuthLoadingScreen } from '../utils/authContext';

export function ProtectedRoute() {
  const { autenticado, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!autenticado) return <Navigate to="/login" replace />;
  return <Outlet />;
}
