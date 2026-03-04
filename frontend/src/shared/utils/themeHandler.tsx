import React, { createContext, useCallback, useContext,
  useEffect, useLayoutEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
const CHAVE_STORAGE = 'theme-preference';

type ThemeContextValue = {
  modoGeral: ThemeMode;
  modoEscuro: boolean;
  setTema: (mode: ThemeMode) => void;
  alternarTema: () => void;
};
const ThemeContext = createContext<ThemeContextValue | null>(null);

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getSystemPrefersDark(): boolean {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getStoredTheme(): ThemeMode | null {
  if (!isBrowser()) return null;
  try {
    const v = window.localStorage.getItem(CHAVE_STORAGE);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
    return null;
  } catch {
    return null;
  }
}

function setStoredTheme(mode: ThemeMode): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(CHAVE_STORAGE, mode);
  } catch { /* noop */ }
}

function applyThemeClass(isDark: boolean): void {
  if (!isBrowser()) return;
  const root = document.documentElement;
  root.classList.remove('dark-mode');
  root.classList.remove('light-mode');
  if (isDark) root.classList.add('dark-mode');
  else root.classList.add('light-mode');
  try {
    (root.style as any).colorScheme = isDark ? 'dark' : 'light';
  } catch { /* noop */ }
}

function currentEffectiveDark(mode: ThemeMode | null): boolean {
  if (mode === 'light') return false;
  if (mode === 'dark') return true;
  return getSystemPrefersDark();
}

export function setTema(mode: ThemeMode): void {
  setStoredTheme(mode);
  const escuro = currentEffectiveDark(mode);
  applyThemeClass(escuro);
}

export function getTema(): ThemeMode {
  return getStoredTheme() ?? 'system';
}

export function inicializarTema(): void {
  if (!isBrowser()) return;
  const stored = getStoredTheme();
  applyThemeClass(currentEffectiveDark(stored));
  document.documentElement.classList.add('theme-ready');
}

if (isBrowser()) inicializarTema();

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [modoGeral, setModoGeral] = useState<ThemeMode>(() => getTema());
  const [modoEscuro, setModoEscuro] = useState<boolean>(() => currentEffectiveDark(getTema()));

  const atualizar = useCallback((novoModo: ThemeMode) => {
    setTema(novoModo);
    setModoGeral(novoModo);
    setModoEscuro(currentEffectiveDark(novoModo));
  }, []);

  const alternarTema = useCallback(() => {
    const atual = getTema();
    const proximo = atual === 'dark' ? 'light' : atual === 'light' ? 'dark' : (getSystemPrefersDark() ? 'light' : 'dark');
    atualizar(proximo);
  }, [atualizar]);

  useLayoutEffect(() => {
    applyThemeClass(currentEffectiveDark(modoGeral));
  }, [modoGeral]);

  useEffect(() => {
    const handler = () => {
      if (modoGeral === 'system') {
        const dark = getSystemPrefersDark();
        setModoEscuro(dark);
        applyThemeClass(dark);
      }
    };
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [modoGeral]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CHAVE_STORAGE) {
        const novoModo = getTema();
        setModoGeral(novoModo);
        setModoEscuro(currentEffectiveDark(novoModo));
        applyThemeClass(currentEffectiveDark(novoModo));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ modoGeral, modoEscuro, setTema: atualizar, alternarTema }), [modoGeral, modoEscuro, atualizar, alternarTema]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTema() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback minimal: compute from storage if provider is missing
    const modo = getTema();
    return {
      modoGeral: modo,
      modoEscuro: currentEffectiveDark(modo),
      setTema,
      alternarTema: () => setTema(currentEffectiveDark(getTema()) ? 'light' : 'dark'),
    } as ThemeContextValue;
  }
  return ctx;
}
