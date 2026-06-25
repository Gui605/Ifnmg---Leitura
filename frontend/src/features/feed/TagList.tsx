import React, { useState, useEffect, useRef } from "react";
import { Search, X, Hash } from "lucide-react";

interface Props {
  tags: string[];
}

export default function TagList({ tags }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [tagsExibidas, setTagsExibidas] = useState<string[]>([]);
  const [pagina, setPagina] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const LIMITE_PAGINA = 10;

  const tagsFiltradasTotais = tags.filter((tag) =>
    tag.toLowerCase().includes(busca.toLowerCase().trim())
  );

  // Efeito para reiniciar e paginar sempre que abrir o modal ou mudar a busca
  useEffect(() => {
    if (isOpen) {
      const loteInicial = tagsFiltradasTotais.slice(0, LIMITE_PAGINA);
      setTagsExibidas(loteInicial);
      setPagina(1);
      setHasMore(tagsFiltradasTotais.length > LIMITE_PAGINA);
    }
  }, [busca, isOpen, tags.length]);

  // Carrega o próximo lote de 10 tags ao rolar até o fim
  const carregarMaisTags = () => {
    if (!hasMore) return;
    
    const proximaPagina = pagina + 1;
    const fimIndex = proximaPagina * LIMITE_PAGINA;
    const novoLote = tagsFiltradasTotais.slice(0, fimIndex);

    setTagsExibidas(novoLote);
    setPagina(proximaPagina);
    setHasMore(tagsFiltradasTotais.length > fimIndex);
  };

  // Monitora o scroll interno da caixa de tags
  const handleScrollInterno = () => {
    const el = scrollContainerRef.current;
    if (!el || !hasMore) return;

    // Se o usuário rolar até 20px antes do fim do modal, puxa mais dados
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      carregarMaisTags;
    }
  };

  if (!tags.length) return null;

  // Exibe apenas as 4 primeiras tags na visualização padrão do card para não poluir
  const tagsIniciaisFeed = tags.slice(0, 4);
  const possuiTagsEscondidas = tags.length > 4;

  return (
    <div className="flex flex-wrap gap-2 mb-4 items-center">
      {/* Listagem padrão comprimida no Feed */}
      {tagsIniciaisFeed.map((tag) => (
        <span
          key={tag}
          className="text-[10px] font-black uppercase bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-2.5 py-1 rounded-lg tracking-wider border border-[var(--accent-primary)]/10"
        >
          #{tag}
        </span>
      ))}

      {/* Botão Gatilho para abrir o Modal */}
      {possuiTagsEscondidas && (
        <button
          onClick={() => setIsOpen(true)}
          className="text-[10px] font-black uppercase text-[var(--text-secondary)] bg-[var(--input-bg)] hover:bg-[var(--accent-primary)]/10 hover:text-[var(--accent-primary)] px-2.5 py-1 rounded-lg tracking-wider transition-all"
        >
          + {tags.length - 4} tags
        </button>
      )}

      {/* MODAL ESTRUTURAL (Focused Overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[var(--accent-primary)]">
                <Hash size={18} strokeWidth={2.5} />
                <h3 className="font-lexend font-black text-lg text-[var(--text-primary)]">Todas os Marcadores</h3>
              </div>
              <button 
                onClick={() => { setIsOpen(false); setBusca(""); }}
                className="p-1.5 hover:bg-[var(--input-bg)] rounded-xl text-[var(--text-secondary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Barra de Busca Superior */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-50" size={16} />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar tag específica..."
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] text-sm rounded-xl pl-10 pr-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>

            {/* Lista com Rolagem Controlada (Scroll Infinito Interno) */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScrollInterno}
              className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin select-none"
            >
              {tagsExibidas.length === 0 ? (
                <p className="text-center py-8 text-xs text-[var(--text-secondary)] italic">Nenhum marcador localizado.</p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {tagsExibidas.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-bold uppercase bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-3 py-1.5 rounded-xl tracking-wider border border-[var(--accent-primary)]/15 inline-block"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Indicador de Fim do Bloco */}
              {!hasMore && tagsFiltradasTotais.length > 0 && (
                <div className="text-[10px] font-bold text-center text-[var(--text-secondary)] opacity-40 uppercase tracking-widest pt-4">
                  Fim dos marcadores
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}