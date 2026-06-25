import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { toggleFollow, getSugestoesMembros, SugestaoPerfil } from '../../shared/services/perfil.service';
import { Notificacao } from '../../shared/utils/Notificacao';

export default function SuggestedUsers() {
  const [suggestions, setSuggestions] = useState<SugestaoPerfil[]>([]);
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [sectionLoading, setSectionLoading] = useState(true);

  useEffect(() => {
    async function loadSuggestions() {
      try {
        setSectionLoading(true);
        const data = await getSugestoesMembros(5);
        setSuggestions(data);
      } catch (err: any) {
        Notificacao.toast.erro(err?.message || 'Erro ao carregar sugestões');
      } finally {
        setSectionLoading(false);
      }
    }

    loadSuggestions();
  }, []);

  const handleFollow = async (id: number, nome: string) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await toggleFollow(id);
      if (res.seguindo) {
        setFollowedUsers(prev => ({ ...prev, [id]: true }));
        Notificacao.toast.sucesso(`Agora você segue @${nome}`);
      } else {
        setFollowedUsers(prev => ({ ...prev, [id]: false }));
        Notificacao.toast.info(`Você deixou de seguir @${nome}`);
      }
    } catch (err: any) {
      Notificacao.toast.erro(err?.message || "Erro ao processar solicitação");
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const [followedUsers, setFollowedUsers] = useState<Record<number, boolean>>({});

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)] shadow-[var(--shadow-elevation-1)]">
      <div className="flex items-center gap-3 mb-6">
        <Users 
          className="text-[var(--accent-primary)]" 
          size={24} 
          strokeWidth={2.5} 
          />
        <h2 className="font-bold text-lg text-[var(--text-primary)] tracking-tight">
          Sugestões
        </h2>
      </div>
      <div className="space-y-6">
        {sectionLoading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--input-bg)] animate-pulse shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <div className="h-3 w-20 bg-[var(--input-bg)] rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-[var(--input-bg)] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center text-xs text-[var(--text-secondary)] py-4">
            Nenhuma sugestão disponível no momento.
          </div>
        ) : (
          suggestions.map((user) => (
            <div key={user.perfil_id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  to={`/perfil/${user.perfil_id}`}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--accent-primary)]/10 shrink-0 transition-transform hover:scale-110 active:scale-95"
                >
                  <img
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user.nome_user}&backgroundColor=b6e3f4`}
                    alt={user.nome_user}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex flex-col min-w-0">
                  <Link
                    to={`/perfil/${user.perfil_id}`}
                    className="text-xs font-bold truncate text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                  >
                    {user.nome_user}
                  </Link>
                </div>
              </div>
              <button
                onClick={() => handleFollow(user.perfil_id, user.nome_user)}
                disabled={loading[user.perfil_id]}
                className={`
                  text-[10px] font-black px-4 py-1.5 rounded-lg border transition-all duration-300 active:scale-95
                  ${loading[user.perfil_id] ? 'opacity-50 cursor-not-allowed' :
                  followedUsers[user.perfil_id]
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                    : 'bg-transparent text-[var(--accent-primary)] border-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white'}
                `}
              >
                {loading[user.perfil_id] ? '...' : followedUsers[user.perfil_id] ? 'Seguindo' : 'Seguir'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
