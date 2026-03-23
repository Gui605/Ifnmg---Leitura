import React, { useState, useEffect } from 'react';
import { Search, Command, X, History, TrendingUp } from 'lucide-react';

interface Props {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

export function BarraBusca({ initialQuery = '', onSearch }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  
  const popularSearches = ['Direito Penal', 'Algoritmos Preditivos', 'Ética na IA', 'Gestão Escolar', 'Engenharia de Software'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setIsFocused(false);
  };

  return (
    <div className="relative w-full mb-8">
      <form onSubmit={handleSubmit} className="relative z-20 mb-4">
        <div className={`
          flex items-center gap-4 bg-[var(--bg-card)] border-2 rounded-2xl p-4 transition-all duration-300 shadow-[var(--shadow-elevation-1)]
          ${isFocused ? 'border-[var(--accent-primary)] shadow-lg shadow-green-500/10' : 'border-[var(--border-color)]'}
        `}>
          <Search size={24} className={`transition-colors ${isFocused ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`} />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Pesquise por títulos, autores ou temas..."
            className="flex-1 bg-transparent border-none outline-none text-lg font-lexend text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50"
          />
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] shadow-sm">
            <Command size={12} strokeWidth={2.5} />
            <span className="text-[10px] font-black tracking-tighter">K</span>
          </div>
        </div>
      </form>

      {/* Buscas Populares (Sempre Visíveis) */}
      <div className="flex flex-wrap items-center gap-3 px-2 animate-in fade-in slide-in-from-top-2 duration-500">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1.5">
          <TrendingUp size={12} strokeWidth={2.5} className="text-[var(--accent-primary)]" />
          Buscas Populares:
        </span>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map(s => (
            <button
              key={s}
              onClick={() => { setQuery(s); onSearch(s); setIsFocused(false); }}
              className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all flex items-center gap-1"
            >
              #{s.replace(/\s+/g, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Sugestões Dropdown */}
      {isFocused && (
        <>
          <div 
            className="fixed inset-0 z-10 bg-black/5 backdrop-blur-sm"
            onClick={() => setIsFocused(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-20 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-4">
                  <TrendingUp size={14} />
                  <span>Buscas Populares</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map(s => (
                    <button
                      key={s}
                      onClick={() => { setQuery(s); onSearch(s); setIsFocused(false); }}
                      className="px-4 py-2 bg-[var(--input-bg)] hover:bg-[var(--accent-primary)]/10 text-[var(--text-primary)] hover:text-[var(--accent-primary)] rounded-xl text-sm font-medium transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-[var(--border-color)] pt-6 md:pt-0 md:pl-8">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-4">
                  <History size={14} />
                  <span>Recentes</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-[var(--text-secondary)] italic">Nenhuma busca recente encontrada.</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
