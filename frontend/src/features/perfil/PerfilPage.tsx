import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import PerfilSidebar from './PerfilSidebar';
import PerfilConquistas from './PerfilConquistas';
import PerfilTabs from './PerfilTabs';
import { getMeuPerfil, getPerfilPublico, toggleFollow } from '../../shared/services/perfil.service';
import { PerfilResumo } from '../../shared/types/perfil.types';
import Header from '../../shared/components/Header';
import { Notificacao } from '../../shared/utils/Notificacao';

import { useAuth } from '../../shared/utils/authContext';

export default function PerfilPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { perfil: userLogado } = useAuth();
  const [perfil, setPerfil] = useState<PerfilResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const isOwnProfile = !id || id === 'me' || Number(id) === userLogado?.perfil_id;

  useEffect(() => {
    setLoading(true);
    const fetchPerfil = isOwnProfile 
      ? getMeuPerfil()
      : getPerfilPublico(Number(id));

    fetchPerfil
      .then(setPerfil)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, isOwnProfile]);

  const handleToggleFollow = async () => {
    if (!perfil?.perfil_id || isOwnProfile) return;
    
    // Optimistic UI: Salva estado anterior para rollback
    const previousPerfil = { ...perfil };
    const isFollowing = !perfil.is_following;
    
    // Atualiza localmente antes da chamada
    setPerfil(prev => {
      if (!prev) return null;
      return {
        ...prev,
        is_following: isFollowing,
        estatisticas: prev.estatisticas ? {
          ...prev.estatisticas,
          seguidores: isFollowing 
            ? prev.estatisticas.seguidores + 1 
            : prev.estatisticas.seguidores - 1
        } : undefined
      };
    });

    setActionLoading(true);
    try {
      const res = await toggleFollow(perfil.perfil_id);
      
      // Sincroniza com o backend para garantir integridade (opcional, mas recomendado)
      const updatedPerfil = await getPerfilPublico(perfil.perfil_id);
      setPerfil(updatedPerfil);
      
      Notificacao.toast.sucesso(res.seguindo ? `Seguindo @${perfil.nome_user}` : `Deixou de seguir @${perfil.nome_user}`);
    } catch (err: any) {
      // Rollback em caso de erro
      setPerfil(previousPerfil);
      Notificacao.toast.erro(err?.message || "Erro ao processar ação");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  const profileActions = (
    <div className="flex items-center gap-2">
      {isOwnProfile ? (
        <button 
          onClick={() => navigate('/configuracoes')}
          className="flex items-center gap-2 bg-[var(--input-bg)] text-[var(--text-primary)] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[var(--border-color)] transition-all"
        >
          <Settings size={16} />
          <span className="hidden sm:inline">Editar Perfil</span>
        </button>
      ) : (
        <button 
          onClick={handleToggleFollow}
          disabled={actionLoading}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 ${
            perfil?.is_following ? 'bg-[var(--input-bg)] text-[var(--text-primary)]' : 'bg-[var(--accent-primary)] text-white'
          }`}
        >
          {actionLoading ? <Loader2 size={16} className="animate-spin" /> : (perfil?.is_following ? <UserMinus size={16} /> : <UserPlus size={16} />)}
          {perfil?.is_following ? 'Seguindo' : 'Seguir'}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Header 
        perfil={perfil}
        title={perfil ? `Perfil de ${perfil.nome_user}` : "Perfil"}
        showSearch={false}
        onBack={() => navigate('/dashboard')}
        actions={profileActions}
        toggleLeft={() => setIsSidebarVisible(!isSidebarVisible)}
        isLeftVisible={isSidebarVisible}
      />

      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 p-6 lg:flex-row transition-all duration-500">
        {isSidebarVisible && (
          <aside className="flex w-full flex-col gap-6 lg:w-1/3 animate-in fade-in slide-in-from-left-4 duration-300">
            <PerfilSidebar perfil={perfil} />
          </aside>
        )}
        <div className={`flex w-full flex-col gap-6 transition-all duration-500 ${isSidebarVisible ? 'lg:w-2/3' : 'w-full max-w-4xl mx-auto'}`}>
          <PerfilConquistas perfil={perfil} />
          <PerfilTabs userId={perfil?.perfil_id || 0} isMeuPerfil={isOwnProfile} />
        </div>
      </main>
    </div>
  );
}