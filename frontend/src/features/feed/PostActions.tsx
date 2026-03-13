import React from "react";
import { Heart, MessageCircle, Bookmark, Flag } from "lucide-react";
import { Notificacao } from "../../shared/utils/Notificacao";

interface Props {
  postId: number;
  upvotes?: number;
  comments?: number;
}

export default function PostActions({ postId, upvotes = 0, comments = 0 }: Props) {

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

        <button className="flex items-center gap-2 hover:text-[var(--accent-primary)] transition-all duration-300 active:scale-95">
          <Bookmark size={18} className="transition-colors" />
          <span className="text-xs font-bold">Salvar</span>
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
