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
      className={`relative p-2 rounded-full bg-[var(--bg-card)] transition-colors border-2 ${modoEscuro ? 'border-[var(--accent-primary)]' : 'border-black'}`}
      whileTap={{ scale: 0.9 }}
      style={
        modoEscuro
          ? {
              color: 'var(--accent-primary)',
              boxShadow: '0 0 12px var(--accent-primary)',
            }
          : {
              color: 'var(--text-secondary)',
              boxShadow: '0 0 8px rgba(0, 0, 0, 0.6)',
            }
      }
    >
      <Lamp size={22} strokeWidth={2} />
    </motion.button>
  );
}
