//frontend/src/features/feed/PostCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Book, CheckCircle2, UserX } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { PostResumo } from "../../shared/types/post.types";
import PostActions from "./PostActions";
import TagList from "./TagList";

interface Props {
  post: PostResumo;
  disableProfileLink?: boolean;
}

function formatarTempo(dataStr?: string | Date) {
  if (!dataStr) return "agora pouco";
  const data = new Date(dataStr);
  const diff = Date.now() - data.getTime();
  const minutos = Math.floor(diff / 60000);
  const horas = Math.floor(minutos / 60) ;
  const dias = Math.floor(horas / 24);

  if (minutos < 1) return "agora pouco";
  if (minutos < 60) return `${minutos}min atrás`;
  if (horas < 24) return `${horas}h atrás`;
  return `${dias}d atrás`;
}

export default function PostCard({ post, disableProfileLink = false }: Props) {
  const tempoPost = formatarTempo(post.data_criacao);

  const ProfileLink = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    if (disableProfileLink || !post.autor_id || post.autor_display?.deletado) {
      return <div className={className}>{children}</div>;
    }
    return (
      <Link to={`/perfil/${post.autor_id}`} className={className}>
        {children}
      </Link>
    );
  };

  return (
    <article className="group bg-[var(--bg-card)] border border-[var(--input-bg)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">

      <div className="p-6">

        {/* Breadcrumb de Obra */}
        {post.obra && (
          <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]/60">
            <Book size={14} />
            <Link to={`/obras/${post.obra_id}`} className="hover:text-[var(--accent-primary)] transition-colors">
              {post.obra.titulo}
            </Link>
            <span className="opacity-30">&gt;</span>
            <Link to={`/posts/${post.post_id}`} className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
              Capítulo {post.ordem}
            </Link>
          </div>
        )}

        {/* Autor */}
        <header className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-3">

            <ProfileLink 
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-transform border ${
                post.autor_display?.deletado 
                ? 'bg-gray-100 text-gray-400 border-gray-200' 
                : 'bg-[var(--input-bg)] hover:scale-110 active:scale-95 border-[var(--accent-primary)]/10'
              }`}
            >
              {post.autor_display?.deletado ? <UserX size={16} /> : (post.autor_display?.nome || 'U').charAt(0).toUpperCase()}
            </ProfileLink>

            <div className="flex flex-col">
              <ProfileLink 
                className={`font-semibold text-sm transition-colors ${
                  post.autor_display?.deletado 
                  ? 'text-[var(--text-secondary)] italic cursor-default' 
                  : 'text-[var(--text-primary)] hover:text-[var(--accent-primary)]'
                }`}
              >
                {post.autor_display?.nome || 'Usuário Desconhecido'}
              </ProfileLink>

              <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                {post.autor_display?.campus && (
                  <>
                    <span className="font-medium whitespace-nowrap text-[var(--accent-primary)]">
                      IFNMG - Campus {post.autor_display.campus}
                    </span>
                    <span className="opacity-50">•</span>
                  </>
                )}
                <span className="whitespace-nowrap">
                  {tempoPost}
                </span>
              </div>
            </div>

          </div>

        </header>

        {/* Título e Obras */}
        <div className="space-y-2 mb-3">
          {post.obra_id && post.status === 'CONCLUIDO' && (
            <div className="flex flex-wrap gap-2 items-center mb-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-if-green)]/10 text-[var(--color-if-green)] rounded-full text-[10px] font-black uppercase tracking-wider border border-[var(--color-if-green)]/20 shadow-sm">
                <CheckCircle2 size={12} strokeWidth={2.5} />
                <span>Obra Finalizada</span>
              </div>
            </div>
          )}
          
          <h2 className="text-xl font-bold group-hover:text-[var(--accent-primary)] transition-colors leading-tight">
            <Link to={`/posts/${post.post_id}`} className="hover:underline">
              {post.titulo}
            </Link>
          </h2>
        </div>

        {/* Conteúdo com Suporte a Markdown */}
        <div className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-3 mb-4 markdown-body prose prose-sm max-w-none">
          <ReactMarkdown>{post.conteudo}</ReactMarkdown>
        </div>

        {/* Tags */}
        <TagList tags={post.tags ?? []} />

      </div>

      {/* Ações */}
      <PostActions 
        postId={post.post_id} 
        upvotes={post.total_upvotes} 
        comments={post.total_comentarios} 
      />

    </article>
  );
}
