import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, ArrowLeft, Send, PenTool, Layout, FileText } from 'lucide-react';
import { buscarObraPorId } from '../../shared/services/obra.service';
import { criarPost } from '../../shared/services/post.service';
import { ObraResponse } from '../../shared/types/obra.types';
import { Notificacao } from '../../shared/utils/Notificacao';
import EditorTexto from '../posts/EditorTexto';

export default function EscritaCapitulo() {
  const { obraId } = useParams();
  const navigate = useNavigate();
  const [obra, setObra] = useState<ObraResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (obraId) {
      loadObra(Number(obraId));
    }
  }, [obraId]);

  async function loadObra(id: number) {
    try {
      setLoading(true);
      const data = await buscarObraPorId(id);
      setObra(data);
    } catch (err) {
      Notificacao.toast.erro('Obra não encontrada.');
      navigate('/minhas-obras');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !conteudo.trim() || !obra) {
      return Notificacao.toast.aviso('Preencha o título e o conteúdo do capítulo.');
    }

    try {
      setEnviando(true);
      // DEBUG: Log do payload antes de enviar
      const payload = {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        obra_id: Number(obra.obra_id), // Garante que seja NUMBER
        status: 'ANDAMENTO', // Status padrão explícito
        tags: [] // Categorias herdadas no backend
      };
      
      console.log("[DEBUG] Enviando capítulo:", payload);

      await criarPost(payload as any);

      Notificacao.toast.sucesso('Capítulo publicado com sucesso!');
      navigate('/minhas-obras');
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse">Carregando obra...</div>;
  if (!obra) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Fixo de Herança */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/minhas-obras')}
            className="p-3 bg-[var(--input-bg)] rounded-2xl hover:bg-[var(--accent-primary)]/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[var(--accent-primary)]">
              <Book size={16} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] font-lexend opacity-70">Escrevendo para</span>
            </div>
            <h1 className="text-xl font-bold font-lexend text-[var(--text-primary)] leading-tight">{obra.titulo}</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 md:justify-end">
          {obra.categorias?.map(c => (
            <span key={c.categoria.categoria_id} className="px-2.5 py-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] font-black uppercase tracking-wider rounded-lg border border-[var(--accent-primary)]/10">
              {c.categoria.nome}
            </span>
          ))}
        </div>
      </div>

      {/* Editor de Capítulo */}
      <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-xl space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] opacity-50">
            <PenTool size={18} />
            <span className="text-xs font-bold uppercase tracking-widest font-lexend">Novo Capítulo</span>
          </div>
          <input 
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título do Capítulo (ex: O Começo de Tudo)"
            className="w-full bg-transparent text-3xl font-black font-lexend text-[var(--text-primary)] border-none outline-none placeholder:text-[var(--text-secondary)]/30 focus:ring-0"
            autoFocus
          />
        </div>

        <div className="min-h-[400px]">
          <EditorTexto 
            conteudo={conteudo}
            setConteudo={setConteudo}
          />
        </div>

        <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Layout size={18} />
            <span className="text-xs font-medium">As categorias e metadados serão herdados da obra.</span>
          </div>

          <button 
            type="submit"
            disabled={enviando}
            className="flex items-center justify-center gap-2 bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-2xl transition-all active:scale-95 shadow-lg shadow-[var(--accent-primary)]/20"
          >
            {enviando ? 'Publicando...' : (
              <>
                <Send size={18} strokeWidth={2.5} />
                <span>Publicar Capítulo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
