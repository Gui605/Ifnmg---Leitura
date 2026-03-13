Arquitetura final do Feed

Estrutura recomendada:

frontend/src/features/feed/

Feed.tsx
PostCard.tsx
QuickPost.tsx
PostActions.tsx
TagList.tsx
TrendingTags.tsx
SuggestedUsers.tsx
🎨 Design aplicado

Visual inspirado em:

Medium

Reddit moderno

Dev.to

Melhorias:

✔ quick post
✔ imagem opcional
✔ tags
✔ melhor hierarquia visual
✔ ações modernas
✔ cards elegantes
✔ melhor UX mobile

1️⃣ Feed principal

📁 Feed.tsx

import React from "react";
import { PostResumo } from "../../shared/types/post.types";
import PostCard from "./PostCard";
import QuickPost from "./QuickPost";

interface FeedProps {
  posts: PostResumo[];
}

export default function Feed({ posts }: FeedProps) {
  return (
    <div className="flex flex-col gap-6">

      {/* Quick Post */}
      <QuickPost />

      {/* Feed vazio */}
      {posts.length === 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--input-bg)] rounded-2xl p-10 text-center">
          <p className="text-[var(--text-secondary)]">
            Nenhum pergaminho encontrado ainda.
          </p>
        </div>
      )}

      {/* Posts */}
      {posts.map((post) => (
        <PostCard key={post.post_id} post={post} />
      ))}
    </div>
  );
}
2️⃣ Quick Post (estilo Escrevaí)

📁 QuickPost.tsx

import React from "react";
import { Image, Paperclip } from "lucide-react";

export default function QuickPost() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--input-bg)] rounded-2xl p-4 flex items-center gap-4 shadow-sm">

      <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-white font-bold">
        U
      </div>

      <div className="flex-1 bg-[var(--input-bg)] rounded-full px-4 py-2 text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--input-bg)]/70 transition">
        Qual sua nova descoberta?
      </div>

      <div className="flex items-center gap-2 text-[var(--accent-primary)]">

        <button className="p-2 rounded-full hover:bg-[var(--input-bg)] transition">
          <Image size={18} />
        </button>

        <button className="p-2 rounded-full hover:bg-[var(--input-bg)] transition">
          <Paperclip size={18} />
        </button>

      </div>
    </div>
  );
}
3️⃣ Card de Post (núcleo do feed)

📁 PostCard.tsx

import React from "react";
import { PostResumo } from "../../shared/types/post.types";
import PostActions from "./PostActions";
import TagList from "./TagList";

interface Props {
  post: PostResumo;
}

export default function PostCard({ post }: Props) {
  return (
    <article className="group bg-[var(--bg-card)] border border-[var(--input-bg)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">

      <div className="p-6">

        {/* Autor */}
        <header className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 bg-[var(--input-bg)] rounded-full flex items-center justify-center font-bold text-xs">
              {post.autor_nome_user?.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="font-semibold text-sm text-[var(--text-primary)]">
                @{post.autor_nome_user}
              </p>

              <span className="text-xs text-[var(--text-secondary)]">
                2h atrás
              </span>
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
      <PostActions postId={post.post_id} />

    </article>
  );
}
4️⃣ Tags

📁 TagList.tsx

import React from "react";

interface Props {
  tags: string[];
}

export default function TagList({ tags }: Props) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">

      {tags.map((tag) => (
        <span
          key={tag}
          className="text-xs font-semibold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-2 py-1 rounded-md"
        >
          #{tag}
        </span>
      ))}

    </div>
  );
}
5️⃣ Ações do post

📁 PostActions.tsx

import React from "react";
import { Heart, MessageCircle, Bookmark, Flag } from "lucide-react";
import { Notificacao } from "../../shared/utils/Notificacao";

interface Props {
  postId: number;
}

export default function PostActions({ postId }: Props) {

  async function denunciar() {

    const confirmar = await Notificacao.modal.confirmar({
      titulo: "Denunciar conteúdo",
      texto: "Deseja enviar este post para análise?",
      textoConfirmar: "Denunciar",
      isDestructive: true
    });

    if (confirmar) {
      Notificacao.toast.sucesso(
        "Denúncia enviada",
        "Obrigado por ajudar a manter a comunidade segura."
      );
    }
  }

  return (
    <footer className="border-t border-[var(--input-bg)] p-4 flex items-center justify-between text-[var(--text-secondary)]">

      <div className="flex items-center gap-6">

        <button className="flex items-center gap-2 hover:text-[var(--accent-primary)] transition">
          <Heart size={18} />
          <span className="text-xs font-bold">Curtir</span>
        </button>

        <button className="flex items-center gap-2 hover:text-[var(--accent-primary)] transition">
          <MessageCircle size={18} />
          <span className="text-xs font-bold">Comentar</span>
        </button>

        <button className="flex items-center gap-2 hover:text-[var(--accent-primary)] transition">
          <Bookmark size={18} />
          <span className="text-xs font-bold">Salvar</span>
        </button>

      </div>

      <button
        onClick={denunciar}
        className="flex items-center gap-2 text-[var(--color-if-red)] hover:bg-[var(--color-if-red)]/10 px-3 py-1 rounded-lg transition"
      >
        <Flag size={16} />
        <span className="text-xs font-bold">Denunciar</span>
      </button>

    </footer>
  );
}
🎯 Resultado visual

Esse redesign entrega:

┌────────────────────────────┐
│ Qual sua nova descoberta?  │
└────────────────────────────┘

┌────────────────────────────┐
│ Avatar  @usuario     2h    │
│                            │
│ Título do Post             │
│ Texto preview...           │
│                            │
│ #tag #tag #tag             │
│                            │
│ ❤️ Curtir  💬 Comentar     │
│ 🔖 Salvar        🚩 Denunciar│
└────────────────────────────┘
🚀 Melhorias profissionais prontas para adicionar

Se quiser deixar nível produção real, adicione:

Infinite scroll
IntersectionObserver
Cache do feed
React Query
Lazy loading imagens
loading="lazy"
Paginação backend
GET /feed?page=1&limit=10
🧠 Resultado final

Seu sistema ficará:

Sistema	Resultado
IFNMG Leitura	arquitetura sólida
Escrevaí	UX moderna
Resultado	plataforma estilo Medium acadêmico