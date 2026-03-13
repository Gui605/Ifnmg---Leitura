// frontend/src/features/feed/Feed.tsx

import React, { useEffect, useState } from 'react';
import { Notificacao } from '../../shared/utils/Notificacao';
import { PerfilResumo } from '../../shared/types/perfil.types';
import { PostResumo } from '../../shared/types/post.types';
import { getMeuPerfil } from '../../shared/services/perfil.service';
import { getFeed } from '../../shared/services/post.service';
import { useTema } from '../../shared/utils/themeHandler';

import {
  Menu,
  X,
  Sun,
  Moon,
  Layout,
  Search,
  PenLine,
  BookOpen,
  Compass,
  Users as UsersIcon,
  Plus,
  Medal,
  TrendingUp as TrendingUpIcon,
  Home,
  PanelLeft,
  PanelRight,
  Bookmark,
  Settings,
  Bell
} from 'lucide-react';

import PostCard from './PostCard';
import QuickPost from './QuickPost';
import TrendingTags from './TrendingTags';
import SuggestedUsers from './SuggestedUsers';

export default function Feed() {

  const [perfil, setPerfil] = useState<PerfilResumo | null>(null);
  const [posts, setPosts] = useState<PostResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [isLeftVisible, setIsLeftVisible] = useState(true);
  const [isRightVisible, setIsRightVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);

  const { modoEscuro, alternarTema } = useTema();

  useEffect(() => {

    // --- MOCK MODE (para validação visual) ---

    setPerfil({
      nome_user: "Guilherme_Dev",
      is_admin: true,
      score_karma: 1250,
      reading_points: 850
    });

    setPosts([
      {
        post_id: 1,
        titulo: "O Amanhecer no Bloco A: Uma Crônica Acadêmica",
        conteudo:
          "Entre o aroma de café recém-passado e os sussurros da biblioteca...",
        autor_id: 1,
        autor_nome_user: "Anônimo",
        nome_campus: "Araçuaí",
        data_criacao: new Date().toISOString(),
        total_upvotes: 124,
        total_downvotes: 0,
        total_comentarios: 18,
        tags: ["CRONICA", "VIDANOCAMPUS", "IFNMG"]
      }
    ]);

    setErro(null);
    setLoading(false);

    /*
    // --- MODO REAL (DESCOMENTAR QUANDO BACKEND ESTIVER PRONTO) ---

    let cancelado = false;

    async function carregarDados() {
      try {

        const [perfilData, feedData] = await Promise.all([
          getMeuPerfil(),
          getFeed()
        ]);

        if (!cancelado) {
          setPerfil(perfilData);
          setPosts(feedData);
          setErro(null);
        }

      } catch (err: any) {

        if (!cancelado) {

          const status = err?.status;

          if (status === 401) {
            setErro('Sessão expirada.');
          } else {
            setErro(err?.message || 'Erro ao carregar dados.');
          }

        }

      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    carregarDados();

    return () => {
      cancelado = true;
    };

    */

  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const gridConfig = !isLeftVisible && !isRightVisible 
    ? 'grid-cols-1' 
    : isLeftVisible && isRightVisible 
      ? 'md:grid-cols-[260px,1fr,320px]' 
      : isLeftVisible 
        ? 'md:grid-cols-[260px,1fr]' 
        : 'md:grid-cols-[1fr,320px]';

  return (

    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 font-sans">

      {/* HEADER */}

      <header className="sticky top-0 z-50 w-full h-16 bg-[var(--bg-card)] border-b border-[var(--accent-primary)]/10 px-4 md:px-10 flex items-center justify-between shadow-sm backdrop-blur-md">

        <div className="flex items-center gap-8 flex-1">

          {/* Logo */}

          <div className="flex items-center gap-4">

            <button
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-[var(--input-bg)] rounded-lg md:hidden transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center gap-2 text-[var(--accent-primary)]">
              <BookOpen size={28} />
              <h1 className="text-base font-bold tracking-tight text-[var(--text-primary)] hidden sm:block">
                IFNMG LEITURA
              </h1>
            </div>

          </div>

          {/* BUSCA */}

          <div className="hidden md:flex flex-1 max-w-md">

            <div className="relative w-full">

              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-primary)]"
                size={18}
              />

              <input
                type="text"
                placeholder="Buscar pergaminhos acadêmicos..."
                className="w-full bg-[var(--input-bg)] rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--accent-primary)] border-none"
              />

            </div>

          </div>

        </div>

        {/* MENU DIREITA */}

        <div className="flex items-center gap-4 md:gap-8">

          <nav className="hidden lg:flex items-center gap-6">

            <a className="text-sm font-medium text-[var(--text-primary)]">
              Início
            </a>

            <a className="text-sm font-medium text-[var(--text-primary)]">
              Explorar
            </a>

            <a className="text-sm font-medium text-[var(--text-primary)]">
              Comunidade
            </a>

          </nav>

          <button className="hidden sm:flex items-center gap-2 bg-[var(--accent-primary)] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
            <PenLine size={16} />
            Escrever
          </button>

          {/* MENU LAYOUT */}

          <div className="relative">

            <button
              onMouseEnter={() => setIsLayoutMenuOpen(true)}
              onMouseLeave={() => setIsLayoutMenuOpen(false)}
              className="p-2 hover:bg-[var(--input-bg)] rounded-lg text-[var(--text-secondary)]"
            >
              <Layout size={20} />
            </button>

            {isLayoutMenuOpen && (

              <div
                onMouseEnter={() => setIsLayoutMenuOpen(true)}
                onMouseLeave={() => setIsLayoutMenuOpen(false)}
                className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl p-2 z-50"
              >
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider px-3 py-2">Visualização</p>
                <button
                  onClick={() => setIsLeftVisible(!isLeftVisible)}
                  className="w-full flex items-center justify-between p-2 hover:bg-[var(--input-bg)] rounded-lg text-sm transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <PanelLeft size={16} />
                    Sidebar Esquerda
                  </div>

                  {isLeftVisible && <Plus size={14} className="rotate-45" />}
                </button>

                <button
                  onClick={() => setIsRightVisible(!isRightVisible)}
                  className="w-full flex items-center justify-between p-2 hover:bg-[var(--input-bg)] rounded-lg text-sm transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <PanelRight size={16} />
                    Sidebar Direita
                  </div>

                  {isRightVisible && <Plus size={14} className="rotate-45" />}
                </button>

                <div className="h-px bg-[var(--border-color)] my-1 mx-2" />
                <button 
                  onClick={() => {
                    const nextState = !(!isLeftVisible && !isRightVisible);
                    setIsLeftVisible(!nextState);
                    setIsRightVisible(!nextState);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${(!isLeftVisible && !isRightVisible) ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]' : 'hover:bg-[var(--color-if-red)]/10 text-[var(--color-if-red)]'}`}
                >
                  <BookOpen size={16} /> 
                  {(!isLeftVisible && !isRightVisible) ? 'Mostrar Sidebars' : 'Modo Foco (Ocultar Tudo)'}
                </button>

              </div>

            )}

          </div>

          {/* TEMA */}

          <button
            onClick={alternarTema}
            className="p-2 hover:bg-[var(--input-bg)] rounded-lg text-[var(--text-secondary)]"
          >
            {modoEscuro ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* AVATAR */}

          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--accent-primary)] cursor-pointer hover:scale-105 transition-transform">

            <img
              className="w-full h-full object-cover"
              alt="User"
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${perfil?.nome_user || 'user'}&backgroundColor=b6e3f4`}
            />

          </div>

        </div>

      </header>

      {/* LAYOUT */}

      <main
        className={`
        max-w-[1400px] mx-auto px-4 md:px-10 py-8 grid gap-8 transition-all duration-500 ease-in-out
        ${gridConfig}
      `}
      >

        {/* LEFT SIDEBAR */}

        {isLeftVisible && (

          <aside className="hidden md:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide space-y-8 transition-all duration-500 py-8">

            <div className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow-elevation-1)] border border-[var(--border-color)] p-2">

              <nav className="flex flex-col gap-1">

                <SidebarLink icon={<Home size={20} strokeWidth={2} />} label="Feed" active />
                <SidebarLink icon={<Compass size={20} strokeWidth={2} />} label="Explorar" />
                <SidebarLink icon={<Bell size={20} strokeWidth={2} />} label="Notificações" />
                <SidebarLink icon={<UsersIcon size={20} strokeWidth={2} />} label="Comunidade" />
                <SidebarLink icon={<Bookmark size={20} strokeWidth={2} />} label="Salvos" />
                <SidebarLink icon={<BookOpen size={20} strokeWidth={2} />} label="Biblioteca" />
                <SidebarLink icon={<Settings size={20} strokeWidth={2} />} label="Configurações" />

              </nav>

            </div>

            <GamificationPanel perfil={perfil} />

          </aside>

        )}

        {/* FEED */}

        <section className={`
          flex-1 w-full pb-24 md:pb-0 transition-all duration-500
          ${(!isLeftVisible && !isRightVisible) ? 'max-w-3xl mx-auto' : 'max-w-2xl mx-auto'}
        `}>
          <div className="flex flex-col gap-6">
            
            {/* Quick Post */}
            <QuickPost />

            {/* Loading */}
            {loading && (
              <div className="flex flex-col gap-6">
                <div className="h-20 bg-[var(--bg-card)] rounded-2xl animate-pulse border border-[var(--border-color)]" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-[var(--bg-card)] rounded-2xl animate-pulse border border-[var(--border-color)]" />
                ))}
              </div>
            )}

            {/* Feed vazio */}
            {!loading && posts.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-[var(--text-primary)]">
                  Nenhum pergaminho encontrado ainda.
                </p>
              </div>
            )}

            {/* Posts */}
            {!loading && posts.map((post) => (
              <PostCard key={post.post_id} post={post} />
            ))}
          </div>
        </section>

        {/* RIGHT SIDEBAR */}

        {isRightVisible && (

          <aside className="hidden lg:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide space-y-6 transition-all duration-500 py-8">
          
            <TrendingTags />
            <SuggestedUsers />

          </aside>

        )}

      </main>

    </div>
  );
}

function SidebarLink({
  icon,
  label,
  active = false
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {

  return (
    <button
      className={`
        flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition
        ${
          active
            ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold'
            : 'text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/5'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function GamificationPanel({ perfil }: { perfil: PerfilResumo | null }) {

  const karma = Math.max(
    0,
    Math.min(100, Math.round((perfil?.score_karma ?? 0) % 101))
  );

  return (

    <div className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow-elevation-1)] border border-[var(--border-color)] p-6 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <Medal className="text-[var(--accent-primary)]" size={24} strokeWidth={2.5} />
        <h2 className="font-bold text-lg text-[var(--text-primary)] tracking-tight">
          Meu Progresso
        </h2>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-0.5">
            Nível Atual
          </p>
          <p className="text-3sm font-black text-[var(--text-primary)] leading-none">
            Nível 12
          </p>
        </div>
          <div className="text-right">
            <p className="text-xs text-[var(--accent-primary)] font-bold">
              Mestre Acadêmico
            </p>
          </div>
        </div>

        <div className="w-full bg-[var(--accent-primary)]/5 h-3 rounded-full overflow-hidden p-0.5 border border-[var(--border-camp)/10]">
          <div 
            className="bg-[var(--accent-primary)] h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(26,128,57,0.2)]" 
            style={{ width: `${karma}%` }}>

          </div>
        </div>

        <div className="flex justify-between items-center bg-[var(--input-bg)] p-3 rounded-xl border border-[var(--border-color)] transition-colors">
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider">
              Total acumulado
            </span>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              {perfil?.score_karma?.toLocaleString() ?? '0'} XP
            </span>
          </div>
          <TrendingUpIcon size={18} strokeWidth={2.5} className="text-[var(--accent-primary)]" />
        </div>
      </div>
    </div>
  );
}
