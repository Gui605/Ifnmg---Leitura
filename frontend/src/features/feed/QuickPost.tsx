import React from "react";
import { useAuth } from "../../shared/utils/authContext";

export default function QuickPost() {
  const { perfil } = useAuth();

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
