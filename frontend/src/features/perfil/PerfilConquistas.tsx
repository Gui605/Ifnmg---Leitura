import { Medal, Star, History, Award, BookOpen, Target, ChevronDown } from 'lucide-react';
import { PerfilResumo } from '../../shared/types/perfil.types';

interface PerfilConquistasProps {
  perfil: PerfilResumo | null;
}

export default function PerfilConquistas({ perfil }: PerfilConquistasProps) {
  if (!perfil) return null;

  // Lógica dinâmica de XP baseada no nível (1000 XP por nível conforme service)
  const XP_POR_NIVEL = 1000;
  const xpAtualNoNivel = perfil.xp % XP_POR_NIVEL;
  const progresso = (xpAtualNoNivel / XP_POR_NIVEL) * 100;

  // Função para determinar a Patente conforme gamificacao.config.ts
  const getPatente = (nivel: number) => {
    if (nivel >= 50) return "Mestre Lendário";
    if (nivel >= 30) return "Erudito";
    if (nivel >= 20) return "Pesquisador";
    if (nivel >= 10) return "Explorador";
    return "Calouro";
  };

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
    <section className="rounded-xl bg-[var(--bg-card)] p-6 shadow-sm border border-[var(--border-color)]/20">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] font-lexend">Status Acadêmico</h3>
          <p className="text-3xl font-black text-[var(--accent-primary)] font-lexend">NÍVEL {perfil.level}</p>
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-tight font-lexend">
            Patente: <span className="text-[var(--accent-primary)]">{getPatente(perfil.level)}</span>
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-[var(--text-secondary)] font-lexend">{xpAtualNoNivel.toLocaleString()} / {XP_POR_NIVEL.toLocaleString()} XP</p>
        </div>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/5">
        <div 
          className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(23,207,38,0.2)]" 
          style={{ width: `${progresso}%` }}
        ></div>
      </div>

      <div className="mt-8">
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
                
                {/* Tooltip no hover */}
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
