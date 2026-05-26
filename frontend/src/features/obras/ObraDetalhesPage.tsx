import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Book, 
  User, 
  Calendar, 
  Eye, 
  Heart, 
  Layers, 
  ArrowLeft,
  ChevronRight,
  Play
} from 'lucide-react';
import { buscarObraPorId } from '../../shared/services/obra.service';
import { ObraResponse } from '../../shared/types/obra.types';
import { Notificacao } from '../../shared/utils/Notificacao';
import Header from '../../shared/components/Header';

export default function ObraDetalhesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obra, setObra] = useState<ObraResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadObra(Number(id));
    }
  }, [id]);

  async function loadObra(obraId: number) {
    try {
      setLoading(true);
      const data = await buscarObraPorId(obraId);
      setObra(data);
    } catch (err) {
      console.error(err);
      Notificacao.toast.erro('Obra não encontrada.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[var(--accent-primary)]/20 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin"></div>
          <span className="text-[var(--text-secondary)] font-lexend font-medium">Carregando obra...</span>
        </div>
      </div>
    );
  }

  if (!obra) return null;

  const dataCriacao = new Date(obra.data_criacao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-lexend">
      <Header showSearch={false} />

      {/* Seção principal com efeito de desfoque no fundo */}
      <div className="relative h-[450px] w-full overflow-hidden">
        {/* Camada de fundo desfocado */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-30"
          style={{ backgroundImage: obra.imagem_capa ? `url(${obra.imagem_capa})` : 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/60 to-[var(--bg-primary)]" />

        {/* Conteúdo da seção */}
        <div className="relative max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            {/* Capa em Destaque */}
            <div className="shrink-0 w-48 md:w-64 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group relative">
              {obra.imagem_capa ? (
                <img src={obra.imagem_capa} alt={obra.titulo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--bg-card)] flex items-center justify-center">
                  <Book size={64} className="text-[var(--accent-primary)] opacity-40" />
                </div>
              )}
            </div>

            {/* Info da Obra */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                {obra.categorias?.map(c => (
                  <span key={c.categoria.categoria_id} className="px-3 py-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] font-black uppercase tracking-widest rounded-full border border-[var(--accent-primary)]/20">
                    {c.categoria.nome}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-sm">
                {obra.titulo}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center">
                    <User size={16} className="text-[var(--accent-primary)]" />
                  </div>
                  <span className="font-bold text-[var(--text-primary)]">{obra.autor?.nome_user}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{dataCriacao}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                {obra.capitulos && obra.capitulos.length > 0 && (
                  <Link 
                    to={`/posts/${obra.capitulos[0].post_id}`}
                    className="flex items-center gap-3 px-10 py-5 bg-[var(--accent-primary)] text-white rounded-2xl font-black uppercase tracking-[0.15em] text-sm hover:brightness-110 hover:shadow-xl hover:shadow-[var(--accent-primary)]/30 transition-all active:scale-95 group"
                  >
                    <Play size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                    Começar a Ler
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Conteúdo */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Coluna Esquerda: Sinopse e Info */}
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[var(--accent-primary)] rounded-full"></span>
              Sinopse
            </h2>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
              {obra.descricao || "Esta obra ainda não possui uma sinopse detalhada."}
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <span className="w-1.5 h-8 bg-[var(--accent-primary)] rounded-full"></span>
                Capítulos
              </h2>
              <span className="px-3 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-secondary)]">
                {obra.capitulos?.length || 0} capítulos publicados
              </span>
            </div>

            <div className="grid gap-3">
              {obra.capitulos && obra.capitulos.length > 0 ? (
                obra.capitulos.map((cap, idx) => (
                  <Link 
                    key={cap.post_id}
                    to={`/posts/${cap.post_id}`}
                    className="group bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl flex items-center justify-between hover:border-[var(--accent-primary)]/40 hover:bg-[var(--accent-primary)]/[0.03] transition-all relative overflow-hidden"
                  >
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-[var(--input-bg)] flex items-center justify-center font-black text-sm text-[var(--accent-primary)]/40 group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all duration-300">
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                          {cap.titulo}
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">
                          Publicado em {new Date(cap.data_criacao).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--input-bg)] group-hover:bg-[var(--accent-primary)]/10 transition-colors">
                        <Play size={12} fill="currentColor" className="text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors">Ler</span>
                      </div>
                      <ChevronRight size={18} className="text-[var(--text-secondary)] group-hover:translate-x-1 group-hover:text-[var(--accent-primary)] transition-all" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-[var(--bg-card)] border border-dashed border-[var(--border-color)] p-12 rounded-3xl flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 bg-[var(--input-bg)] rounded-2xl flex items-center justify-center">
                    <Layers size={32} className="text-[var(--text-secondary)] opacity-20" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-[var(--text-primary)]">Aguardando capítulos</p>
                    <p className="text-sm text-[var(--text-secondary)]">O autor ainda não publicou capítulos para esta obra.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Coluna Direita: Estatísticas e Info Extra */}
        <div className="lg:col-span-4 space-y-8 relative">
          <section className="bg-[var(--bg-card)]/50 backdrop-blur-md border border-[var(--border-color)] p-8 rounded-[2.5rem] shadow-xl space-y-8 sticky top-24">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--accent-primary)] opacity-70">Painel de Dados</h3>
            
            <div className="grid grid-cols-1 gap-5">
              <div className="group p-5 bg-[var(--input-bg)]/40 rounded-3xl border border-[var(--border-color)] flex items-center gap-5 hover:bg-[var(--bg-card)] hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye size={24} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[var(--text-primary)] leading-none">{obra.total_visualizacoes || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-secondary)] mt-2">Visualizações</p>
                </div>
              </div>

              <div className="group p-5 bg-[var(--input-bg)]/40 rounded-3xl border border-[var(--border-color)] flex items-center gap-5 hover:bg-[var(--bg-card)] hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart size={24} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[var(--text-primary)] leading-none">0</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-secondary)] mt-2">Favoritos</p>
                </div>
              </div>

              <div className="group p-5 bg-[var(--input-bg)]/40 rounded-3xl border border-[var(--border-color)] flex items-center gap-5 hover:bg-[var(--bg-card)] hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers size={24} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[var(--text-primary)] leading-none">{obra.capitulos?.length || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-secondary)] mt-2">Capítulos</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[var(--border-color)] space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] opacity-50">Metadados</h4>
              
              <div className="grid gap-5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Idioma</p>
                  <p className="text-xs font-black text-[var(--text-primary)]">Português (BR)</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Classificação</p>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-md border border-emerald-500/20 uppercase tracking-widest">Livre</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Status</p>
                  <span className="px-2 py-0.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] font-black rounded-md border border-[var(--accent-primary)]/20 uppercase tracking-widest">Em Andamento</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}