import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Book, 
  MessageSquare, 
  Flag, 
  ArrowBigUp, 
  ArrowBigDown,
  EyeOff,
  UserX
} from 'lucide-react';
import { getPostById, votarPost } from '../../shared/services/post.service';
import { PostResponse } from '../../shared/types/post.types';
import { Notificacao } from '../../shared/utils/Notificacao';
import FeedbackBox from './FeedbackBox';
import ComentarioInput from './ComentarioInput';

import Header from '../../shared/components/Header';

export default function PostDetalhesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [votos, setVotos] = useState({ up: 0, down: 0 });
  const viewIncremented = useRef(false);

  useEffect(() => {
    if (id && !viewIncremented.current) {
      // 🛡️ Previne incremento duplo em React.StrictMode
      viewIncremented.current = true;
      loadPost(Number(id));
    }
  }, [id]);

  async function loadPost(postId: number) {
    try {
      setLoading(true);
      const data = await getPostById(postId);
      setPost(data);
      setVotos({ up: data.total_upvotes, down: data.total_downvotes });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      Notificacao.toast.erro('Publicação não encontrada.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  async function handleVoto(tipo: 'up' | 'down') {
    if (!post) return;
    try {
      const resp = await votarPost(post.post_id, tipo);
      setVotos({ up: resp.total_upvotes, down: resp.total_downvotes });
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[var(--accent-primary)]/20 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin"></div>
          <span className="text-[var(--text-secondary)] font-lexend">Abrindo pergaminho...</span>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-lexend pb-24">
      <Header 
        title={post.titulo}
        showSearch={false}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Folha de Papel */}
        <div className="bg-[var(--bg-card)] shadow-2xl rounded-sm overflow-hidden border border-[var(--border-color)]/30">
          
          {/* Cabeçalho da Obra (Dentro da Folha) */}
          <div className="px-8 md:px-16 pt-12 pb-8 border-b border-[var(--border-color)]/10">
            {post.obra && (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[var(--accent-primary)] mb-4">
                <Book size={14} />
                <Link to={`/obras/${post.obra_id}`} className="hover:underline">{post.obra.titulo}</Link>
                <span className="opacity-30">/</span>
                <span className="text-[var(--text-secondary)]">Capítulo {post.ordem}</span>
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] leading-tight">
              {post.titulo}
            </h1>
            
            <div className="flex items-center justify-between mt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--input-bg)] border border-[var(--accent-primary)]/20 flex items-center justify-center font-bold text-sm">
                  {post.autor_display?.nome?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold">{post.autor_display?.nome}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{post.autor_display?.campus}</p>
                </div>
              </div>

              <div className="flex items-center bg-[var(--input-bg)]/50 rounded-xl p-1 border border-[var(--border-color)]">
                <button onClick={() => handleVoto('up')} className="p-2 hover:text-emerald-500 transition-colors"><ArrowBigUp size={20} /></button>
                <span className="px-2 text-sm font-black min-w-[3ch] text-center">{votos.up - votos.down}</span>
                <button onClick={() => handleVoto('down')} className="p-2 hover:text-rose-500 transition-colors"><ArrowBigDown size={20} /></button>
              </div>
            </div>
          </div>

          {/* Conteúdo da Leitura */}
          <article className="px-8 md:px-16 py-12 md:py-16">
            <div className="text-xl leading-[1.8] font-serif text-[var(--text-primary)] whitespace-pre-wrap selection:bg-[var(--accent-primary)]/20 text-justify break-words overflow-wrap-anywhere">
              {post.conteudo}
            </div>
          </article>

          {/* Rodapé da Folha (Navegação e Reações) */}
          <footer className="px-8 md:px-16 pb-16 space-y-12">
            {/* Navegação entre Capítulos */}
            {post.obra_id && post.navegacao && (
              <div className="flex items-center justify-between gap-4 pt-10 border-t border-[var(--border-color)]/10">
                <Link
                  to={post.navegacao.anterior_id ? `/posts/${post.navegacao.anterior_id}` : '#'}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border ${
                    post.navegacao.anterior_id 
                      ? 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--input-bg)] hover:text-[var(--text-primary)] active:scale-95' 
                      : 'opacity-20 cursor-not-allowed border-transparent'
                  }`}
                  onClick={(e) => !post.navegacao?.anterior_id && e.preventDefault()}
                >
                  <ChevronLeft size={14} />
                  Anterior
                </Link>

                <Link
                  to={post.navegacao.proximo_id ? `/posts/${post.navegacao.proximo_id}` : '#'}
                  className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                    post.navegacao.proximo_id 
                      ? 'bg-[var(--accent-primary)] text-white hover:brightness-110 shadow-md shadow-[var(--accent-primary)]/10 active:scale-95' 
                      : 'bg-[var(--input-bg)] opacity-20 cursor-not-allowed'
                  }`}
                  onClick={(e) => !post.navegacao?.proximo_id && e.preventDefault()}
                >
                  Próximo
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}

            {/* Quadro de Reações (Barra elegante) */}
            <FeedbackBox 
              postId={post.post_id} 
              reacoesCount={post.reacoes_count || {}} 
              minhaReacao={post.minha_reacao || null}
              onUpdate={() => loadPost(post.post_id)}
            />
          </footer>
        </div>

        {/* Seção de Comentários (Fora da Folha) */}
        <section id="comentarios" className="mt-16 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <MessageSquare className="text-[var(--accent-primary)]" />
              Comentários
              <span className="text-sm font-bold text-[var(--text-secondary)] opacity-50">
                {post.comentarios?.length || 0}
              </span>
            </h2>
          </div>

          <ComentarioInput postId={post.post_id} onSuccess={() => loadPost(post.post_id)} />

          <div className="space-y-6">
            {post.comentarios?.map((comentario: any) => (
              <ComentarioCard 
                key={comentario.comentario_id} 
                comentario={comentario} 
                postId={post.post_id}
                onUpdate={() => loadPost(post.post_id)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function ComentarioCard({ comentario, postId, onUpdate, isResposta = false }: any) {
  const [showSpoiler, setShowSpoiler] = useState(!comentario.is_spoiler);
  const [replying, setReplying] = useState(false);

  return (
    <div className={`space-y-4 ${isResposta ? 'ml-8 sm:ml-12 border-l-2 border-[var(--border-color)] pl-6' : ''}`}>
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center font-black text-sm text-[var(--accent-primary)]">
              {comentario.perfil?.nome_user?.charAt(0).toUpperCase() || <UserX size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--text-primary)]">
                  {comentario.perfil?.nome_user || 'Usuário Desativado'}
                </span>
                {comentario.perfil && (
                  <span className="px-2 py-0.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] font-black rounded-lg border border-[var(--accent-primary)]/20">
                    Lvl {comentario.perfil.level}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">
                {new Date(comentario.data_criacao).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <button className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all" title="Denunciar">
            <Flag size={16} />
          </button>
        </header>

        <div className="relative">
          {comentario.is_spoiler && !showSpoiler ? (
            <button 
              onClick={() => setShowSpoiler(true)}
              className="w-full p-6 bg-[var(--input-bg)]/50 backdrop-blur-md rounded-2xl border border-orange-500/20 flex flex-col items-center gap-3 group transition-all hover:bg-orange-500/5"
            >
              <EyeOff size={24} className="text-orange-500" />
              <span className="text-xs font-black uppercase tracking-widest text-orange-500">Este comentário contém spoiler</span>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50">Clique para revelar</span>
            </button>
          ) : (
            <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
              {comentario.texto}
            </p>
          )}
        </div>

        <footer className="flex items-center gap-6 mt-6 pt-4 border-t border-[var(--border-color)]">
          {!isResposta && (
            <button 
              onClick={() => setReplying(!replying)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
            >
              <MessageSquare size={14} />
              Responder
            </button>
          )}
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-emerald-500 transition-colors">
              <ArrowBigUp size={18} />
              <span className="text-xs font-black">0</span>
            </button>
            <button className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-rose-500 transition-colors">
              <ArrowBigDown size={18} />
            </button>
          </div>
        </footer>
      </div>

      {replying && (
        <div className="ml-8 sm:ml-12 animate-in fade-in slide-in-from-top-4 duration-300">
          <ComentarioInput 
            postId={postId} 
            parentId={comentario.comentario_id}
            placeholder={`Respondendo a ${comentario.perfil?.nome_user}...`}
            onSuccess={() => {
              setReplying(false);
              onUpdate();
            }}
          />
        </div>
      )}

      {comentario.respostas?.map((resposta: any) => (
        <ComentarioCard 
          key={resposta.comentario_id} 
          comentario={resposta} 
          postId={postId}
          onUpdate={onUpdate}
          isResposta={true}
        />
      ))}
    </div>
  );
}
