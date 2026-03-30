import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrabalhoResumo } from '../../shared/types/post.types';
import { Eye, ThumbsUp, Quote, CheckCircle, Clock, FileText, User as UserIcon } from 'lucide-react';
import { votarPost } from '../../shared/services/post.service';
import { Notificacao } from '../../shared/utils/Notificacao';

interface Props {
  trabalho: TrabalhoResumo;
}

export function CardTrabalho({ trabalho }: Props) {
  const [votos, setVotos] = useState(trabalho.total_upvotes || 0);
  const [isVotando, setIsVotando] = useState(false);

  const dataFormatada = trabalho.data_criacao 
    ? new Date(trabalho.data_criacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Data desconhecida';

  const handleVotar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isVotando) return;

    setIsVotando(true);
    try {
      const result = await votarPost(trabalho.post_id, 'up');
      setVotos(result.total_upvotes);
      Notificacao.toast.sucesso("Voto registrado!", "Obrigado por apoiar este trabalho.");
    } catch (err) {
      // Erro tratado pelo apiClient
    } finally {
      setIsVotando(false);
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-[var(--accent-primary)]/30 transition-all duration-300 group shadow-[var(--shadow-elevation-1)]">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            {trabalho.curso && (
              <span className="text-[10px] font-black bg-[var(--accent-primary)] text-white px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm shadow-green-500/20">
                {trabalho.curso}
              </span>
            )}
            <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-tight italic opacity-70">Publicado em {dataFormatada}</span>
          </div>
          
          <Link to={`/posts/${trabalho.post_id}`} className="block mb-1">
            <h3 className="text-xl font-black font-lexend text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-tight">
              {trabalho.titulo}
            </h3>
          </Link>
          
          <div className="flex items-center gap-1.5 mb-4 text-sm font-bold text-[var(--accent-primary)]">
            <UserIcon size={14} strokeWidth={2.5} />
            por <Link to={`/perfil/${trabalho.autor_id}`} className="hover:underline decoration-2 underline-offset-2">{trabalho.autor_display?.nome || 'Autor Desconhecido'}</Link>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-5">
            {trabalho.tags?.map(tag => (
              <Link 
                key={tag} 
                to={`/explorar?tag=${tag}`}
                className="text-[10px] font-black uppercase tracking-wider bg-[var(--input-bg)] px-2.5 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/10 hover:text-[var(--accent-primary)] transition-all border border-transparent hover:border-[var(--accent-primary)]/20"
              >
                #{tag}
              </Link>
            ))}
          </div>
          
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed font-medium">
            {trabalho.conteudo}
          </p>
        </div>

        <div className="flex md:flex-col justify-between items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-[var(--border-color)]/50 pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center gap-1.5 text-[var(--accent-primary)] bg-[var(--accent-primary)]/5 px-3 py-1.5 rounded-full border border-[var(--accent-primary)]/10 shadow-sm">
            {trabalho.status_trabalho === 'Concluído' ? (
              <>
                <CheckCircle size={14} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-widest">Concluído</span>
              </>
            ) : (
              <>
                <Clock size={14} strokeWidth={3} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Em Andamento</span>
              </>
            )}
          </div>
          
          <div className="flex gap-5 md:gap-3 md:flex-col md:items-end mt-2">
            <div className="flex items-center gap-1.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]" title="Visualizações">
              <span className="text-xs font-black font-lexend tracking-tighter">{trabalho.visualizacoes || 0}</span>
              <Eye size={18} strokeWidth={1.5} />
            </div>
            
            <button 
              onClick={handleVotar}
              disabled={isVotando}
              className={`flex items-center gap-1.5 transition-all active:scale-90 ${isVotando ? 'opacity-50' : 'hover:scale-110'}`}
              title="Apoiar este trabalho"
            >
              <span className="text-xs font-black font-lexend tracking-tighter text-[var(--accent-primary)]">{votos}</span>
              <ThumbsUp size={18} strokeWidth={2} className="text-[var(--accent-primary)] fill-[var(--accent-primary)]/10" />
            </button>

            <div className="flex items-center gap-1.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]" title="Citações">
              <span className="text-xs font-black font-lexend tracking-tighter">{trabalho.numero_citacoes || 0}</span>
              <Quote size={18} strokeWidth={1.5} className="rotate-180" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

