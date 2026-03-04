import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './authContext';

export default function ProtectedRoute() {
  const { autenticado, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="card px-6 py-4">Carregando...</div>
      </div>
    );
  }
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
