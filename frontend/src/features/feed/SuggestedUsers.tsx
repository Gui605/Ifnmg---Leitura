import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { toggleFollow } from '../../shared/services/perfil.service';
import { Notificacao } from '../../shared/utils/Notificacao';

interface UserSuggestion {
  perfil_id: number;
  nome_user: string;
}

// Mock inicial enquanto não existe endpoint de sugestão real, 
// mas já implementando a lógica de follow real
const MOCK_SUGGESTIONS: UserSuggestion[] = [
  { perfil_id: 2, nome_user: "CarlosEduardo" },
  { perfil_id: 3, nome_user: "JulianaMendes" }
];

export default function SuggestedUsers() {
  const [suggestions] = useState<UserSuggestion[]>(MOCK_SUGGESTIONS);
  const [loading, setLoading] = useState<Record<number, boolean>>({});

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
        {suggestions.map((user) => (
          <div key={user.perfil_id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--accent-primary)]/10 shrink-0">
                <img 
                  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user.nome_user}&backgroundColor=b6e3f4`} 
                  alt={user.nome_user}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate text-[var(--text-primary)]">{user.nome_user}</span>
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
        ))}
      </div>
    </div>
  );
}
