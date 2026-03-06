import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storageGet, storageRemove, storageSet } from './storage';
import { Notificacao } from './Notificacao';

type AuthContextValue = {
  token: string | null;
  autenticado: boolean;
  loading: boolean;
  setSession: (token: string, ttlSeconds?: number) => void;
  logout: () => void;
};

const TOKEN_KEY = 'auth-token';
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Decodificador simplificado de JWT para extração de claims (ex: exp).
 * Evita dependências externas mantendo a rigidez de contrato.
 */
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

/**
 * Valida se o token existe e não está expirado.
 */
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
  const [loading, setLoading] = useState<boolean>(true);

  const setSession = useCallback((t: string, ttlSeconds?: number) => {
    setToken(t);
    storageSet(TOKEN_KEY, t, ttlSeconds);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    storageRemove(TOKEN_KEY);
    try { Notificacao.toast.show('warning', 'Sua sessão expirou. Redirecionando...'); } catch {}
    try { setTimeout(() => { window.location.assign('/login'); }, 700); } catch {}
  }, []);

  useEffect(() => {
    // Primeira pintura: sincroniza token do storage e encerra estado de carregamento
    setLoading(false);
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        const v = getValidToken();
        setToken(v);
      }
    };
    const onUnauthorized = () => logout();
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth:unauthorized', onUnauthorized as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth:unauthorized', onUnauthorized as EventListener);
    };
  }, [logout]);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    autenticado: !!token,
    loading,
    setSession,
    logout
  }), [token, loading, setSession, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      token: storageGet<string>(TOKEN_KEY),
      autenticado: !!storageGet<string>(TOKEN_KEY),
      loading: false,
      setSession: (t: string, ttl?: number) => storageSet(TOKEN_KEY, t, ttl),
      logout: () => storageRemove(TOKEN_KEY)
    } as AuthContextValue;
  }
  return ctx;
}
