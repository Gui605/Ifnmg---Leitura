import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Book, MoreVertical, PenTool, Trash2, LayoutGrid, List } from 'lucide-react';
import { listarMinhasObras, deletarObra, atualizarObra } from '../../shared/services/obra.service';
import { ObraResponse } from '../../shared/types/obra.types';
import { Notificacao } from '../../shared/utils/Notificacao';
import Header from '../../shared/components/Header';

export default function MinhasObrasPage() {
  const [obras, setObras] = useState<ObraResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedObra, setSelectedObra] = useState<ObraResponse | null>(null);
  const [statusEditado, setStatusEditado] = useState<'ANDAMENTO' | 'CONCLUIDO'>('ANDAMENTO');

  const navLinks = [
  { label: 'Início', path: '/feed' },
  { label: 'Explorar', path: '/explorar' },
  { label: 'Notificações', path: '/notificacoes' },
  { label: 'Comunidade', path: '/comunidade' },
  { label: 'Salvos', path: '/salvos' },
  { label: 'Minhas Obras', path: '/minhas-obras' },
  { label: 'Configurações', path: '/configuracoes/perfil' }
];

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

  async function handleSalvarStatus() {
    if (!selectedObra) return;
    try {
      await atualizarObra(selectedObra.obra_id, { status: statusEditado });
      Notificacao.toast.sucesso('Status da obra atualizado com sucesso.');
      setIsEditModalOpen(false);
      loadObras();
    } catch (err) {
      console.error(err);
      Notificacao.toast.erro('Falha ao atualizar status.');
    }
  }

  const headerActions = (
    <button 
      onClick={() => navigate('/obras/nova')}
      className="flex items-center justify-center gap-2 bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold py-2 px-3 rounded-xl transition-all active:scale-95 shadow-sm"
    >
      <Plus size={18} strokeWidth={3} />
      <span className="text-sm">Nova Obra</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header 
        title="Minha Biblioteca" 
        showSearch={true}
        actions={headerActions}
        navLinks={navLinks}
      />

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Subheader Informativo */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black font-lexend text-[var(--text-primary)] tracking-tighter">Suas Obras</h2>
          <p className="text-[var(--text-secondary)] font-medium text-sm">Gerencie seus projetos literários e acadêmicos.</p>
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
                  <span>{obra.status === 'CONCLUIDO' ? 'Concluída' : 'Em Andamento'}</span>
                </div>

                {/* Menu de Ações Absoluto */}
                <div className="absolute top-3 right-3 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === obra.obra_id ? null : obra.obra_id);
                    }}
                    className="p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur text-white rounded-lg transition-all border border-white/10"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenu === obra.obra_id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                      <div className="absolute right-0 mt-1 w-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl z-20 p-1 flex flex-col gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedObra(obra);
                            setStatusEditado(obra.status || 'ANDAMENTO');
                            setIsEditModalOpen(true);
                            setActiveMenu(null);
                          }}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg text-[var(--text-primary)] hover:bg-[var(--input-bg)] transition-colors w-full text-left"
                        >
                          <PenTool size={14} />
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(null);
                            handleDelete(obra.obra_id, obra.titulo);
                          }}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg text-[var(--color-if-red)] hover:bg-[var(--color-if-red)]/10 transition-colors w-full text-left"
                        >
                          <Trash2 size={14} />
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg leading-tight text-[var(--text-primary)] line-clamp-2 transition-colors">
                    <Link 
                      to={`/obras/${obra.obra_id}`} 
                      className="hover:text-[var(--accent-primary)] hover:underline"
                    >
                      {obra.titulo}
                    </Link>
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
                <div className="pt-3 border-t border-[var(--border-color)]">
                  <button
                    onClick={() => navigate(`/escrever-capitulo/${obra.obra_id}`)}
                    className="w-full bg-[var(--accent-primary)] text-white text-xs font-bold py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} strokeWidth={3} />
                    Escrever
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* MODAL PARA ALTERAR STATUS DA OBRA */}
    {isEditModalOpen && selectedObra && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col space-y-4">
          <div>
            <h3 className="font-lexend font-black text-lg text-[var(--text-primary)]">Editar Situação</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Altere o progresso atual de "{selectedObra.titulo}"</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Status da Obra</label>
            <select
              value={statusEditado}
              onChange={(e) => setStatusEditado(e.target.value as 'ANDAMENTO' | 'CONCLUIDO')}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] text-sm rounded-xl px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] font-medium"
            >
              <option value="ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 bg-[var(--input-bg)] text-[var(--text-primary)] text-xs font-bold py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvarStatus}
              className="flex-1 bg-[var(--accent-primary)] text-white text-xs font-bold py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[var(--accent-primary)]/20"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
