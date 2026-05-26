import React, { useState } from "react";
import { Heart, MessageCircle, Bookmark, Flag } from "lucide-react";
import { Notificacao } from "../../shared/utils/Notificacao";
import { apiClient } from "../../shared/utils/apiClient";
import { ModalDenuncia } from "../denuncias/ModalDenuncia";
import { AnimatePresence } from "framer-motion";

import { z } from "zod";

interface Props {
  postId: number;
  upvotes?: number;
  comments?: number;
  inicialmenteSalvo?: boolean;
}

export default function PostActions({ postId, upvotes: upvotesProp = 0, comments = 0, inicialmenteSalvo = false }: Props) {
  const [salvo, setSalvo] = useState(inicialmenteSalvo);
  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [loadingVoto, setLoadingVoto] = useState(false);
  const [upvotes, setUpvotes] = useState(upvotesProp);
  const [isModalDenunciaOpen, setIsModalDenunciaOpen] = useState(false);

  async function toggleVotar() {
    setLoadingVoto(true);
    setUpvotes(prev => prev + 1);
    try {
      await apiClient.post(`/posts/${postId}/votar`, { tipo: 'UP' }, z.any());
      Notificacao.toast.sucesso("Voto registrado!", "Você ganhou +2 XP e o autor ganhou +10 XP.");
    } catch (err: any) {
      setUpvotes(prev => Math.max(0, prev - 1));
    } finally {
      setLoadingVoto(false);
    }
  }

  async function toggleSalvar() {
    setLoadingSalvar(true);
    try {
      await apiClient.post(`/posts/${postId}/favoritar`, {}, z.any());
      const novoEstado = !salvo;
      setSalvo(novoEstado);
      Notificacao.toast.sucesso(
        novoEstado ? "Pergaminho Guardado" : "Removido dos Salvos",
        novoEstado ? "Você pode acessá-lo na sua biblioteca." : "O item foi removido da sua lista."
      );
    } catch (err) {
      Notificacao.toast.erro("Erro ao processar", "Não foi possível atualizar seus favoritos.");
    } finally {
      setLoadingSalvar(false);
    }
  }

  return (
    <>
      <footer className="border-t border-[var(--input-bg)] p-4 flex items-center justify-between text-[var(--text-secondary)]">
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleVotar}
            disabled={loadingVoto}
            className="flex items-center gap-2 hover:text-[var(--accent-primary)] transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            <Heart size={18} className="transition-colors" />
            <span className="text-xs font-bold">{upvotes > 0 ? upvotes : 'Curtir'}</span>
          </button>

          <button className="flex items-center gap-2 hover:text-[var(--accent-primary)] transition-all duration-300 active:scale-95">
            <MessageCircle size={18} className="transition-colors" />
            <span className="text-xs font-bold">{comments > 0 ? comments : 'Comentar'}</span>
          </button>

          <button 
            onClick={toggleSalvar}
            disabled={loadingSalvar}
            className={`flex items-center gap-2 transition-all duration-300 active:scale-95 ${salvo ? 'text-[var(--accent-primary)]' : 'hover:text-[var(--accent-primary)]'}`}
          >
            <Bookmark size={18} className={`transition-colors ${salvo ? 'fill-current' : ''}`} />
            <span className="text-xs font-bold">{salvo ? 'Salvo' : 'Salvar'}</span>
          </button>
        </div>

        <button
          onClick={() => setIsModalDenunciaOpen(true)}
          className="flex items-center gap-2 text-[var(--color-if-red)] hover:bg-[var(--color-if-red)]/10 px-3 py-1 rounded-lg transition-all duration-300 active:scale-95"
        >
          <Flag size={16} />
          <span className="text-xs font-bold">Denunciar</span>
        </button>
      </footer>

      <AnimatePresence>
        {isModalDenunciaOpen && (
          <ModalDenuncia 
            postId={postId} 
            onClose={() => setIsModalDenunciaOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
