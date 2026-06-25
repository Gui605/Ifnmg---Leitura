// frontend/src/features/feed/Feed.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../shared/utils/authContext';
import { PerfilResumo } from '../../shared/types/perfil.types';
import { PostResumo } from '../../shared/types/post.types';
import { getMeuPerfil } from '../../shared/services/perfil.service';
import { getPosts } from '../../shared/services/post.service';
import Header from '../../shared/components/Header';

import {
  Compass,
  Users as UsersIcon,
  Medal,
  TrendingUp as TrendingUpIcon,
  Home,
  Bookmark,
  Settings,
  Bell,
  PenLine,
  BookOpen
} from 'lucide-react';

import PostCard from './PostCard';
import QuickPost from './QuickPost';
import TrendingTags from './TrendingTags';
import SuggestedUsers from './SuggestedUsers';
import { ProgressBarXP, getPatentePorNivel } from '../../shared/components/ProgressBarXP';

export default function Feed() {
  const navigate = useNavigate();
  const { perfil: perfilAuth } = useAuth();
  const [perfilLocal, setPerfilLocal] = useState<PerfilResumo | null>(null);
  const [posts, setPosts] = useState<PostResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [isLeftVisible, setIsLeftVisible] = useState(true);
  const [isRightVisible, setIsRightVisible] = useState(true);

  // Prioriza o perfil do AuthContext para reatividade global
  const perfil = perfilAuth || perfilLocal;

  // Carregamento Inicial 
  useEffect(() => {
    let cancelado = false;

    async function carregarInicial() {
      try {
        const [perfilData, feedData] = await Promise.all([
          getMeuPerfil(),
          getPosts({ page: 1 })
        ]);

        if (!cancelado) {
          setPerfilLocal(perfilData);
          setPosts(feedData.posts);
          setHasMore(feedData.meta.page < feedData.meta.totalPages);
          setErro(null);
        }
      } catch (err: any) {
        if (!cancelado) {
          setErro(err?.message || 'Erro ao carregar dados iniciais.');
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    carregarInicial();
    return () => { cancelado = true; };
  }, []);

  // Lógica de rolagem infinita
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;

      // Abordagem cross-browser resiliente a viewports móveis
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );

      // Dispara o carregamento quando o usuário rolar até 85% da página
      if (scrollTop + windowHeight >= docHeight - 250) {
        carregarMais();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, hasMore, page]);

  async function carregarMais() {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const feedData = await getPosts({ page: nextPage });
      setPosts(prev => [...prev, ...feedData.posts]);
      setPage(nextPage);
      setHasMore(feedData.meta.page < feedData.meta.totalPages);
    } catch (err: any) {
      console.error("Erro ao carregar mais posts:", err);
    } finally {
      setLoadingMore(false);
    }
  }

  const gridConfig = !isLeftVisible && !isRightVisible 
    ? 'grid-cols-1' 
    : isLeftVisible && isRightVisible 
      ? 'md:grid-cols-[260px,1fr,320px]' 
      : isLeftVisible 
        ? 'md:grid-cols-[260px,1fr]' 
        : 'md:grid-cols-[1fr,320px]';

  const navLinks = [
    { label: 'Explorar', path: '/explorar' },
    { label: 'Notificações', path: '/notificacoes' },
    { label: 'Comunidade', path: '/comunidade' },
    { label: 'Salvos', path: '/salvos' },
    { label: 'Minhas Obras', path: '/minhas-obras' },
    { label: 'Configurações', path: '/configuracoes/perfil' }
  ];

  const headerActions = (
    <button 
      onClick={() => navigate('/escrever')}
      className="hidden sm:flex items-center gap-2 bg-[var(--accent-primary)] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
    >
      <PenLine size={16} />
      Escrever
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 font-sans">
      <Header 
        perfil={perfil}
        showSearch={true}
        hideBack={true}
        navLinks={navLinks}
        actions={headerActions}
        toggleLeft={() => setIsLeftVisible(!isLeftVisible)}
        toggleRight={() => setIsRightVisible(!isRightVisible)}
        isLeftVisible={isLeftVisible}
        isRightVisible={isRightVisible}
      />

      {/* Layout */}
      <main
        className={`
        max-w-[1400px] mx-auto px-4 md:px-10 py-8 grid gap-8 transition-all duration-500 ease-in-out
        ${gridConfig}
      `}
      >

        {/* Left Sidebar */}
        {isLeftVisible && (
          <aside className="hidden md:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide space-y-8 transition-all duration-500 py-8">
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow-elevation-1)] border border-[var(--border-color)] p-2">
              <nav className="flex flex-col gap-1">
                <SidebarLink icon={<Home size={20} strokeWidth={2} />} label="Feed" active />
                <SidebarLink icon={<Compass size={20} strokeWidth={2} />} label="Explorar" to="/explorar" />
                <SidebarLink icon={<Bell size={20} strokeWidth={2} />} label="Notificações" to="/notificacoes" disabled={true} />
                <SidebarLink icon={<UsersIcon size={20} strokeWidth={2} />} label="Comunidade" to="/comunidade" disabled={true} />
                <SidebarLink icon={<Bookmark size={20} strokeWidth={2} />} label="Salvos" to="/salvos" disabled={true} />
                <SidebarLink icon={<BookOpen size={20} strokeWidth={2} />} label="Minhas Obras" to="/minhas-obras" />
                <SidebarLink 
                  icon={<Settings size={20} strokeWidth={2} />} 
                  label="Configurações" 
                  onClick={() => navigate('/configuracoes/perfil')}
                />
              </nav>
            </div>
            <GamificationPanel perfil={perfil} />
          </aside>
        )}

        {/* Feed */}
        <section className={`
          flex-1 w-full pb-24 md:pb-0 transition-all duration-500
          ${(!isLeftVisible && !isRightVisible) ? 'max-w-3xl mx-auto' : 'max-w-2xl mx-auto'}
        `}>
          <div className="flex flex-col gap-6">
            
            {/* Quick Post */}
            <QuickPost />

            {/* Erro */}
            {erro && (
              <div className="p-4 bg-[var(--color-if-red)]/10 text-[var(--color-if-red)] rounded-xl border border-[var(--color-if-red)]/20 text-center text-sm font-bold">
                {erro}
              </div>
            )}

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

            {/* Botão de contingência para rolagem manual */}
            {!loading && !loadingMore && hasMore && posts.length > 0 && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => carregarMais()}
                  className="bg-[var(--bg-card)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 hover:bg-[var(--accent-primary)]/10 font-bold font-lexend text-sm px-6 py-2.5 rounded-xl transition-all duration-300 shadow-sm w-full sm:w-auto"
                >
                  Carregar mais pergaminhos
                </button>
              </div>
            )}

           
            {loadingMore && (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Fim do Feed */}
            {!hasMore && posts.length > 0 && (
              <div className="p-10 text-center text-[var(--text-secondary)] text-sm italic">
                Você chegou ao fim dos pergaminhos.
              </div>
            )}
          </div>
        </section>

        {/* Sidebar da direita */}
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
  to,
  active = false,
  onClick,
  disabled = false
}: {
  icon: React.ReactNode;
  label: string;
  to?: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = active || (to && location.pathname === to);

  const handleClick = () => {
    if (disabled) return; 
    if (onClick) onClick();
    if (to) navigate(to);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }} 
      className={`
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full
      ${disabled 
        ? 'opacity-45 text-[var(--text-secondary)] select-none' 
        : isActive 
          ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold' 
          : 'text-[var(--text-secondary)] hover:bg-[var(--input-bg)] hover:text-[var(--text-primary)]'}
    `}
    >
      <span className={isActive ? 'text-[var(--accent-primary)]' : ''}>
        {icon}
      </span>
      <span className="text-sm font-lexend">{label}</span>
    </button>
  );
}

function GamificationPanel({ perfil }: { perfil: PerfilResumo | null }) {
  if (!perfil) return null;

  const patente = perfil.titulo_ativo || getPatentePorNivel(perfil.level);

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow-elevation-1)] border border-[var(--border-color)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--accent-primary)]">
          <TrendingUpIcon size={18} />
          <span className="text-xs font-bold font-lexend uppercase tracking-wider">Progresso</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-[var(--input-bg)] rounded-full text-[var(--text-secondary)]">
          NÍVEL {perfil.level}
        </span>
      </div>

      <div className="space-y-3">
        <ProgressBarXP xp={perfil.xp} level={perfil.level} />
      </div>

      <div className="pt-2 border-t border-[var(--border-color)]/10 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-tighter">Patente Atual</span>
          <span className="text-xs font-bold text-[var(--text-primary)] font-lexend">{patente}</span>
        </div>
        <div className="size-8 bg-[var(--accent-primary)]/10 rounded-lg flex items-center justify-center text-[var(--accent-primary)]">
          <Medal size={18} />
        </div>
      </div>
    </div>
  );
}
