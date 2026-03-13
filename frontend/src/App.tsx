import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import Redefinir from './features/auth/Redefinir';
import Feed from './features/feed/Feed';
import { useAuth } from './shared/utils/authContext';
import { ProtectedRoute, PublicOnlyRoute } from './shared/guards';

export default function App() {
  const { autenticado, loading } = useAuth();

  if (loading) {
    return null; // Ou um splash screen global
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={autenticado ? '/dashboard' : '/login'} replace />} />
        
        {/* Rotas Públicas (Somente para não autenticados) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/redefinir-senha" element={<Redefinir />} />
        </Route>

        {/* Rotas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Feed />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
