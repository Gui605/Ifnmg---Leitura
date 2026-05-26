import { Medal, Star, History, Award, BookOpen, Target } from 'lucide-react';
import { PerfilResumo } from '../../shared/types/perfil.types';
import { ProgressBarXP, getPatentePorNivel } from '../../shared/components/ProgressBarXP';

interface PerfilConquistasProps {
  perfil: PerfilResumo | null;
}

export default function PerfilConquistas({ perfil }: PerfilConquistasProps) {
  if (!perfil) return null;

  const patente = perfil.titulo_ativo || getPatentePorNivel(perfil.level);

  // Mapeamento de ícones por categoria de título
  const getIconeCategoria = (categoria: string) => {
    switch (categoria.toUpperCase()) {
      case 'POSTS': return <BookOpen size={24} strokeWidth={1.5} />;
      case 'LEITURA': return <History size={24} strokeWidth={1.5} />;
      case 'NIVEL': return <Target size={24} strokeWidth={1.5} />;
      default: return <Award size={24} strokeWidth={1.5} />;
    }
  };

  return (
    <section className="rounded-xl bg-[var(--bg-card)] p-8 shadow-sm border border-[var(--border-color)]/20">
      <div className="mb-8 flex items-end justify-between">
        <div className="space-y-1">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] font-lexend opacity-70">Status de RPG Acadêmico</h3>
          <p className="text-4xl font-black text-[var(--accent-primary)] font-lexend tracking-tighter">NÍVEL {perfil.level}</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] font-black uppercase tracking-wider rounded-md font-lexend">
              Patente: {patente}
            </span>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-bold text-[var(--text-secondary)] font-lexend uppercase tracking-widest opacity-50">Soma de XP Total</p>
          <p className="text-xl font-black text-[var(--text-primary)] font-lexend">{perfil.xp.toLocaleString()} XP</p>
        </div>
      </div>
      
      <div className="p-4 bg-[var(--input-bg)]/30 rounded-2xl border border-[var(--border-color)]/10">
        <ProgressBarXP xp={perfil.xp} level={perfil.level} showLabels={true} />
      </div>

      <div className="mt-12">
        <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2 font-lexend">
          <Medal size={16} strokeWidth={1.5} className="text-[var(--accent-primary)]" /> Títulos e Conquistas
        </h4>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {perfil.titulos && perfil.titulos.length > 0 ? (
            perfil.titulos.map((conquista) => (
              <div 
                key={conquista.titulo.titulo_id}
                className={`group relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md ${
                  conquista.esta_ativo 
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 ring-1 ring-[var(--accent-primary)]' 
                    : 'border-[var(--border-color)]/10 bg-[var(--input-bg)]/30'
                }`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${
                  conquista.esta_ativo 
                    ? 'bg-[var(--accent-primary)] text-white shadow-lg' 
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] shadow-sm border border-[var(--border-color)]/20'
                }`}>
                  {getIconeCategoria(conquista.titulo.categoria)}
                </div>
                <div className="text-center">
                  <span className={`block text-[10px] font-black uppercase tracking-tighter font-lexend ${
                    conquista.esta_ativo ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
                  }`}>
                    {conquista.titulo.nome}
                  </span>
                  {conquista.esta_ativo && (
                    <span className="mt-1 block text-[8px] font-bold text-[var(--accent-primary)]/70 uppercase font-lexend">Ativo</span>
                  )}
                </div>
                
                {/* exibir descrição ao passar o mouse */}
                <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 z-10 font-lexend shadow-xl">
                  {conquista.titulo.descricao || 'Título de Honra'}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-[var(--text-secondary)]">
              <Star size={32} strokeWidth={1.5} className="mb-2 opacity-20" />
              <p className="text-xs font-medium font-lexend">Nenhum título conquistado ainda.</p>
              <p className="text-[10px] font-lexend">Continue sua jornada acadêmica para ganhar XP!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
