import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, ArrowLeft, Send, PenTool, Layout, Image as ImageIcon } from 'lucide-react';
import { criarObra } from '../../shared/services/obra.service';
import { listarCategorias } from '../../shared/services/categoria.service';
import { Categoria } from '../../shared/types/categoria.types';
import { Notificacao } from '../../shared/utils/Notificacao';
import Header from '../../shared/components/Header';

export default function CriarObra() {
  const navigate = useNavigate();
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemCapa, setImagemCapa] = useState('');
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    loadCategorias();
  }, []);

  async function loadCategorias() {
    try {
      const data = await listarCategorias();
      setCategorias(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCategorias(false);
    }
  }

  function toggleCategoria(id: number) {
    if (selectedCats.includes(id)) {
      setSelectedCats(selectedCats.filter(catId => catId !== id));
    } else {
      if (selectedCats.length >= 3) {
        return Notificacao.toast.aviso('Máximo 3 categorias permitidas.');
      }
      setSelectedCats([...selectedCats, id]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || selectedCats.length === 0) {
      return Notificacao.toast.aviso('Preencha o título e selecione pelo menos uma categoria.');
    }

    try {
      setEnviando(true);
      await criarObra({
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        imagem_capa: imagemCapa.trim() || undefined,
        categorias: selectedCats
      });

      Notificacao.toast.sucesso('Obra criada com sucesso!');
      navigate('/minhas-obras');
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header title="Nova Obra" showSearch={false} />

      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black font-lexend text-[var(--text-primary)] tracking-tighter">Criar Nova Obra</h1>
          <p className="text-[var(--text-secondary)] font-medium text-sm">Defina a base do seu projeto literário ou acadêmico.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Preview da Capa */}
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-2xl bg-[var(--input-bg)] overflow-hidden border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center text-[var(--text-secondary)] group relative">
              {imagemCapa ? (
                <img src={imagemCapa} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon size={32} className="opacity-30" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 mt-2 text-center px-4">URL da Imagem de Capa</span>
                </>
              )}
            </div>
            <input 
              type="text"
              value={imagemCapa}
              onChange={(e) => setImagemCapa(e.target.value)}
              placeholder="Link da imagem de capa..."
              className="w-full px-4 py-2 bg-[var(--input-bg)] rounded-xl border-none text-xs outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-[var(--text-primary)]"
            />
          </div>

          {/* Dados Básicos */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] font-lexend">Título da Obra</label>
              <input 
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: O Caminho das Estrelas"
                className="w-full bg-[var(--input-bg)] px-5 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-lg font-bold text-[var(--text-primary)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] font-lexend">Descrição / Sinopse</label>
              <textarea 
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Conte um pouco sobre o que se trata esta obra..."
                rows={4}
                className="w-full bg-[var(--input-bg)] px-5 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 text-sm text-[var(--text-primary)] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Categorias */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] font-lexend">Categorias Fixas (Herança)</label>
            <span className="text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-widest">{selectedCats.length}/3 Selecionadas</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {loadingCategorias ? (
              <div className="h-10 w-full animate-pulse bg-[var(--input-bg)] rounded-xl" />
            ) : categorias.map(cat => (
              <button
                key={cat.categoria_id}
                type="button"
                onClick={() => toggleCategoria(cat.categoria_id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                  selectedCats.includes(cat.categoria_id)
                    ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20'
                    : 'bg-[var(--input-bg)] border-transparent text-[var(--text-secondary)] hover:border-[var(--border-color)]'
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] font-medium">Todos os capítulos criados para esta obra herdarão estas categorias automaticamente.</p>
        </div>

        <div className="pt-6 border-t border-[var(--border-color)] flex justify-end">
          <button 
            type="submit"
            disabled={enviando}
            className="flex items-center justify-center gap-2 bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50 text-white font-bold py-4 px-10 rounded-2xl transition-all active:scale-95 shadow-xl shadow-[var(--accent-primary)]/20"
          >
            {enviando ? 'Criando...' : (
              <>
                <Send size={18} strokeWidth={2.5} />
                <span>Criar Obra e Começar</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}
