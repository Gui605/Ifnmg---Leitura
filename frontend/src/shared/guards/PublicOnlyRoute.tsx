//frontend/src/shared/guards/PublicOnlyRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, AuthLoadingScreen } from '../utils/authContext';

export function PublicOnlyRoute() {
  const { autenticado, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;

  if (autenticado) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
