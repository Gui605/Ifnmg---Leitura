//frontend/src/features/feed/PostCard.tsx
import React from "react";
import { PostResumo } from "../../shared/types/post.types";
import PostActions from "./PostActions";
import TagList from "./TagList";

interface Props {
  post: PostResumo;
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

export default function PostCard({ post }: Props) {
  const tempoPost = formatarTempo(post.data_criacao);

  return (
    <article className="group bg-[var(--bg-card)] border border-[var(--input-bg)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">

      <div className="p-6">

        {/* Autor */}
        <header className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 bg-[var(--input-bg)] rounded-full flex items-center justify-center font-bold text-xs">
              {post.autor_nome_user?.charAt(0).toUpperCase()}
            </div>

            <div className="flex flex-col">
              <p className="font-semibold text-sm text-[var(--text-primary)]">
                {post.autor_nome_user}
              </p>

              <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                {post.nome_campus && (
                  <>
                    <span className="font-medium whitespace-nowrap">
                      IFNMG - {post.nome_campus}
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

        {/* Título */}
        <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--accent-primary)] transition-colors cursor-pointer">
          {post.titulo}
        </h2>

        {/* Conteúdo */}
        <p className="text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-4">
          {post.conteudo}
        </p>

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
