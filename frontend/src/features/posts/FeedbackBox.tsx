import React, { useState } from 'react';
import { 
  ThumbsUp, 
  Heart, 
  Flame, 
  Ghost, 
  Coffee 
} from 'lucide-react';
import { reagirPost } from '../../shared/services/post.service';

interface Props {
  postId: number;
  reacoesCount: Record<string, number>;
  minhaReacao: string | null;
  onUpdate: () => void;
}

const REACOES_CONFIG = [
  { tipo: 'LIKE', label: 'FELIZ', icon: ThumbsUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { tipo: 'LOVE', label: 'AMOR', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { tipo: 'FIRE', label: 'QUENTE', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { tipo: 'SAD', label: 'TRISTE', icon: Ghost, color: 'text-gray-500', bg: 'bg-gray-500/10' }
];

export default function FeedbackBox({ postId, reacoesCount, minhaReacao, onUpdate }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleReagir(tipo: string) {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      await reagirPost(postId, tipo);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 md:gap-5 py-4 border-y border-[var(--border-color)]/10 transition-opacity ${
      isUpdating ? 'opacity-50 pointer-events-none' : 'opacity-100'
    }`}>
      {REACOES_CONFIG.map((reacao) => {
        const Icon = reacao.icon;
        const count = reacoesCount[reacao.tipo] || 0;
        const isAtiva = minhaReacao === reacao.tipo;

        return (
          <button
            key={reacao.tipo}
            onClick={() => handleReagir(reacao.tipo)}
            disabled={isUpdating}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-full transition-all active:scale-95 ${
              isAtiva ? 'bg-[var(--accent-primary)]/10 scale-105' : 'hover:bg-[var(--input-bg)]'
            } ${isUpdating ? 'cursor-not-allowed' : ''}`}
          >
            <Icon 
              size={18} 
              className={`${isAtiva ? reacao.color : 'text-[var(--text-secondary)] group-hover:' + reacao.color} transition-colors ${
                isUpdating && !isAtiva ? 'grayscale' : ''
              }`}
              fill={isAtiva ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
            <div className="flex items-center gap-1.5">
              <span className={`text-[8px] font-black tracking-widest ${isAtiva ? reacao.color : 'text-[var(--text-secondary)] opacity-40'}`}>
                {reacao.label}
              </span>
              <span className="text-xs font-black text-[var(--text-primary)]">
                {count}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
