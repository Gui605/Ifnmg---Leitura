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
  const statusOptions = ['CONCLUIDO', 'ANDAMENTO'];

  const handleChange = (key: keyof FiltrosBusca, value: any) => {
    onFiltrosChange({ [key]: value, page: 1 });
  };

  const tabs = [
    { id: 'TODOS', label: 'Tudo' },
    { id: 'POST', label: 'Artigos' },
    { id: 'OBRA', label: 'Obras Literárias' }
  ];

  return (
    <div className="flex flex-col gap-6 mb-10">
      {/* Seletor de Tipo */}
      <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full w-fit shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleChange('tipo', tab.id)}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              filtros.tipo === tab.id
                ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--input-bg)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
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
            <option value="CONCLUIDO">Concluído</option>
            <option value="ANDAMENTO">Em Andamento</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none group-hover:text-[var(--accent-primary)] transition-colors" />
        </div>

        {/* botão limpar */}
        {(filtros.curso || filtros.idioma || filtros.status || (filtros.tipo && filtros.tipo !== 'TODOS')) && (
          <button 
            onClick={() => onFiltrosChange({ curso: '', idioma: '', status: '', tipo: 'TODOS' })}
            className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] hover:underline ml-2"
          >
            Limpar Filtros
          </button>
        )}
      </div>
    </div>
  );
}
