import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storageGet, storageRemove, storageSet } from './storage';
import { Notificacao } from './Notificacao';
import { fazerLogout, logoutLocal } from '../services/auth.service';
import { getMeuPerfil } from '../services/perfil.service';
import { PerfilResumo } from '../types/perfil.types';

type AuthContextValue = {
  token: string | null;
  autenticado: boolean;
  loading: boolean;
  perfil: PerfilResumo | null;
  setPerfil: React.Dispatch<React.SetStateAction<PerfilResumo | null>>;
  setSession: (token: string, ttlSeconds?: number) => void;
  logout: (silencioso?: boolean) => void;
};

const TOKEN_KEY = 'auth-token';
const AuthContext = createContext<AuthContextValue | null>(null);

// Decodificador simplificado de JWT para extração de claims
// Evita dependências externas mantendo a rigidez de contrato.
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Valida se o token existe e não está expirado
function getValidToken(): string | null {
  const t = storageGet<string>(TOKEN_KEY);
  if (!t) return null;

  const payload = parseJwt(t);
  if (!payload || !payload.exp) {
    storageRemove(TOKEN_KEY);
    return null;
  }

  // Margem de segurança de 10 segundos para evitar race conditions em requisições
  const agora = Math.floor(Date.now() / 1000);
  if (payload.exp < agora + 10) {
    storageRemove(TOKEN_KEY);
    return null;
  }

  return t;
}

export function broadcastUnauthorized() {
  try {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  } catch { /* noop */ }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getValidToken());
  const [perfil, setPerfil] = useState<PerfilResumo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setSession = useCallback((t: string, ttlSeconds?: number) => {
    setToken(t);
    storageSet(TOKEN_KEY, t, ttlSeconds);
  }, []);

  const logout = useCallback(async (global: boolean = false) => {
    try {
      if (global) {
        await fazerLogout();
      } else {
        logoutLocal();
      }
    } catch {
      // Falha no logout do backend não deve impedir a limpeza no frontend
      logoutLocal();
    } finally {
      setToken(null);
      setPerfil(null);
      
      const message = global ? "Sessão encerrada em todos os dispositivos." : "Sessão encerrada neste navegador.";
      Notificacao.toast.info(message);
      
      // Pequeno delay para o usuário ler o toast antes do redirecionamento pesado
      setTimeout(() => {
        window.location.assign('/entrada');
      }, 800);
    }
  }, []);

  useEffect(() => {
    const handleAuth = async () => {
      if (token) {
        try {
            const p = await getMeuPerfil();
            setPerfil(p);
        } catch (error) {
            console.error("Erro ao carregar perfil, mas mantendo sessão:", error);
        }
      } 
      setLoading(false);
    };
    handleAuth();

    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        setToken(getValidToken());
      }
    };
    const onUnauthorized = () => logout(true);
    const onPerfilUpdated = (e: any) => {
      if (e.detail) setPerfil(e.detail);
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('auth:unauthorized', onUnauthorized as EventListener);
    window.addEventListener('auth:perfil_updated', onPerfilUpdated as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth:unauthorized', onUnauthorized as EventListener);
      window.removeEventListener('auth:perfil_updated', onPerfilUpdated as EventListener);
    };
  }, [token, logout]);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    autenticado: !!token,
    loading,
    perfil,
    setPerfil,
    setSession,
    logout,
  }), [token, loading, perfil, setPerfil, setSession, logout]);

  // Monitoramento de Level Up
  const prevLevelRef = React.useRef<number | null>(null);
  useEffect(() => {
    // Inicializa o ref na primeira vez que o perfil é carregado
    if (prevLevelRef.current === null && perfil?.level) {
      prevLevelRef.current = perfil.level;
      return;
    }

    if (perfil?.level && prevLevelRef.current && perfil.level > prevLevelRef.current) {
      // Dispara o modal de Level Up
      Notificacao.modal.levelUp({
        novoNivel: perfil.level,
        novoTitulo: perfil.titulo_ativo || undefined
      });
    }
    
    // Atualiza o ref após a verificação para o próximo ciclo
    if (perfil?.level) {
      prevLevelRef.current = perfil.level;
    }
  }, [perfil?.level, perfil?.titulo_ativo]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}

// Componente utilitário para renderizar um estado de carregamento padrão
export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex items-center justify-center">
      <div className="card px-6 py-4">Carregando...</div>
    </div>
  );
}
