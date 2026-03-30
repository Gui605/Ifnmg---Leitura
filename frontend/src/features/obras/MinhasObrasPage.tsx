import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Book, MoreVertical, PenTool, Trash2, LayoutGrid, List } from 'lucide-react';
import { listarMinhasObras, deletarObra } from '../../shared/services/obra.service';
import { ObraResponse } from '../../shared/types/obra.types';
import { Notificacao } from '../../shared/utils/Notificacao';

export default function MinhasObrasPage() {
  const [obras, setObras] = useState<ObraResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadObras();
  }, []);

  async function loadObras() {
    try {
      setLoading(true);
      const data = await listarMinhasObras();
      setObras(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, titulo: string) {
    const confirm = await Notificacao.modal.confirmar({
      titulo: 'Excluir Obra',
      texto: `Tem certeza que deseja excluir "${titulo}"? Todos os capítulos vinculados também serão removidos.`,
      isDestructive: true
    });

    if (confirm) {
      try {
        await deletarObra(id);
        Notificacao.toast.sucesso('Obra excluída com sucesso.');
        loadObras();
      } catch (err) {
        console.error(err);
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-lexend text-[var(--text-primary)] tracking-tighter">Minha Biblioteca</h1>
          <p className="text-[var(--text-secondary)] font-medium">Gerencie suas obras e publique novos capítulos.</p>
        </div>
        <button 
          onClick={() => navigate('/obras/nova')}
          className="flex items-center justify-center gap-2 bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold py-3 px-6 rounded-2xl transition-all active:scale-95 shadow-lg shadow-[var(--accent-primary)]/20"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Criar Nova Obra</span>
        </button>
      </div>

      {/* Grid de Obras */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[400px] rounded-2xl bg-[var(--input-bg)] animate-pulse" />
          ))}
        </div>
      ) : obras.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-card)] rounded-3xl border-2 border-dashed border-[var(--border-color)] text-center space-y-4">
          <div className="p-4 bg-[var(--input-bg)] rounded-full text-[var(--text-secondary)] opacity-50">
            <Book size={48} />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Nenhuma obra encontrada</h2>
          <p className="text-[var(--text-secondary)] max-w-xs">Sua estante está vazia. Comece criando sua primeira obra literária ou acadêmica.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {obras.map(obra => (
            <div key={obra.obra_id} className="group relative bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
              {/* Capa */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--input-bg)]">
                {obra.imagem_capa ? (
                  <img src={obra.imagem_capa} alt={obra.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-30 space-y-2">
                    <Book size={64} strokeWidth={1} />
                    <span className="text-xs font-bold uppercase tracking-widest">Sem Capa</span>
                  </div>
                )}
                
                {/* Overlay Gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur shadow-sm rounded-lg text-[10px] font-black uppercase tracking-wider text-[var(--accent-primary)]">
                  <div className="size-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                  <span>Em Andamento</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg leading-tight text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent-primary)] transition-colors">
                    {obra.titulo}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
                    <PenTool size={12} />
                    <span>{obra._count?.capitulos || 0} capítulos publicados</span>
                  </div>
                </div>

                {/* Categorias */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {obra.categorias?.map(c => (
                    <span key={c.categoria.categoria_id} className="text-[9px] font-bold px-1.5 py-0.5 bg-[var(--input-bg)] rounded text-[var(--text-secondary)] uppercase">
                      {c.categoria.nome}
                    </span>
                  ))}
                </div>

                {/* Ações */}
                <div className="pt-3 border-t border-[var(--border-color)] flex gap-2">
                  <button 
                    onClick={() => navigate(`/escrever-capitulo/${obra.obra_id}`)}
                    className="flex-1 bg-[var(--accent-primary)] text-white text-xs font-bold py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} strokeWidth={3} />
                    Escrever
                  </button>
                  <button 
                    onClick={() => handleDelete(obra.obra_id, obra.titulo)}
                    className="p-2 bg-[var(--input-bg)] text-[var(--color-if-red)] hover:bg-[var(--color-if-red)]/10 rounded-xl transition-all active:scale-95"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
