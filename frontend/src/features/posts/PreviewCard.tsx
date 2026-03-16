// src/features/posts/PreviewCard.tsx
import React, { useState } from "react";
import PostActions from "../feed/PostActions";
import TagList from "../feed/TagList";
import { Info, Eye, EyeOff } from "lucide-react";

interface PreviewProps {
  titulo: string;
  conteudo: string;
  autor: string;
  campus?: string;
  tags: string[];
}

export default function PreviewCard({ titulo, conteudo, autor, campus, tags }: PreviewProps) {
  const [mostrarPrevia, setMostrarPrevia] = useState(true);
  return (
    <div className="sticky top-24 space-y-4">
      <div className="flex items-center gap-1">
        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest px-1">
          Prévia da Publicação
        </p>
        <button
          type="button"
          onClick={() => setMostrarPrevia((v) => !v)}
          aria-label={mostrarPrevia ? "Ocultar prévia" : "Exibir prévia"}
          className="p-1 hover:bg-[var(--accent-primary)]/10 rounded-md text-[var(--text-secondary)]"
          title={mostrarPrevia ? "Ocultar prévia" : "Exibir prévia"}
        >
          {mostrarPrevia ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
      
      {mostrarPrevia ? (
        <article className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[var(--shadow-elevation-1)] overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
          <div className="p-6">
            {/* Autor & Campus */}
            <header className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-[var(--input-bg)] rounded-full flex items-center justify-center font-bold text-xs text-[var(--accent-primary)]">
                {autor.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-sm text-[var(--text-primary)]">
                  {autor}
                </p>
                <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  {campus && (
                    <>
                      <span className="font-medium text-[var(--accent-primary)] whitespace-nowrap">
                        IFNMG - {campus}
                      </span>
                      <span className="opacity-50">•</span>
                    </>
                  )}
                  <span className="whitespace-nowrap italic">Agora mesmo</span>
                </div>
              </div>
            </header>
            
            {/* Título */}
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)] leading-tight">
              {titulo || "Título do seu pergaminho..."}
            </h2>
            
            {/* Tags */}
            {tags.length > 0 && <TagList tags={tags} />}
            
            {/* Conteúdo */}
            <div className="text-[var(--text-primary)] text-sm leading-relaxed line-clamp-6 whitespace-pre-wrap">
              {conteudo || "O conteúdo do seu pergaminho aparecerá aqui enquanto você escreve..."}
            </div>
          </div>
          
          {/* Ações (Desabilitadas na prévia) */}
          <div className="opacity-50 pointer-events-none">
            <PostActions postId={0} upvotes={0} comments={0} />
          </div>
        </article>
      ) : (
        <div className="border border-dashed border-[var(--border-color)] rounded-2xl p-6 text-center text-xs text-[var(--text-secondary)] italic">
          Visualização da prévia oculta
        </div>
      )}
      
      {/* Dica Acadêmica */}
       
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[var(--shadow-elevation-1)] overflow-hidden transition-all duration-300 p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2 text-[var(--accent-primary)] text-sm">
          <Info size={18} strokeWidth={2.5} /> 
          Diretrizes de Postagem
        </h3>
        
        <ul className="text-xs space-y-3 text-[var(--text-secondary)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent-primary)] font-bold">1.</span>
            <span className="leading-relaxed">Mantenha os títulos descritivos e objetivos para facilitar a busca.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent-primary)] font-bold">2.</span>
            <span className="leading-relaxed">Cite fontes confiáveis e evite o compartilhamento de notícias falsas.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent-primary)] font-bold">3.</span>
            <span className="leading-relaxed">Marque tags corretamente para alcançar os estudantes do seu curso.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent-primary)] font-bold">4.</span>
            <span className="leading-relaxed">Mantenha um tom respeitoso, colaborativo e estritamente acadêmico.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
