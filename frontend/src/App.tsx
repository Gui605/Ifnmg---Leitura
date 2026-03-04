import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import Redefinir from './features/auth/Redefinir';
import Dashboard from './features/dashboard/Dashboard';
import { useAuth } from './shared/utils/authContext';
import ProtectedRoute from './shared/utils/ProtectedRoute';

export default function App() {
  const { autenticado } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={autenticado ? '/dashboard' : '/login'} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/redefinir-senha" element={<Redefinir />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
