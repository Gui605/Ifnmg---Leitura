//frontend/src/features/perfil/PerfilTabs.tsx
import { useState, useEffect } from 'react';
import PostCard from '../feed/PostCard';
import { getPostsByUserId, getPostsFavoritados } from '../../shared/services/post.service';
import { PostResumo } from '../../shared/types/post.types';
import { Loader2, Scroll, Bookmark, ChevronDown, FileQuestion } from 'lucide-react';

interface PerfilTabsProps {
  userId: number;
  isMeuPerfil: boolean;
}

export default function PerfilTabs({ userId, isMeuPerfil }: PerfilTabsProps) {
  const [activeTab, setActiveTab] = useState<'pergaminhos' | 'salvos'>('pergaminhos');
  const [posts, setPosts] = useState<PostResumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Limpa o estado e reinicia a busca ao trocar de perfil ou aba
  useEffect(() => {
    setPosts([]);
    setPage(1);
    if (userId) {
      fetchPosts(1, true);
    }
  }, [activeTab, userId]);

  const fetchPosts = async (p: number, reset: boolean = false) => {
    if (!userId) return;
    setLoading(true);
    try {
      const result = activeTab === 'pergaminhos' 
        ? await getPostsByUserId(userId, p)
        : await getPostsFavoritados(p);
      
      const newPosts = result.posts || [];

      setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
      setHasMore(result.meta.page < result.meta.totalPages);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerMais = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  return (
    <section className="flex flex-col gap-4">
      <nav className="flex border-b border-[var(--border-color)]/20">
        <button 
          onClick={() => setActiveTab('pergaminhos')} 
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all font-lexend ${
            activeTab === 'pergaminhos' 
              ? 'border-b-2 border-[var(--accent-primary)] text-[var(--accent-primary)]' 
              : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
          }`}
        >
          <Scroll size={16} strokeWidth={1.5} />
          {isMeuPerfil ? "Meus Pergaminhos" : "Pergaminhos"}
        </button>
        {isMeuPerfil && (
          <button 
            onClick={() => setActiveTab('salvos')} 
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all font-lexend ${
              activeTab === 'salvos' 
                ? 'border-b-2 border-[var(--accent-primary)] text-[var(--accent-primary)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
            }`}
          >
            <Bookmark size={16} strokeWidth={1.5} />
            Salvos
          </button>
        )}
      </nav>

      <div className="flex flex-col gap-4">
        {posts.map(post => (
          <div key={post.post_id} className="hover:border-[var(--accent-primary)]/30 transition-all border border-transparent rounded-2xl">
            <PostCard 
              post={post} 
              disableProfileLink={true}
            />
          </div>
        ))}

        {loading && (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-[var(--accent-primary)]" size={32} strokeWidth={1.5} />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center text-[var(--text-secondary)] p-12 bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border-color)]/20 font-lexend gap-3">
            <FileQuestion size={48} className="opacity-20 text-[var(--accent-primary)]" strokeWidth={1.5} />
            <div className="max-w-xs">
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {activeTab === 'pergaminhos' 
                  ? (isMeuPerfil ? "Você ainda não publicou nenhum pergaminho." : "Este acadêmico ainda não publicou nenhum pergaminho.")
                  : "Você ainda não favoritou nenhum pergaminho."}
              </p>
              <p className="text-xs opacity-60 mt-1">
                {activeTab === 'pergaminhos' 
                  ? "Compartilhe seu conhecimento para começar sua jornada!"
                  : "Explore o feed e salve os melhores estudos para ler depois."}
              </p>
            </div>
          </div>
        )}

        {hasMore && !loading && (
          <button 
            onClick={handleVerMais}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[var(--accent-primary)]/20 py-3 font-bold text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 transition-all font-lexend"
          >
            <ChevronDown size={20} strokeWidth={1.5} />
            Ver Mais Pergaminhos
          </button>
        )}
      </div>
    </section>
  );
}
