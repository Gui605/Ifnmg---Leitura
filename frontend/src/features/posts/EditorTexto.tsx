// src/features/posts/EditorTexto.tsx
import React, { useState } from "react";
import { Bold, Italic, Link as LinkIcon, List, Image as ImageIcon, Type, Code } from "lucide-react";

interface EditorProps {
  conteudo: string;
  setConteudo: (val: string) => void;
}

type AbaAtiva = 'texto' | 'midia' | 'link';

export default function EditorTexto({ conteudo, setConteudo }: EditorProps) {
  const [aba, setAba] = useState<AbaAtiva>('texto');

  const formatar = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('post-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    // Se houver seleção, limpa espaços nas bordas para não quebrar o Markdown
    const textoLimpo = selection.trim();
    
    // Tratamento especial para listas/tópicos
    if (prefix === '\n- ') {
      const novoTexto = before + `\n- ${textoLimpo || 'Item'}` + after;
      setConteudo(novoTexto);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 4, start + 4 + (textoLimpo || 'Item').length);
      }, 0);
      return;
    }

    // Texto final que será injetado sem espaços entre o marcador e a palavra
    const textoInjetar = textoLimpo || 'texto';
    const novoTexto = before + prefix + textoInjetar + suffix + after;
    
    setConteudo(novoTexto);
    
    // Devolve o foco de forma cirúrgica mantendo a seleção real destacada
    setTimeout(() => {
      textarea.focus();
      const novoStart = start + prefix.length;
      const novoEnd = novoStart + textoInjetar.length;
      textarea.setSelectionRange(novoStart, novoEnd);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[var(--shadow-elevation-1)] overflow-hidden">
        {/* Abas Limpas */}
        <div className="flex border-b border-[var(--accent-primary)]/10">
          <button 
            onClick={() => setAba('texto')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${aba === 'texto' ? 'text-[var(--accent-primary)] border-[var(--accent-primary)]' : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'}`}
          >
            <Type size={14} /> Texto
          </button>
          <button 
            onClick={() => setAba('midia')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${aba === 'midia' ? 'text-[var(--accent-primary)] border-[var(--accent-primary)]' : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'}`}
          >
            <ImageIcon size={14} /> Mídia
          </button>
          <button 
            onClick={() => setAba('link')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${aba === 'link' ? 'text-[var(--accent-primary)] border-[var(--accent-primary)]' : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'}`}
          >
            <LinkIcon size={14} /> Link
          </button>
        </div>

        {/* Toolbar com fundo leve */}
        <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
          <ToolbarButton icon={<Bold size={18} />} onClick={() => formatar('**', '**')} title="Negrito" />
          <ToolbarButton icon={<Italic size={18} />} onClick={() => formatar('_', '_')} title="Itálico" />
          <ToolbarButton icon={<LinkIcon size={18} />} onClick={() => formatar('[', '](url)')} title="Inserir Link" />
          <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
          <ToolbarButton icon={<List size={18} />} onClick={() => formatar('\n- ')} title="Lista" />
          <ToolbarButton icon={<Code size={18} />} onClick={() => formatar('`', '`')} title="Código" />
        </div>

        <div className="p-6">
          {/* Textarea */}
          <textarea 
            id="post-editor"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="O que você descobriu hoje?"
            className="w-full min-h-[400px] bg-transparent border-none resize-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30 focus:ring-0 p-0 text-lg leading-relaxed scrollbar-hide"
          />
        </div>

        {/* Footer do Editor */}
        <div className="px-6 py-3 bg-[var(--input-bg)]/10 border-t border-[var(--border-color)] flex justify-between items-center text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-widest">
          <span>{conteudo.length} caracteres</span>
          <span>Markdown Suportado</span>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ icon, onClick, title }: { icon: React.ReactNode, onClick: () => void, title: string }) {
  return (
    <button 
      type="button" 
      onClick={onClick}
      title={title}
      className="p-2 hover:bg-[var(--bg-card)] hover:text-[var(--accent-primary)] rounded-md transition-all text-[var(--text-secondary)] active:scale-90"
    >
      {icon}
    </button>
  );
}
