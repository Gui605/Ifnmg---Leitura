import React from 'react';
import { FiltrosBusca } from '../../shared/types/post.types';
import { ChevronDown } from 'lucide-react';

interface Props {
  filtros: FiltrosBusca;
  onFiltrosChange: (novosFiltros: Partial<FiltrosBusca>) => void;
}

export function FiltrosTopo({ filtros, onFiltrosChange }: Props) {
  const cursos = ['Sistemas de Informação', 'Administração', 'Direito', 'Medicina Veterinária', 'Engenharia Civil'];
  const idiomas = ['Português', 'Inglês', 'Espanhol'];
  const statusOptions = ['Concluído', 'Em Andamento', 'Revisado'];

  const handleChange = (key: keyof FiltrosBusca, value: any) => {
    onFiltrosChange({ [key]: value, page: 1 });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-10">
      {/* Curso */}
      <div className="relative group">
        <select 
          value={filtros.curso || ''} 
          onChange={(e) => handleChange('curso', e.target.value)}
          className="appearance-none w-full md:w-auto bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg py-2.5 pl-4 pr-10 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] focus:border-[var(--accent-primary)] outline-none transition-all cursor-pointer shadow-sm"
        >
          <option value="">Todos os Cursos</option>
          {cursos.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none group-hover:text-[var(--accent-primary)] transition-colors" />
      </div>

      {/* Idioma */}
      <div className="relative group">
        <select 
          value={filtros.idioma || ''} 
          onChange={(e) => handleChange('idioma', e.target.value)}
          className="appearance-none w-full md:w-auto bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg py-2.5 pl-4 pr-10 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] focus:border-[var(--accent-primary)] outline-none transition-all cursor-pointer shadow-sm"
        >
          <option value="">Qualquer Idioma</option>
          {idiomas.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none group-hover:text-[var(--accent-primary)] transition-colors" />
      </div>

      {/* Status */}
      <div className="relative group">
        <select 
          value={filtros.status || ''} 
          onChange={(e) => handleChange('status', e.target.value)}
          className="appearance-none w-full md:w-auto bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg py-2.5 pl-4 pr-10 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] focus:border-[var(--accent-primary)] outline-none transition-all cursor-pointer shadow-sm"
        >
          <option value="">Qualquer Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none group-hover:text-[var(--accent-primary)] transition-colors" />
      </div>

      {/* Clear Button (Mobile/Foco) */}
      {(filtros.curso || filtros.idioma || filtros.status) && (
        <button 
          onClick={() => onFiltrosChange({ curso: '', idioma: '', status: '' })}
          className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] hover:underline ml-2"
        >
          Limpar Filtros
        </button>
      )}
    </div>
  );
}
