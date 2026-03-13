//frontend/src/features/dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Notificacao } from '../../shared/utils/Notificacao';
import { PerfilResumo } from '../../shared/types/perfil.types';
import { PostResumo } from '../../shared/types/post.types';
import { getMeuPerfil } from '../../shared/services/perfil.service';
import { getFeed } from '../../shared/services/post.service';
import { useTema } from '../../shared/utils/themeHandler';
import { 
  Menu, X, Sun, Moon, Layout, Columns, 
  Sidebar as SidebarIcon, Search, PenLine, 
  BookOpen, Compass, Users as UsersIcon, Plus,
  Medal, TrendingUp as TrendingUpIcon, Home,
  PanelLeft, PanelRight, Bookmark, Settings,
  Bell
} from 'lucide-react';
import Feed from '../feed/Feed';
import TrendingTags from '../feed/TrendingTags';
import SuggestedUsers from '../feed/SuggestedUsers';

export default function Dashboard() {
  const [perfil, setPerfil] = useState<PerfilResumo | null>(null);
  const [feed, setFeed] = useState<PostResumo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados de Visibilidade do Layout (Holy Grail Dinâmico)
  const [isLeftVisible, setIsLeftVisible] = useState(true);
  const [isRightVisible, setIsRightVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);

  const { modoEscuro, alternarTema } = useTema();

  useEffect(() => {
    // --- MOCK MODE: Forçando estados para validação visual ---
    setPerfil({
      nome_user: "Guilherme_Dev",
      is_admin: true,
      score_karma: 1250,
      reading_points: 850
    });

    setFeed([{
      post_id: 1,
      titulo: "O Amanhecer no Bloco A: Uma Crônica Acadêmica",
      conteudo: "Entre o aroma de café recém-passado e os sussurros da biblioteca, descobri que a vida universitária é escrita nos intervalos...",
      autor_id: 1,
      autor_nome_user: "Anônimo",
      total_upvotes: 124,
      total_downvotes: 0,
      total_comentarios: 18,
      tags: ["CRÔNICA", "VIDANOCAMPUS", "IFNMG"]
    }]);

    setErro(null);
    setLoading(false);

    /* Chamadas reais comentadas para o Modo Mock
    let cancelado = false;
    (async () => {
      try {
        const [p, f] = await Promise.all([getMeuPerfil(), getFeed()]);
        if (!cancelado) {
          setPerfil(p);
          setFeed(f);
          setErro(null);
        }
      } catch (err: any) {
        if (!cancelado) {
          const status = err?.status;
          if (status === 401) {
            setErro('Sessão expirada.');
          } else {
            setErro(err?.message || 'Erro ao carregar dados do servidor.');
          }
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
    */
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      {}
      <header className="sticky top-0 z-50 w-full h-16 bg-[var(--bg-card)]/80 border-b border-[var(--accent-primary)]/10 px-4 md:px-10 flex items-center justify-between shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-8 flex-1">
          {/* Logo e Mobile Menu */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-[var(--input-bg)] rounded-lg md:hidden transition-colors"
              title="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2 text-[var(--accent-primary)]">
              <BookOpen size={28} />
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] hidden sm:block">IFNMG LEITURA</h1>
            </div>
          </div>

          {/* Busca Acadêmica (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-primary)]" size={18} />
              <input 
                className="w-full bg-[var(--input-bg)] border-none focus:ring-2 focus:ring-[var(--accent-primary)] rounded-lg py-2 pl-10 pr-4 text-sm transition-all" 
                placeholder="Buscar pergaminhos acadêmicos..." 
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Navegação Centralizada à Direita */}
        <div className="flex items-center gap-4 md:gap-8">
          <nav className="hidden lg:flex items-center gap-6">
            <a className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80 transition-colors" href="#">Início</a>
            <a className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors" href="#">Explorar</a>
            <a className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors" href="#">Comunidade</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Botão Escrever */}
            <button className="hidden sm:flex items-center gap-2 bg-[var(--accent-primary)] hover:opacity-90 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm">
              <PenLine size={16} />
              <span>Escrever</span>
            </button>

            {/* Menu de Estrutura Inteligente */}
            <div className="relative">
              <button 
                onMouseEnter={() => setIsLayoutMenuOpen(true)}
                onMouseLeave={() => setIsLayoutMenuOpen(false)}
                className="p-2 hover:bg-[var(--input-bg)] rounded-lg transition-colors text-[var(--text-secondary)]"
                title="Estrutura de Colunas"
              >
                <Layout size={20} />
              </button>
              
              {isLayoutMenuOpen && (
                <div 
                  onMouseEnter={() => setIsLayoutMenuOpen(true)}
                  onMouseLeave={() => setIsLayoutMenuOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl p-2 z-[60]"
                >
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider px-3 py-2">Visualização</p>
                  <button 
                    onClick={() => setIsLeftVisible(!isLeftVisible)}
                    className="w-full flex items-center justify-between p-2 hover:bg-[var(--input-bg)] rounded-lg text-sm transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <PanelLeft size={16} /> Sidebar Esquerda
                    </div>
                    {isLeftVisible && <Plus size={14} className="rotate-45 text-[var(--accent-primary)]" />}
                  </button>
                  <button 
                    onClick={() => setIsRightVisible(!isRightVisible)}
                    className="w-full flex items-center justify-between p-2 hover:bg-[var(--input-bg)] rounded-lg text-sm transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <PanelRight size={16} /> Sidebar Direita
                    </div>
                    {isRightVisible && <Plus size={14} className="rotate-45 text-[var(--accent-primary)]" />}
                  </button>
                  <div className="h-px bg-[var(--border-color)] my-1 mx-2" />
                  <button 
                    onClick={() => { setIsLeftVisible(false); setIsRightVisible(false); }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-[var(--color-if-red)]/10 rounded-lg text-sm transition-colors text-[var(--color-if-red)]"
                  >
                    <BookOpen size={16} /> Modo Foco (Ocultar Tudo)
                  </button>
                </div>
              )}
            </div>

            {/* Tema e Avatar */}
            <button 
              onClick={alternarTema}
              className="p-2 hover:bg-[var(--input-bg)] rounded-lg transition-colors text-[var(--text-secondary)]"
              title="Alternar Tema"
            >
              {modoEscuro ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20 border-2 border-[var(--accent-primary)] flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform">
              <img 
                className="w-full h-full object-cover" 
                alt="User profile" 
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${perfil?.nome_user || 'Felix'}&backgroundColor=b6e3f4`}
              />
            </div>
          </div>
        </div>
      </header>

      <main className={`
        max-w-[1400px] mx-auto px-4 md:px-10 py-8 grid gap-8 transition-all duration-500 ease-in-out
        ${isLeftVisible && isRightVisible ? 'md:grid-cols-[260px,1fr,320px]' : 
          isLeftVisible ? 'md:grid-cols-[260px,1fr]' : 
          isRightVisible ? 'md:grid-cols-[1fr,320px]' : 'grid-cols-1'}
      `}>
        {/* Painel Esquerdo (Navegação & Perfil) */}
        <aside className={`${isLeftVisible ? 'block' : 'hidden'} shrink-0 hidden md:block space-y-8 sticky top-24 h-fit`}>
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow-elevation-1)] border border-[var(--border-color)] p-2">
            <nav className="flex flex-col gap-1">
              <SidebarLink href="#" icon={<Home size={20} strokeWidth={2} />} label="Feed" active />
              <SidebarLink href="#" icon={<Compass size={20} strokeWidth={2} />} label="Explorar" />
              <SidebarLink href="#" icon={<Bell size={20} strokeWidth={2} />} label="Notificações" />
              <SidebarLink href="#" icon={<UsersIcon size={20} strokeWidth={2} />} label="Comunidade" />
              <SidebarLink href="#" icon={<Bookmark size={20} strokeWidth={2} />} label="Salvos" />
              <SidebarLink href="#" icon={<BookOpen size={20} strokeWidth={2} />} label="Biblioteca" />
              <SidebarLink href="#" icon={<Settings size={20} strokeWidth={2} />} label="Configurações" />
            </nav>
          </div>

          <div className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow-elevation-1)] border border-[var(--border-color)] px-5 py-6">
            <div className="flex items-center gap-3 mb-6">
              <Medal className="text-[var(--accent-primary)]" size={24} strokeWidth={2.5} />
              <h2 className="font-bold text-lg text-[var(--text-primary)] tracking-tight">Meu Progresso</h2>
            </div>
            <GamificationPanel perfil={perfil} />
          </div>
        </aside>

        {/* Feed Central */}
        <section className={`
          flex-1 mx-auto w-full pb-24 md:pb-0 transition-all duration-500
          ${(!isLeftVisible && !isRightVisible) ? 'max-w-3xl' : 'max-w-2xl'}
        `}>
          <Feed posts={feed} loading={loading} />
        </section>

        {/* Painel Direito (Sticky no Desktop) */}
        <aside className={`${isRightVisible ? 'block' : 'hidden'} shrink-0 hidden lg:block space-y-6 sticky top-24 h-fit`}>
          <TrendingTags />
          <SuggestedUsers />
        </aside>
      </main>

      {/* Mobile Bottom Navigation EscrevAí */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-card)] border-t border-[var(--border-color)] flex items-center justify-around px-4 md:hidden z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button className="p-2 text-[var(--accent-primary)]"><Home size={24} /></button>
        <button className="p-2 text-[var(--text-secondary)]"><Compass size={24} /></button>
        
        {/* Botão Flutuante Central */}
        <div className="relative -top-6">
          <button className="w-14 h-14 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/40 active:scale-90 transition-transform border-4 border-[var(--bg-primary)]">
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        <button className="p-2 text-[var(--text-secondary)]"><UsersIcon size={24} /></button>
        <button className="p-2 text-[var(--text-secondary)]"><PenLine size={24} /></button>
      </nav>
    </div>
  );
}

function Sidebar({ perfil }: { perfil: PerfilResumo | null }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 p-2 bg-[var(--input-bg)] rounded-xl">
        <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center text-white font-bold text-lg">
          {perfil?.nome_user?.charAt(0).toUpperCase() ?? '?'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold truncate text-[var(--text-primary)]">@{perfil?.nome_user ?? '...'}</span>
          <span className="text-xs text-[var(--text-secondary)]">{perfil?.is_admin ? 'Administrador' : 'Estudante'}</span>
        </div>
      </div>
      
      <nav className="flex flex-col gap-1">
        <SidebarLink href="#" icon={<Home size={20} />} label="Feed" active />
        <SidebarLink href="#" icon={<Compass size={20} />} label="Explorar" />
        <SidebarLink href="#" icon={<UsersIcon size={20} />} label="Comunidade" />
        <SidebarLink href="#" icon={<BookOpen size={20} />} label="Biblioteca" />
      </nav>

      <button className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white bg-[var(--accent-primary)] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
        <span>Novo Post</span>
      </button>
    </div>
  );
}

function SidebarLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a 
      href={href} 
      className={`
        flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 text-[15px]
        ${active 
          ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold' 
          : 'text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/5 hover:text-[var(--accent-primary)]'}
      `}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

function LoadingSkeleton({ count = 1, height = "20px" }: { count?: number, height?: string }) {
  return (
    <div className="space-y-3 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[var(--input-bg)] rounded-lg w-full" style={{ height }} />
      ))}
    </div>
  );
}



function GamificationPanel({ perfil }: { perfil: PerfilResumo | null }) {
  const karma = Math.max(0, Math.min(100, Math.round((perfil?.score_karma ?? 0) % 101)));
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between items-start">
        <div>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1">Nível Atual</p>
          <div className="flex items-center gap-2">
            <span className="text-4x2 font-black text-[var(--text-primary)]">Nível 12</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--accent-primary)] font-bold">Mestre Acadêmico</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-3 w-full rounded-full bg-[var(--accent-primary)]/10 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out bg-[var(--accent-primary)]" 
            style={{ width: `${karma}%` }} 
          />
        </div>
      </div>

      <div className="flex justify-between items-center bg-[var(--accent-primary)]/5 p-3 rounded-xl border border-[var(--accent-primary)]/10">
        <div className="flex flex-col">
          <span className="text-[10px] text-[var(--text-secondary)] font-medium">Total acumulado</span>
          <span className="text-sm font-bold text-[var(--text-primary)]">{perfil?.score_karma?.toLocaleString() ?? '0'} XP</span>
        </div>
        <TrendingUpIcon size={18} strokeWidth={2.5} className="text-[var(--accent-primary)]" />
      </div>
    </div>
  );
}