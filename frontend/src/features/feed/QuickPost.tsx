import React, { useEffect, useState } from "react";
import { Image, Paperclip } from "lucide-react";
import { getMeuPerfil } from "../../shared/services/perfil.service";
import { PerfilResumo } from "../../shared/types/perfil.types";

export default function QuickPost() {
  const [perfil, setPerfil] = useState<PerfilResumo | null>(null);

  useEffect(() => {
    getMeuPerfil()
      .then(setPerfil)
      .catch(() => {
        // Fallback silencioso para mock se o backend falhar/não autenticado
        setPerfil({
          nome_user: "Visitante",
          score_karma: 0,
          reading_points: 0
        });
      });
  }, []);

  const inicial = perfil?.nome_user?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 flex items-center gap-4 shadow-sm">

      <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-white font-bold">
        {inicial}
      </div>

      <div className="flex-1 bg-[var(--accent-primary)]/5 rounded-full px-4 py-2 text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--accent-primary)]/10 transition">
        Qual sua nova descoberta?
      </div>

      <div className="flex items-center gap-2 text-[var(--accent-primary)]">

        <button className="p-2 rounded-full hover:bg-[var(--input-bg)] transition">
          <Image size={18} />
        </button>

        <button className="p-2 rounded-full hover:bg-[var(--input-bg)] transition">
          <Paperclip size={18} />
        </button>

      </div>
    </div>
  );
}
