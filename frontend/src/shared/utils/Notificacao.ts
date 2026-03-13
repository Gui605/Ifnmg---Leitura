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
    }
  }
};