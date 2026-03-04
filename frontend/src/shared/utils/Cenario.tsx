import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTema } from './themeHandler';
import fundoDia from '../../imagens/fundoLoginDia.jpg';
import fundoNoite from '../../imagens/fundoLoginNoite.jpg';

export function FundoBiblioteca() {
  const { modoEscuro } = useTema();
  return (
    <> 
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-700 z-[1]"
        style={{
          backgroundImage: `url(${modoEscuro ? fundoNoite : fundoDia})`,
          filter: 'blur(2px)',
          // Aumentamos o scale ligeiramente para garantir que o "blur" 
          // nas bordas não mostre o fundo branco ao redimensionar
          transform: 'scale(1.15)', 
        }}
      />
      <div className="absolute inset-0 theme-overlay transition-all duration-500 z-10" style={{ background: 'var(--overlay-bg)' }} />
    </>
  );
}

export function Particulas() {
  const { modoEscuro } = useTema();
  const reduce = useReducedMotion();
  const particles = useMemo(() => {
    const count = reduce ? 15 : 50;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      driftX: (Math.random() - 0.5) * 120,
      driftY: (Math.random() - 0.5) * 180,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 5,
      size: 1 + Math.random() * 2.5,
    }));
  }, [reduce]);
  return (
  /* MODIFICAÇÃO 1: 
     - Trocamos 'w-screen h-screen' por 'inset-0'. 
     - Adicionamos 'min-h-[100dvh]' para garantir que no mobile 
       ele cubra a área atrás da barra de endereços.
  */
  <div className="pointer-events-none fixed inset-0 w-full min-h-[100dvh] overflow-hidden z-20">
    {particles.map((p) => (
      <motion.span
        key={p.id}
        className="absolute rounded-full"
        initial={{ opacity: modoEscuro ? 0.6 : 0.2 }}
        animate={{
          x: [0, p.driftX],
          y: [0, p.driftY],
          opacity: modoEscuro ? [0.4, 1, 0.5] : [0.15, 0.3, 0.2],
          scale: modoEscuro ? [1, 1.4, 1.1] : [1, 1.05, 1],
        }}
        transition={{
          duration: p.duration,
          delay: p.delay,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        style={{
          /* MODIFICAÇÃO 2: 
             A posição permanece em %, mas o container 'inset-0' 
             garante que 100% seja o fim real da tela do celular.
          */
          top: `${p.y}%`,
          left: `${p.x}%`,
          width: p.size,
          height: p.size,
          backgroundColor: modoEscuro ? '#2f9e41' : '#f59e0b',
          boxShadow: modoEscuro ? '0 0 14px #2f9e41' : '0 0 2px #f59e0b',
          /* MODIFICAÇÃO 3:
             Garante que o hardware do celular trate as animações 
             de forma fluida sem 'engasgar' o scroll do formulário.
          */
          willChange: 'transform, opacity',
        }}
      />
    ))}
  </div>
);
}

export function CenarioLogin() {
  return (
    // Este container "trava" tudo o que visual na janela do navegador
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <FundoBiblioteca />
      <Particulas />
    </div>
  );
}

