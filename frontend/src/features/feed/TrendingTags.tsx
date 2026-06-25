import React, { useEffect, useState, useRef } from 'react';
import { TrendingCategoria } from '../../shared/types/categoria.types';
import { getTrendingTags } from '../../shared/services/categoria.service';
import { TrendingUp, Search, X, Hash } from 'lucide-react';

export default function TrendingTags() {
  const [tags, setTags] = useState<TrendingCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de controle para o Modal Paginado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [tagsExibidasModal, setTagsExibidasModal] = useState<TrendingCategoria[]>([]);
  const [pagina, setPagina] = useState(1);
  const [hasMore, setHasMore] = useState(true);
const scrollContainerRef = useRef<HTMLDivElement>(null);
  const LIMITE_PAGINA = 10;

  useEffect(() => {
    getTrendingTags()
      .then(setTags)
      .finally(() => setLoading(false));
  }, []);

  // Filtra o acervo total de tendências com base no input do estudante
  const tagsFiltradasTotais = tags.filter((tag) =>
    tag.nome.toLowerCase().includes(busca.toLowerCase().trim())
  );

  // Reinicia os estados de paginação e renderiza o primeiro lote ao abrir o modal ou buscar
  useEffect(() => {
    if (isModalOpen) {
      const loteInicial = tagsFiltradasTotais.slice(0, LIMITE_PAGINA);
      setTagsExibidasModal(loteInicial);
      setPagina(1);
      setHasMore(tagsFiltradasTotais.length > LIMITE_PAGINA);
    }
  }, [busca, isModalOpen, tags.length]);

  // Bloqueia a rolagem do feed ao fundo quando o modal estiver ativo
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Garante a restauração do scroll caso o componente seja desmontado inesperadamente
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);
  
  // Carrega as próximas 10 tags quando acionado por evento de rolagem
  const carregarMaisTagsModal = () => {
    if (!hasMore) return;
    const proximaPagina = pagina + 1;
    const fimIndex = proximaPagina * LIMITE_PAGINA;
    const novoLote = tagsFiltradasTotais.slice(0, fimIndex);

    setTagsExibidasModal(novoLote);
    setPagina(proximaPagina);
    setHasMore(tagsFiltradasTotais.length > fimIndex);
  };

  // Monitora o scroll exclusivo da caixa interna do modal
  const handleScrollInternoModal = () => {
    const el = scrollContainerRef.current;
    if (!el || !hasMore) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      carregarMaisTagsModal();
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-[var(--input-bg)] rounded-xl" />
        ))}
      </div>
    );
  }

  // Na barra lateral do Feed exibe apenas as 5 primeiras tendências
  const tagsPrincipaisSidebar = tags.slice(0, 5);

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)] shadow-[var(--shadow-elevation-1)]">
      <div className="flex items-center gap-4 mb-6">
        <TrendingUp className="text-[var(--accent-primary)]" size={24} strokeWidth={2.5} />
        <h2 className="font-bold text-lg text-[var(--text-primary)] tracking-tight">Tags em alta</h2>
      </div>

      <div className="flex flex-col gap-3.5">
        {tagsPrincipaisSidebar.map((tag, index) => (
          <div key={tag.categoria_id} className="group cursor-pointer">
            <div className="flex items-start gap-4">
              <span className="text-base font-black text-[var(--accent-primary)]/20 tabular-nums">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  #{tag.nome.toUpperCase()}
                </p>
                <p className="text-[10px] font-black text-[var(--text-primary)] mt-0.5">
                  {tag.contagem} {tag.contagem === 1 ? 'PERGAMINHO' : 'PERGAMINHOS'}
                </p>
              </div>
            </div>
          </div>
        ))}
        {tags.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)] text-center italic">Nenhuma tendência ainda.</p>
        )}
      </div>
      
      {tags.length > 5 && (
        <div className="mt-6 pt-4 border-t border-[var(--border-color)] text-center">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-black uppercase tracking-wider text-[var(--accent-primary)] hover:underline bg-transparent border-none cursor-pointer"
          >
            Ver todas as tags
          </button>
        </div>
      )}

      {/* MODAL DE TODAS AS TAGS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[var(--accent-primary)]">
                <Hash size={18} strokeWidth={2.5} />
                <h3 className="font-lexend font-black text-lg text-[var(--text-primary)]">Todas as Tags</h3>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setBusca(""); }}
                className="p-1.5 hover:bg-[var(--input-bg)] rounded-xl text-[var(--text-secondary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Input de Pesquisa */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-50" size={16} />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Filtrar por nome..."
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] text-sm rounded-xl pl-10 pr-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>

            {/* Lista com Paginação Infinita */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScrollInternoModal}
              className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin"
            >
              {tagsExibidasModal.length === 0 ? (
                <p className="text-center py-8 text-xs text-[var(--text-secondary)] italic">Nenhum marcador localizado.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {tagsExibidasModal.map((tag, idx) => (
                    <div key={tag.categoria_id} className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--input-bg)] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[var(--text-secondary)]/40 tabular-nums">{(idx + 1).toString().padStart(2, '0')}</span>
                        <span className="text-sm font-bold text-[var(--accent-primary)]">#{tag.nome.toUpperCase()}</span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-md">
                        {tag.contagem} {tag.contagem === 1 ? 'PERG' : 'PERGS'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {!hasMore && tagsFiltradasTotais.length > 0 && (
                <div className="text-[10px] font-bold text-center text-[var(--text-secondary)] opacity-30 uppercase tracking-widest pt-6 pb-2">
                  Fim das tags encontradas
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}