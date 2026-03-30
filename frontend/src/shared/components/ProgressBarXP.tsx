// frontend/src/shared/components/ProgressBarXP.tsx

import React from 'react';

/**
 * 🎮 LÓGICA DE NÍVEL GEOMÉTRICA (IFNMG)
 * Fórmula: Nivel * 100 * (1.5 ^ Nivel)
 */
export function calcularXpParaNivel(nivel: number): number {
  if (nivel <= 1) return 0;
  return Math.floor(nivel * 100 * Math.pow(1.5, nivel));
}

/**
 * 🏛️ PATENTES GLOBAIS
 * Fallback para quando o usuário não possui um título de especialidade ativo.
 */
export const PATENTES_GLOBAIS = [
  { nivel: 1, nome: "Calouro" },
  { nivel: 10, nome: "Explorador" },
  { nivel: 20, nome: "Pesquisador" },
  { nivel: 30, nome: "Erudito" },
  { nivel: 50, nome: "Mestre Lendário" }
] as const;

export function getPatentePorNivel(level: number): string {
  let patente: string = PATENTES_GLOBAIS[0].nome;
  for (const p of PATENTES_GLOBAIS) {
    if (level >= p.nivel) patente = p.nome;
    else break;
  }
  return patente;
}

interface ProgressBarXPProps {
  xp: number;
  level: number;
  className?: string;
  showLabels?: boolean;
}

export const ProgressBarXP: React.FC<ProgressBarXPProps> = ({ 
  xp, 
  level, 
  className = "", 
  showLabels = true 
}) => {
  const xpAtualNivel = calcularXpParaNivel(level);
  const xpProxNivel = calcularXpParaNivel(level + 1);
  
  const totalNecessario = xpProxNivel - xpAtualNivel;
  const progressoXp = xp - xpAtualNivel;
  
  const porcentagem = Math.min(Math.max((progressoXp / totalNecessario) * 100, 0), 100);

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabels && (
        <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          <span>Progresso</span>
          <span>{Math.floor(porcentagem)}%</span>
        </div>
      )}
      
      <div className="relative w-full h-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--color-if-green)] transition-all duration-700 ease-out rounded-full"
          style={{ width: `${porcentagem}%` }}
        />
      </div>
      
      {showLabels && (
        <div className="flex justify-between text-[9px] font-medium text-[var(--text-secondary)] opacity-70">
          <span>{xp} XP</span>
          <span>{xpProxNivel} XP</span>
        </div>
      )}
    </div>
  );
};
