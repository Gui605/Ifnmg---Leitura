//frontend/src/features/dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Notificacao } from '../../shared/utils/Notificacao';
import { PerfilResumo } from '../../shared/types/perfil.types';
import { PostResumo } from '../../shared/types/post.types';
import { getMeuPerfil } from '../../shared/services/perfil.service';
import { getFeed } from '../../shared/services/post.service';

export default function Dashboard() {
  const [perfil, setPerfil] = useState<PerfilResumo | null>(null);
  const [feed, setFeed] = useState<PostResumo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const [p, f] = await Promise.all([getMeuPerfil(), getFeed()]);
        if (!cancelado) {
          setPerfil(p);
          setFeed(f);
          setErro(null);
        }
      } catch {
        if (!cancelado) setErro('Erro ao carregar dados.');
      }
      if (!cancelado) setLoading(false);
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] grid grid-cols-1 md:grid-cols-[250px,1fr,300px] gap-6 p-6">
      <aside className="hidden md:block bg-[var(--bg-card)] rounded-lg shadow px-4 py-5">
        {loading ? <div className="card px-4 py-2">Carregando...</div> : <Sidebar perfil={perfil} />}
      </aside>
      <main className="space-y-4">
        {loading ? <div className="card px-4 py-2">Carregando...</div> : (erro ? <div className="card px-4 py-2">Não foi possível carregar o feed.</div> : <Feed posts={feed} />)}
      </main>
      <aside className="hidden md:block bg-[var(--bg-card)] rounded-lg shadow px-4 py-5">
        {loading ? <div className="card px-4 py-2">Carregando...</div> : <GamificationPanel perfil={perfil} />}
      </aside>
    </div>
  );
}

function Sidebar({ perfil }: { perfil: PerfilResumo | null }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="font-bold">@{perfil?.nome_user ?? '...'}</div>
        {perfil?.is_admin ? <span className="text-xs font-bold text-[var(--accent-primary)]">Admin</span> : null}
      </div>
      <nav className="flex flex-col gap-2">
        <a className="rounded px-3 py-2 hover:bg-[var(--input-bg)] transition-colors" href="#">Explorar</a>
        <a className="rounded px-3 py-2 hover:bg-[var(--input-bg)] transition-colors" href="#">Biblioteca</a>
        <a className="rounded px-3 py-2 hover:bg-[var(--input-bg)] transition-colors" href="#">Perfil</a>
      </nav>
      <button className="mt-2 rounded px-4 py-2 font-semibold text-white" style={{ backgroundColor: 'var(--color-if-green)' }}>
        Escrever
      </button>
    </div>
  );
}

function Feed({ posts }: { posts: PostResumo[] }) {
  return (
    <div className="grid gap-4">
      {posts.map((p) => (
        <article key={p.post_id} className="rounded-lg px-4 py-4 shadow bg-[color:var(--bg-card)/0.8] backdrop-blur-sm">
          <header className="flex items-center justify-between mb-2">
            <div className="text-sm text-[var(--text-secondary)]">@{p.autor_nome_user ?? 'desconhecido'}</div>
          </header>
          <h2 className="text-lg font-semibold mb-1">{p.titulo}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{p.conteudo}</p>
          <footer className="mt-3 flex items-center gap-3">
            <button className="text-sm rounded px-3 py-1 hover:bg-[var(--input-bg)] transition-colors">Votar</button>
            <button className="text-sm rounded px-3 py-1 hover:bg-[var(--input-bg)] transition-colors">Comentar</button>
            <DenunciarButton postId={p.post_id} />
          </footer>
        </article>
      ))}
    </div>
  );
}

function DenunciarButton({ postId }: { postId: number }) {
  return (
    <button
      className="text-sm rounded px-3 py-1 text-white"
      style={{ backgroundColor: 'var(--color-if-red)' }}
      onClick={async () => {
        const res = await Notificacao.modal.confirmar({
          titulo: 'Denunciar Post',
          texto: 'Confirmar envio de denúncia para análise?',
          textoConfirmar: 'Enviar denúncia',
          isDestructive: true
        });
        if (res === true) {
        }
      }}
    >
      Denunciar
    </button>
  );
}

function GamificationPanel({ perfil }: { perfil: PerfilResumo | null }) {
  const karma = Math.max(0, Math.min(100, Math.round((perfil?.score_karma ?? 0) % 101)));
  const leitura = Math.max(0, Math.min(100, Math.round((perfil?.reading_points ?? 0) % 101)));
  return (
    <div className="flex flex-col gap-4">
      <div className="font-semibold">Progresso</div>
      <div className="space-y-2">
        <div className="text-sm">Karma: {karma}%</div>
        <div className="h-2 w-full rounded bg-[var(--input-bg)] overflow-hidden">
          <div className="h-full" style={{ width: `${karma}%`, backgroundColor: 'var(--accent-primary)' }} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm">Leitura: {leitura}%</div>
        <div className="h-2 w-full rounded bg-[var(--input-bg)] overflow-hidden">
          <div className="h-full" style={{ width: `${leitura}%`, backgroundColor: 'var(--color-if-green)' }} />
        </div>
      </div>
    </div>
  );
}
