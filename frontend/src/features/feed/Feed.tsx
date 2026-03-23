// frontend/src/features/feed/Feed.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function Feed() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilResumo | null>(null);
  const [posts, setPosts] = useState<PostResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [isLeftVisible, setIsLeftVisible] = useState(true);
  const [isRightVisible, setIsRightVisible] = useState(true);

  // 1. Carregamento Inicial (Perfil + Primeira Página)
  useEffect(() => {
    let cancelado = false;

    async function carregarInicial() {
      try {
        const [perfilData, feedData] = await Promise.all([
          getMeuPerfil(),
          getPosts(1)
        ]);

        if (!cancelado) {
          setPerfil(perfilData);
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

  // 2. Lógica de Infinite Scroll (Scroll Listener)
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Se chegar a 100px do fim da página, carrega mais
      if (scrollTop + clientHeight >= scrollHeight - 100) {
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
      const feedData = await getPosts(nextPage);
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
    { label: 'Início', path: '/dashboard' },
    { label: 'Explorar', path: '/explorar' },
    { label: 'Comunidade', path: '/comunidade' }
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
        navLinks={navLinks}
        actions={headerActions}
        toggleLeft={() => setIsLeftVisible(!isLeftVisible)}
        toggleRight={() => setIsRightVisible(!isRightVisible)}
        isLeftVisible={isLeftVisible}
        isRightVisible={isRightVisible}
      />

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

        {/* FEED */}
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
              <PostCard key={post.post_id} post={{
                ...post,
                autor_nome_user: post.autor_nome_user ?? "Usuario Desativado"
              }} />
            ))}

            {/* Loading More Indicator */}
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
  active = false,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full
      ${active 
        ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold' 
        : 'text-[var(--text-secondary)] hover:bg-[var(--input-bg)] hover:text-[var(--text-primary)]'}
    `}
    >
      <span className={active ? 'text-[var(--accent-primary)]' : ''}>
        {icon}
      </span>
      <span className="text-sm font-lexend">{label}</span>
    </button>
  );
}

function GamificationPanel({ perfil }: { perfil: PerfilResumo | null }) {
  if (!perfil) return null;

  const xpPercent = Math.min(100, (perfil.xp / (perfil.level * 1000)) * 100);

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

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
          <span className="text-[var(--text-secondary)]">Experiência</span>
          <span className="text-[var(--accent-primary)]">{perfil.xp} / {perfil.level * 1000} XP</span>
        </div>
        <div className="h-2 bg-[var(--input-bg)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--accent-primary)] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(26,128,57,0.3)]"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--border-color)]/10 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-tighter">Patente Atual</span>
          <span className="text-xs font-bold text-[var(--text-primary)] font-lexend">{perfil.titulo_ativo || 'Calouro'}</span>
        </div>
        <div className="size-8 bg-[var(--accent-primary)]/10 rounded-lg flex items-center justify-center text-[var(--accent-primary)]">
          <Medal size={18} />
        </div>
      </div>
    </div>
  );
}
