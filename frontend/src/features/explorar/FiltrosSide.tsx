import React, { useState } from 'react';
import { FiltrosBusca } from '../../shared/types/post.types';
import { Filter, X, Check, Tag, Info, HelpCircle } from 'lucide-react';

interface Props {
  filtros: FiltrosBusca;
  onFiltrosChange: (novosFiltros: Partial<FiltrosBusca>) => void;
  onClear: () => void;
}

export function FiltrosSide({ filtros, onFiltrosChange, onClear }: Props) {
  const cursos = ['Sistemas de Informação', 'Administração', 'Direito', 'Medicina Veterinária', 'Engenharia Civil'];
  const idiomas = ['Português', 'Inglês', 'Espanhol'];
  const statusOptions = ['Concluído', 'Em Andamento', 'Revisado'];
  const [tagInput, setTagInput] = useState('');

  const handleChange = (key: keyof FiltrosBusca, value: any) => {
    onFiltrosChange({ [key]: value, page: 1 });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const currentTags = filtros.tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        handleChange('tags', [...currentTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    handleChange('tags', (filtros.tags || []).filter(t => t !== tag));
  };

  return (
    <aside className="w-full lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:overflow-y-auto scrollbar-hide overscroll-contain flex flex-col gap-6 pb-10">
      {/* BLOCO ÚNICO DE FILTROS - Rigor copia.md */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl flex flex-col shadow-sm">
        
        {/* Header da Sidebar */}
        <div className="bg-[var(--bg-card)] border-b border-[var(--border-color)] p-6 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold font-lexend">
            <Filter size={20} className="text-[var(--accent-primary)]" />
            <span className="text-lg">Filtros Avançados</span>
          </div>
          <button 
            onClick={onClear}
            className="text-xs font-bold text-[var(--accent-primary)] hover:underline transition-all"
          >
            Limpar Tudo
          </button>
        </div>

        {/* Conteúdo dos Filtros (Sem scroll interno) */}
        <div className="flex flex-col p-6 space-y-6">
          
          {/* Seção de Cursos */}
          <div>
            <label className="text-sm font-semibold mb-2 block text-slate-500 uppercase tracking-wider font-lexend">Curso</label>
            <select 
              value={filtros.curso || ''} 
              onChange={(e) => handleChange('curso', e.target.value)}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg p-3 text-sm font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] outline-none transition-all cursor-pointer"
            >
              <option value="">Todos os cursos</option>
              {cursos.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Seção de Idioma (Checkboxes - Fidelidade AO3) */}
          <div>
            <label className="text-sm font-semibold mb-2 block text-slate-500 uppercase tracking-wider font-lexend">Idioma</label>
            <div className="space-y-2.5">
              {idiomas.map(idm => (
                <label key={idm} className="flex items-center gap-3 text-sm cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={filtros.idioma === idm}
                    onChange={() => handleChange('idioma', filtros.idioma === idm ? '' : idm)}
                    className="rounded border-[var(--border-color)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] bg-[var(--input-bg)] transition-all w-4 h-4"
                  />
                  <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors font-medium">
                    {idm}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Seção de Status (Grid 2 colunas - Fidelidade copia.md) */}
          <div>
            <label className="text-sm font-semibold mb-2 block text-slate-500 uppercase tracking-wider font-lexend">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map(st => (
                <button
                  key={st}
                  onClick={() => handleChange('status', filtros.status === st ? '' : st)}
                  className={`text-xs font-bold py-2.5 px-3 rounded-lg transition-all border ${
                    filtros.status === st 
                      ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-md shadow-green-500/10' 
                      : 'bg-[var(--accent-primary)]/10 border-transparent text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Seção de Outras Tags */}
          <div>
            <label className="text-sm font-semibold mb-2 block text-slate-500 uppercase tracking-wider font-lexend">Outras Tags</label>
            <div className="relative mb-3">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-primary)]/60" />
              <input 
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="IA, Machine Learning, Sustentabilidade..."
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg py-2.5 pl-10 pr-3 text-sm font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] outline-none transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filtros.tags?.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] font-bold rounded text-xs border border-[var(--accent-primary)]/20">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-[var(--color-if-red)] transition-colors">
                    <X size={10} strokeWidth={3} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé do Bloco de Filtros */}
        <div className="p-6 border-t border-[var(--border-color)]">
          <button 
            onClick={() => onFiltrosChange(filtros)}
            className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Filter size={18} />
            Filtrar Resultados
          </button>
        </div>
      </div>

      {/* BLOCO DE AJUDA - Fidelidade copia.md */}
      <div className="bg-[var(--accent-primary)]/5 rounded-xl border border-[var(--accent-primary)]/20 p-4 shadow-sm">
        <h4 className="text-xs font-bold text-[var(--accent-primary)] mb-2 uppercase tracking-widest font-lexend">
          AJUDA
        </h4>
        <div className="flex flex-col gap-2">
          <a href="#" className="text-xs text-slate-600 dark:text-slate-400 hover:text-[var(--accent-primary)] underline decoration-[var(--accent-primary)]/30 transition-all">
            Como funcionam as citações?
          </a>
          <a href="#" className="text-xs text-slate-600 dark:text-slate-400 hover:text-[var(--accent-primary)] underline decoration-[var(--accent-primary)]/30 transition-all">
            Termos de Serviço Acadêmico
          </a>
        </div>
      </div>
    </aside>
  );
}
