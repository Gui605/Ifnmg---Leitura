import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storageGet, storageRemove, storageSet } from './storage';
import { showToast } from './toast';

type AuthContextValue = {
  token: string | null;
  autenticado: boolean;
  loading: boolean;
  setSession: (token: string, ttlSeconds?: number) => void;
  logout: () => void;
};

const TOKEN_KEY = 'auth-token';
const AuthContext = createContext<AuthContextValue | null>(null);

export function broadcastUnauthorized() {
  try {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  } catch { /* noop */ }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => storageGet<string>(TOKEN_KEY));
  const [loading, setLoading] = useState<boolean>(true);

  const setSession = useCallback((t: string, ttlSeconds?: number) => {
    setToken(t);
    storageSet(TOKEN_KEY, t, ttlSeconds);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    storageRemove(TOKEN_KEY);
    try { showToast('warning', 'Sua sessão expirou. Redirecionando...'); } catch {}
    try { setTimeout(() => { window.location.assign('/login'); }, 700); } catch {}
  }, []);

  useEffect(() => {
    // Primeira pintura: sincroniza token do storage e encerra estado de carregamento
    setLoading(false);
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        const v = storageGet<string>(TOKEN_KEY);
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
