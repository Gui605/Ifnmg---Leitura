import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { registrarDenuncia } from '../../shared/services/denuncia.service';
import { Notificacao } from '../../shared/utils/Notificacao';

interface ModalDenunciaProps {
  postId: number;
  onClose: () => void;
}

const TIPOS_DENUNCIA = [
  { id: 1, label: 'Spam / Propaganda' },
  { id: 2, label: 'Conteúdo Ofensivo' },
  { id: 3, label: 'Plágio / Cópia' },
  { id: 4, label: 'Informação Incorreta' },
  { id: 5, label: 'Outro Motivo' }
];

export function ModalDenuncia({ postId, onClose }: ModalDenunciaProps) {
  const [tipoSelecionado, setTipoSelecionado] = useState<number | null>(null);
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!tipoSelecionado) return;
    
    setLoading(true);
    try {
      await registrarDenuncia(postId, {
        denuncia_tipo: tipoSelecionado,
        descricao: descricao.trim() || undefined
      });
      Notificacao.toast.sucesso("Denúncia enviada para análise.", "Obrigado por ajudar a manter a comunidade segura.");
      onClose();
    } catch (err) {
      // Erro já tratado pelo interceptor do apiClient
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal / Bottom Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-t-[2rem] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <header className="p-6 border-b border-[var(--border-color)]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-if-red)]/10 text-[var(--color-if-red)] rounded-xl">
              <AlertTriangle size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-black font-lexend text-[var(--text-primary)] tracking-tight">
              Denunciar Publicação
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--input-bg)] rounded-full transition-all text-[var(--text-secondary)]"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </header>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <section>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-4">
              Por que você está denunciando?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIPOS_DENUNCIA.map((tipo) => (
                <button
                  key={tipo.id}
                  onClick={() => setTipoSelecionado(tipo.id)}
                  className={`
                    flex items-center justify-center text-center px-4 py-3 rounded-xl font-bold text-sm transition-all border-2
                    min-h-[44px] touch-manipulation
                    ${tipoSelecionado === tipo.id 
                      ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-sm' 
                      : 'bg-[var(--input-bg)] border-transparent text-[var(--text-secondary)] hover:border-[var(--border-color)]'}
                  `}
                >
                  {tipo.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-4">
              Detalhes adicionais (Opcional)
            </label>
            <textarea
              autoFocus
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva brevemente o problema..."
              className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--accent-primary)] rounded-2xl p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 resize-none min-h-[120px] transition-all outline-none"
            />
          </section>
        </div>

        {/* Footer */}
        <footer className="p-6 bg-[var(--input-bg)]/30 border-t border-[var(--border-color)]/20 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-black text-sm text-[var(--text-secondary)] hover:bg-[var(--input-bg)] transition-all uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!tipoSelecionado || loading}
            className={`
              flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white transition-all uppercase tracking-widest shadow-lg active:scale-95
              ${!tipoSelecionado || loading 
                ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-[var(--color-if-red)] hover:opacity-90'}
            `}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Enviar Denúncia'}
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
