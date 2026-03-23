import React, { useState } from "react";
import { Heart, MessageCircle, Bookmark, Flag } from "lucide-react";
import { Notificacao } from "../../shared/utils/Notificacao";
import { apiClient } from "../../shared/utils/apiClient";

import { z } from "zod";

interface Props {
  postId: number;
  upvotes?: number;
  comments?: number;
  inicialmenteSalvo?: boolean;
}

export default function PostActions({ postId, upvotes = 0, comments = 0, inicialmenteSalvo = false }: Props) {
  const [salvo, setSalvo] = useState(inicialmenteSalvo);
  const [loadingSalvar, setLoadingSalvar] = useState(false);

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
        <button className="flex items-center gap-2 hover:text-[var(--accent-primary)] transition-all duration-300 active:scale-95">
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
        onClick={denunciar}
        className="flex items-center gap-2 text-[var(--color-if-red)] hover:bg-[var(--color-if-red)]/10 px-3 py-1 rounded-lg transition-all duration-300 active:scale-95"
      >
        <Flag size={16} />
        <span className="text-xs font-bold">Denunciar</span>
      </button>
    </footer>
  );
}
