import { User, Mail, School, Globe, Medal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PerfilResumo } from '../../shared/types/perfil.types';
import { ProgressBarXP, getPatentePorNivel } from '../../shared/components/ProgressBarXP';

interface PerfilSidebarProps {
  perfil: PerfilResumo | null;
  isOwnProfile?: boolean;
}

export default function PerfilSidebar({ perfil, isOwnProfile = false }: PerfilSidebarProps) {
  if (!perfil) return null; 

  const patente = perfil.titulo_ativo || getPatentePorNivel(perfil.level);

  return (
    <>
      <div className="rounded-xl bg-[var(--bg-card)] p-6 shadow-sm border border-[var(--border-color)]/5">
        <div className="flex flex-col items-center text-center">
          <Link to="/perfil/me" className="mb-4 h-32 w-32 rounded-full border-4 border-[var(--accent-primary)]/20 overflow-hidden bg-[#b6e3f4] transition-transform hover:scale-105 active:scale-95">
            <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${perfil.nome_user}&backgroundColor=b6e3f4`} 
              alt={perfil.nome_user} 
              className="h-full w-full object-cover" 
            />
          </Link>
          <h1 className="text-2xl font-bold font-lexend text-[var(--text-primary)]">{perfil.nome_user}</h1>
          <p className="text-[var(--accent-primary)] font-bold font-lexend uppercase tracking-wider text-sm mt-1">{patente}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)] font-lexend">{perfil.nome_campus}</p>
          
          <div className="mt-6 flex w-full flex-col gap-2">
            <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)] px-1 font-lexend uppercase tracking-widest">
              <span>Nível {perfil.level}</span>
              <div className="flex items-center gap-1 text-[var(--accent-primary)]">
                <Medal size={12} />
                <span>RPG ACADÊMICO</span>
              </div>
            </div>
            <ProgressBarXP xp={perfil.xp} level={perfil.level} showLabels={true} />
          </div>

          <div className="mt-6 flex w-full flex-col gap-3">
            {/* O botão de editar perfil só renderiza se for o perfil do próprio usuário logado */}
            {isOwnProfile && (
              <button className="w-full rounded-lg bg-[var(--accent-primary)] py-2 font-bold text-white transition-opacity hover:opacity-90 font-lexend shadow-sm active:scale-[0.98]">
                Editar Perfil
              </button>
            )}
            
            <div className="flex justify-center gap-4 text-[var(--text-secondary)]">
              <Globe size={18} strokeWidth={1.5} className="cursor-pointer hover:text-[var(--accent-primary)] transition-colors" />
              <School size={18} strokeWidth={1.5} className="cursor-pointer hover:text-[var(--accent-primary)] transition-colors" />
              <Mail size={18} strokeWidth={1.5} className="cursor-pointer hover:text-[var(--accent-primary)] transition-colors" />
            </div>
          </div>

        </div>

        {perfil.bio && (
          <div className="mt-8 border-t border-[var(--border-color)]/10 pt-6">
            <h3 className="font-bold mb-3 font-lexend">Sobre</h3>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)] font-lexend">{perfil.bio}</p>
          </div>
        )}
      </div>
      {perfil.estatisticas && (
        <div className="rounded-xl bg-[var(--bg-card)] p-6 shadow-sm border border-[var(--border-color)]/5">
          <h3 className="font-bold mb-4 flex items-center gap-2 font-lexend"><User size={16} strokeWidth={1.5} className="text-[var(--accent-primary)]" /> Estatísticas</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between rounded-lg bg-[var(--input-bg)] p-3">
              <span className="text-sm font-medium font-lexend">Pergaminhos</span>
              <span className="text-lg font-bold text-[var(--accent-primary)] font-lexend">{perfil.estatisticas.pergaminhos}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--input-bg)] p-3">
              <span className="text-sm font-medium font-lexend">Curtidas</span>
              <span className="text-lg font-bold text-[var(--accent-primary)] font-lexend">{perfil.estatisticas.curtidas}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--input-bg)] p-3">
              <span className="text-sm font-medium font-lexend">Seguidores</span>
              <span className="text-lg font-bold text-[var(--accent-primary)] font-lexend">{perfil.estatisticas.seguidores}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
