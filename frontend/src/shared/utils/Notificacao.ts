import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

// --- Tipagens ---
export type ToastLevel = 'info' | 'success' | 'warning' | 'error';

export type ModalConfig = {
  titulo: string;
  texto?: string;
  textoConfirmar?: string;
  mostrarBotaoCancelar?: boolean;
  textoCancelar?: string;
} & Partial<SweetAlertOptions>;

// --- Configurações compartilhadas ---
const getSwal = async () => (await import('sweetalert2')).default;

const BASE = {
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  backdrop: 'rgba(0, 0, 0, 0.4) saturate(150%) backdrop-filter blur(8px)',
};

const CLASSES = {
  actions: 'flex-col sm:flex-row gap-2 w-full px-4',
  confirmButton: 'w-full sm:w-auto order-1',
  denyButton: 'w-full sm:w-auto order-2',
  cancelButton: 'w-full sm:w-auto order-3'
};

// --- Notificacao Namespace ---
export const Notificacao = {
  
  // 1. NON-BLOCKING (TOASTS)
  toast: {
    show: (level: ToastLevel, title: string, text?: string) => {
      return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: level,
        title,
        text,
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        background: 'var(--bg-card)',
        color: 'var(--text-primary)'
      });
    },
    sucesso: (title: string, text?: string) => Notificacao.toast.show('success', title, text),
    aviso: (title: string, text?: string) => Notificacao.toast.show('warning', title, text),
    erro: (title: string, text?: string) => Notificacao.toast.show('error', title, text),
    info: (title: string, text?: string) => Notificacao.toast.show('info', title, text),
  },

  // 2. BLOCKING (MODALS / DIALOGS)
  modal: {
    sucesso: async (titleOrCfg: string | ModalConfig): Promise<SweetAlertResult> => {
      const swal = await getSwal();
      if (typeof titleOrCfg === 'string') {
        return swal.fire({ icon: 'success', title: titleOrCfg, ...BASE, customClass: CLASSES });
      }
      const { titulo, texto, textoConfirmar, mostrarBotaoCancelar, textoCancelar, ...options } = titleOrCfg;
      return swal.fire({
        icon: 'success',
        title: titulo,
        text: texto,
        confirmButtonText: textoConfirmar || 'OK',
        showCancelButton: mostrarBotaoCancelar,
        cancelButtonText: textoCancelar || 'Cancelar',
        ...BASE,
        customClass: CLASSES,
        ...options
      } as SweetAlertOptions);
    },

    erro: async (titleOrCfg: string | ModalConfig): Promise<SweetAlertResult> => {
      const swal = await getSwal();
      if (typeof titleOrCfg === 'string') {
        return swal.fire({ icon: 'error', title: titleOrCfg, ...BASE, customClass: CLASSES });
      }
      const { titulo, texto, ...options } = titleOrCfg;
      return swal.fire({
        icon: 'error',
        title: titulo,
        text: texto,
        ...BASE,
        customClass: CLASSES,
        ...options
      } as SweetAlertOptions);
    },

    info: async (titleOrCfg: string | ModalConfig): Promise<SweetAlertResult> => {
      const swal = await getSwal();
      if (typeof titleOrCfg === 'string') {
        return swal.fire({ icon: 'info', title: titleOrCfg, ...BASE, customClass: CLASSES });
      }
      const { titulo, texto, ...options } = titleOrCfg;
      return swal.fire({
        icon: 'info',
        title: titulo,
        text: texto,
        ...BASE,
        customClass: CLASSES,
        ...options
      } as SweetAlertOptions);
    },

    aviso: async (titleOrCfg: string | ModalConfig): Promise<SweetAlertResult> => {
      const swal = await getSwal();
      if (typeof titleOrCfg === 'string') {
        return swal.fire({ icon: 'warning', title: titleOrCfg, ...BASE, customClass: CLASSES });
      }
      const { titulo, texto, textoConfirmar, mostrarBotaoCancelar, textoCancelar, ...options } = titleOrCfg;
      return swal.fire({
        icon: 'warning',
        title: titulo,
        text: texto,
        confirmButtonText: textoConfirmar || 'OK',
        showCancelButton: mostrarBotaoCancelar,
        cancelButtonText: textoCancelar || 'Cancelar',
        ...BASE,
        customClass: CLASSES,
        ...options
      } as SweetAlertOptions);
    },

    confirmar: async (titleOrCfg: string | (ModalConfig & { isDestructive?: boolean })): Promise<boolean | null> => {
      const swal = await getSwal();
      if (typeof titleOrCfg === 'string') {
        const res = await swal.fire({ icon: 'warning', title: titleOrCfg, showCancelButton: true, ...BASE, customClass: CLASSES });
        if (res.isConfirmed) return true;
        if (res.isDenied) return false;
        return null;
      }
      const { titulo, texto, textoConfirmar, isDestructive, mostrarBotaoCancelar, textoCancelar, ...options } = titleOrCfg;
      const res = await swal.fire({
        icon: 'warning',
        title: titulo,
        text: texto,
        showCancelButton: mostrarBotaoCancelar !== false,
        confirmButtonText: textoConfirmar || 'Confirmar',
        cancelButtonText: textoCancelar || 'Cancelar',
        confirmButtonColor: isDestructive ? 'var(--color-if-red)' : undefined,
        ...BASE,
        customClass: CLASSES,
        ...options
      } as SweetAlertOptions);

      if (res.isConfirmed) return true;
      if (res.isDenied) return false;
      return null;
    },

    promptEmail: async (cfg: {
      valorInicial?: string;
      title?: string;
      inputLabel?: string;
      inputPlaceholder?: string;
      inputValue?: string;
      confirmText?: string;
      cancelText?: string;
    }) => {
      const swal = await getSwal();
      const res = await swal.fire({
        title: cfg.title || 'Recuperar Acesso',
        input: 'email',
        inputLabel: cfg.inputLabel || 'Informe seu e-mail institucional',
        inputPlaceholder: cfg.inputPlaceholder || 'exemplo@aluno.ifnmg.edu.br',
        inputValue: cfg.valorInicial || cfg.inputValue || '',
        showCancelButton: true,
        confirmButtonText: cfg.confirmText || 'Enviar',
        cancelButtonText: cfg.cancelText || 'Cancelar',
        ...BASE,
        customClass: CLASSES,
        inputValidator: (val) => {
          const v = (val || '').trim();
          if (v.length < 5 || !v.includes('@')) return 'Informe um e-mail válido.';
          return undefined as any;
        }
      });
      return res.value;
    },

    levelUp: async (cfg: { 
      novoNivel: number; 
      novoTitulo?: string; 
      onEquipTitle?: () => void 
    }) => {
      const swal = await getSwal();
      return swal.fire({
        title: `<div class="font-lexend text-[var(--accent-primary)] text-2xl font-black uppercase tracking-tighter">Level Up!</div>`,
        html: `
          <div class="flex flex-col items-center gap-4 py-4">
            <div class="relative">
              <div class="size-24 bg-[var(--accent-primary)]/10 rounded-full flex items-center justify-center text-[var(--accent-primary)] animate-bounce">
                <span class="text-4xl font-black">${cfg.novoNivel}</span>
              </div>
              <div class="absolute -top-2 -right-2 size-8 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </div>
            </div>
            <div class="text-center">
              <p class="text-[var(--text-primary)] font-medium">Parabéns! Você alcançou o nível ${cfg.novoNivel}.</p>
              ${cfg.novoTitulo ? `
                <div class="mt-4 p-3 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 rounded-xl">
                  <p class="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">Novo Título Desbloqueado</p>
                  <p class="text-lg font-black text-[var(--accent-primary)] font-lexend mt-1">${cfg.novoTitulo}</p>
                </div>
              ` : ''}
            </div>
          </div>
        `,
        showConfirmButton: !!cfg.novoTitulo,
        confirmButtonText: 'Equipar Agora',
        showCancelButton: true,
        cancelButtonText: cfg.novoTitulo ? 'Depois' : 'Continuar',
        confirmButtonColor: 'var(--accent-primary)',
        ...BASE,
        customClass: {
          ...CLASSES,
          popup: 'rounded-3xl border-2 border-[var(--accent-primary)]/20 shadow-2xl',
        }
      }).then((result) => {
        if (result.isConfirmed && cfg.onEquipTitle) {
          cfg.onEquipTitle();
        }
        return result;
      });
    }
  }
};