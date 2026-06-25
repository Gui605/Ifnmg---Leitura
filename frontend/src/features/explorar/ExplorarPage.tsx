import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header';
import { BarraBusca } from './BarraBusca';
import { FiltrosSide } from './FiltrosSide';
import { ListaResultados } from './ListaResultados';
import { pesquisarTrabalhos } from '../../shared/services/post.service';
import { TrabalhoResumo, FiltrosBusca } from '../../shared/types/post.types';
import { Notificacao } from '../../shared/utils/Notificacao';
import { Filter, SlidersHorizontal, ChevronRight, X, ChevronLeft } from 'lucide-react';
import { FiltrosTopo } from './FiltrosTopo';
import { motion, AnimatePresence } from 'framer-motion';

export function ExplorarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trabalhos, setTrabalhos] = useState<TrabalhoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltrosVisible, setIsFiltrosVisible] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const navLinks = [
  { label: 'Início', path: '/feed' },
  { label: 'Explorar', path: '/explorar' },
  { label: 'Notificações', path: '/notificacoes' },
  { label: 'Comunidade', path: '/comunidade' },
  { label: 'Salvos', path: '/salvos' },
  { label: 'Minhas Obras', path: '/minhas-obras' },
  { label: 'Configurações', path: '/configuracoes/perfil' }
];

  const [filtros, setFiltros] = useState<FiltrosBusca>({
    query: searchParams.get('q') || '',
    curso: searchParams.get('curso') || '',
    idioma: searchParams.get('idioma') || '',
    status: searchParams.get('status') || '',
    tipo: (searchParams.get('tipo') as any) || 'TODOS',
    ordenar_por: (searchParams.get('sort') as any) || 'recentes',
    page: parseInt(searchParams.get('page') || '1')
  });

  useEffect(() => {
    fetchTrabalhos();
    // Atualiza a URL quando os filtros mudam
    const newSearchParams = new URLSearchParams();
    if (filtros.query) newSearchParams.set('q', filtros.query);
    if (filtros.curso) newSearchParams.set('curso', filtros.curso);
    if (filtros.idioma) newSearchParams.set('idioma', filtros.idioma);
    if (filtros.status) newSearchParams.set('status', filtros.status);
    if (filtros.tipo && filtros.tipo !== 'TODOS') newSearchParams.set('tipo', filtros.tipo);
    if (filtros.ordenar_por) newSearchParams.set('sort', filtros.ordenar_por);
    if (filtros.page) newSearchParams.set('page', String(filtros.page));
    
    // Evita loop infinito se setSearchParams for síncrono ou causar re-render desnecessário
    if (searchParams.toString() !== newSearchParams.toString()) {
      setSearchParams(newSearchParams, { replace: true });
    }

  }, [filtros]);

  const fetchTrabalhos = async () => {
    console.log("Tentando buscar trabalhos com os filtros:", filtros);
    setLoading(true);
    try {
      const response = await pesquisarTrabalhos(filtros);
      console.log("Resposta recebida:", response);
      setTrabalhos(response.trabalhos);
      setMeta(response.meta);
    } catch (err) {
      console.error(" Erro na busca:", err);
      Notificacao.toast.erro('Falha ao carregar trabalhos', 'Não foi possível buscar os pergaminhos acadêmicos.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrosChange = (novosFiltros: Partial<FiltrosBusca>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros, page: 1 }));
  };

  const handleClear = () => {
    const defaultFiltros = { query: filtros.query, page: 1, ordenar_por: 'recentes' as const };
    setFiltros(defaultFiltros);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header 
        navLinks={navLinks}
        showSearch={false} 
        actions={
          <button 
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsMobileDrawerOpen(true);
              } else {
                setIsFiltrosVisible(!isFiltrosVisible);
              }
            }}
            className="flex items-center gap-2 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-black py-2 px-4 rounded-xl transition-all text-xs active:scale-95 uppercase tracking-widest border border-[var(--accent-primary)]/20 shadow-sm"
          >
            <SlidersHorizontal size={14} strokeWidth={2.5} />
            <span>Filtros</span>
          </button>
        }
      />
      
      <main className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="flex flex-col mb-12">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all group"
            >
              <div className="p-1.5 bg-[var(--input-bg)] group-hover:bg-[var(--accent-primary)]/10 rounded-lg transition-all">
                <ChevronLeft size={16} strokeWidth={3} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Voltar</span>
            </button>

            <div className="h-4 w-px bg-[var(--border-color)]" />

            <div className="flex items-center gap-2 text-[var(--accent-primary)]">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded">Repositório</span>
              <ChevronRight size={12} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Pesquisa Avançada</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-lexend text-[var(--text-primary)] mb-4 tracking-tighter">
            Explorar Trabalhos
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl leading-relaxed font-medium">
            Navegue por pergaminhos acadêmicos, produções literárias e artigos de alta qualidade compartilhados pela comunidade acadêmica.
          </p>
        </div>

        <BarraBusca initialQuery={filtros.query} onSearch={(q) => handleFiltrosChange({ query: q })} />

        <div className="flex flex-col lg:flex-row gap-12 mt-12">
          {/* Sidebar de Filtros (Desktop) */}
          <AnimatePresence mode="wait">
            {isFiltrosVisible && (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                className="hidden lg:block w-[300px] shrink-0 self-start"
              >
                <FiltrosSide 
                  filtros={filtros} 
                  onFiltrosChange={handleFiltrosChange} 
                  onClear={handleClear} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conteúdo Principal */}
          <motion.div layout className="flex-1">
            {!isFiltrosVisible && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden lg:block"
              >
                <FiltrosTopo filtros={filtros} onFiltrosChange={handleFiltrosChange} />
              </motion.div>
            )}
            
            <ListaResultados 
              trabalhos={trabalhos} 
              loading={loading} 
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              meta={meta}
              onPageChange={(page) => setFiltros(prev => ({ ...prev, page }))}
            />
          </motion.div>
        </div>
      </main>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[var(--bg-primary)] z-[60] p-6 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black font-lexend text-[var(--text-primary)]">Filtros Avançados</h2>
                <button 
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2 bg-[var(--input-bg)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              <FiltrosSide 
                filtros={filtros} 
                onFiltrosChange={(f) => { handleFiltrosChange(f); setIsMobileDrawerOpen(false); }} 
                onClear={handleClear} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer Minimalist */}
      <footer className="mt-20 border-t border-[var(--border-color)] py-12 px-6 bg-[var(--bg-card)]">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text-primary)] font-lexend">IFNMG LEITURA</span>
            <span>© 2026 - Repositório Acadêmico.</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[var(--accent-primary)] transition-colors">Sobre</a>
            <a href="#" className="hover:text-[var(--accent-primary)] transition-colors">FAQ</a>
            <a href="#" className="hover:text-[var(--accent-primary)] transition-colors">Privacidade</a>
            <a href="#" className="hover:text-[var(--accent-primary)] transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
