import React from 'react';
import { Lamp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTema } from '../utils/themeHandler';

export default function ThemeToggle() {
  const { modoEscuro, alternarTema } = useTema();
  return (
    <motion.button
      type="button"
      onClick={alternarTema}
      aria-pressed={modoEscuro}
      aria-label="Alternar tema"
      title={modoEscuro ? 'Modo escuro' : 'Modo claro'}
      className="fixed top-4 right-4 z-50 p-2 rounded-full border border-[color:var(--border-color)] bg-[var(--bg-card)] transition-colors"
      whileTap={{ scale: 0.9 }}
      style={
        modoEscuro
          ? {
              color: 'var(--accent-primary)',
              boxShadow: '0 0 12px var(--accent-primary)',
            }
          : {
              color: 'var(--text-secondary)',
              boxShadow: 'none',
            }
      }
    >
      <Lamp size={22} strokeWidth={2} />
    </motion.button>
  );
}
