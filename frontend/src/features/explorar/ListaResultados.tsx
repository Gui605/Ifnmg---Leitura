import React from 'react';
import { TrabalhoResumo, FiltrosBusca } from '../../shared/types/post.types';
import { CardTrabalho } from './CardTrabalho';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

interface Props {
  trabalhos: TrabalhoResumo[];
  loading: boolean;
  filtros: FiltrosBusca;
  onFiltrosChange: (novosFiltros: Partial<FiltrosBusca>) => void;
  meta: {
    page: number;
    totalPages: number;
    total: number;
  };
  onPageChange: (page: number) => void;
}

export function ListaResultados({ trabalhos, loading, filtros, onFiltrosChange, meta, onPageChange }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]" />
        ))}
      </div>
    );
  }

  if (trabalhos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-card)] rounded-2xl border-2 border-dashed border-[var(--border-color)]">
        <Inbox size={48} className="text-[var(--text-secondary)]/30 mb-4" />
        <h3 className="text-lg font-bold font-lexend text-[var(--text-primary)]">Nenhum pergaminho encontrado</h3>
        <p className="text-[var(--text-secondary)] text-sm max-w-xs text-center">Tente ajustar seus filtros ou realizar uma nova busca para encontrar o que procura.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header de Resultados */}
      <div className="flex items-center justify-between mb-4 border-b border-[var(--accent-primary)]/10 pb-4 px-2">
        <span className="text-sm text-slate-500 font-medium">
          {meta.total.toLocaleString()} resultados encontrados
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Ordenar por:</span>
          <select 
            value={filtros.ordenar_por || 'recentes'}
            onChange={(e) => onFiltrosChange({ ordenar_por: e.target.value as any })}
            className="bg-transparent border-none text-sm font-bold text-[var(--accent-primary)] focus:ring-0 cursor-pointer p-0 outline-none"
          >
            <option value="recentes">Mais Recentes</option>
            <option value="populares">Mais Citados</option>
            <option value="citacoes">Maior Engajamento</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {trabalhos.map(trabalho => (
          <CardTrabalho key={trabalho.post_id} trabalho={trabalho} />
        ))}
      </div>

      {/* Paginação */}
      <div className="mt-10 flex items-center justify-center gap-4">
        <button 
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page === 1}
          className="bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} className="text-[var(--accent-primary)]" />
        </button>
        
        <div className="flex gap-2">
          {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
            const p = i + 1;
            const isAtivo = p === meta.page;
            return (
              <button 
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  isAtivo 
                    ? 'bg-[var(--accent-primary)] text-white' 
                    : 'hover:bg-[var(--accent-primary)]/10 text-[var(--text-primary)]'
                }`}
              >
                {p}
              </button>
            );
          })}
          {meta.totalPages > 5 && (
            <>
              <span className="flex items-end px-2 font-bold text-[var(--text-secondary)]/50">...</span>
              <button 
                onClick={() => onPageChange(meta.totalPages)}
                className={`w-10 h-10 rounded-lg font-bold hover:bg-[var(--accent-primary)]/10 text-[var(--text-primary)]`}
              >
                {meta.totalPages}
              </button>
            </>
          )}
        </div>
        
        <button 
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page === meta.totalPages}
          className="bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} className="text-[var(--accent-primary)]" />
        </button>
      </div>
    </div>
  );
}
