import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import Redefinir from './features/auth/Redefinir';
import Feed from './features/feed/Feed';
import EscreverPost from './features/posts/EscreverPost';
import PerfilPage from './features/perfil/PerfilPage';
import { useAuth } from './shared/utils/authContext';
import { ProtectedRoute, PublicOnlyRoute } from './shared/guards';
import { ConfigPage } from './features/configuracoes/ConfigPage';
import { SubSeccionPerfil } from './features/configuracoes/SubSeccionPerfil';
import { SubSeccionSeguranca } from './features/configuracoes/SubSeccionSeguranca';
import { SubSeccionPrivacidade } from './features/configuracoes/SubSeccionPrivacidade';
import { ExplorarPage } from './features/explorar/ExplorarPage';

export default function App() {
  const { autenticado, loading } = useAuth();

  if (loading) {
    return null; // Ou um splash screen global
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={autenticado ? '/dashboard' : '/entrada'} replace />} />
        
        {/* Rotas Públicas (Somente para não autenticados) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Navigate to="/entrada" replace />} />
          <Route path="/entrada" element={<Login />}>
            <Route path="cadastro" element={<Login />} />
          </Route>
          <Route path="/redefinir-senha" element={<Redefinir />} />
        </Route>

        {/* Rotas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Feed />} />
          <Route path="/escrever" element={<EscreverPost />} />
          <Route path="/explorar" element={<ExplorarPage />} />
          <Route path="/perfil/me" element={<PerfilPage />} />
          <Route path="/perfil/:id" element={<PerfilPage />} />

          <Route path="/configuracoes" element={<ConfigPage />}>
            <Route index element={<Navigate to="perfil" replace />} />
            <Route path="perfil" element={<SubSeccionPerfil />} />
            <Route path="seguranca" element={<SubSeccionSeguranca />} />
            <Route path="privacidade" element={<SubSeccionPrivacidade />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
