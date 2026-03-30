import React, { useState } from 'react';
import { Smile, Image as ImageIcon, EyeOff, Send } from 'lucide-react';
import { comentarPost } from '../../shared/services/post.service';
import { Notificacao } from '../../shared/utils/Notificacao';

interface Props {
  postId: number;
  onSuccess: () => void;
  parentId?: number;
  placeholder?: string;
}

export default function ComentarioInput({ postId, onSuccess, parentId, placeholder }: Props) {
  const [texto, setTexto] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || loading) return;

    try {
      setLoading(true);
      await comentarPost(postId, texto.trim(), parentId, isSpoiler);
      setTexto('');
      setIsSpoiler(false);
      onSuccess();
      Notificacao.toast.sucesso('Comentário publicado!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-2xl">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={placeholder || "O que você achou desta obra?"}
        className="w-full bg-transparent border-none focus:ring-0 text-sm min-h-[100px] resize-none text-[var(--text-primary)]"
      />
      
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSpoiler(!isSpoiler)}
            className={`p-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold ${
              isSpoiler 
                ? 'bg-orange-500/10 text-orange-500' 
                : 'hover:bg-[var(--input-bg)] text-[var(--text-secondary)]'
            }`}
            title="Marcar como spoiler"
          >
            <EyeOff size={16} />
            <span className="hidden sm:inline">Spoiler</span>
          </button>
          
          <button type="button" className="p-2 hover:bg-[var(--input-bg)] text-[var(--text-secondary)] rounded-xl transition-all">
            <ImageIcon size={18} />
          </button>
          
          <button type="button" className="p-2 hover:bg-[var(--input-bg)] text-[var(--text-secondary)] rounded-xl transition-all">
            <Smile size={18} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!texto.trim() || loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent-primary)] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-[var(--accent-primary)]/20"
        >
          {loading ? 'Publicando...' : (
            <>
              Publicar
              <Send size={14} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
