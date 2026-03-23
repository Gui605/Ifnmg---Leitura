import React, { useEffect, useState } from "react";
import { getMeuPerfil } from "../../shared/services/perfil.service";
import { PerfilResumo } from "../../shared/types/perfil.types";

export default function QuickPost() {
  const [perfil, setPerfil] = useState<PerfilResumo | null>(null);

  useEffect(() => {
    getMeuPerfil()
      .then(setPerfil)
      .catch(() => {
        setPerfil({
          nome_user: "Visitante",
          score_karma: 0,
          reading_points: 0,
          level: 1,
          xp: 0
        });
      });
  }, []);

  const inicial = perfil ? perfil.nome_user.charAt(0).toUpperCase() : "?";

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 flex items-center gap-4 shadow-[var(--shadow-elevation-1)]">
      <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-white font-bold">
        {inicial}
      </div>
      <div className="flex-1 bg-[var(--input-bg)] rounded-full px-5 py-2.5 text-sm text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--hover-bg)] transition-colors">
        Comece a escrever seu pergaminho...
      </div>
    </div>
  );
}
