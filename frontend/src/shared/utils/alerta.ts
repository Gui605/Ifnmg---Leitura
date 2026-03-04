type SwalModule = typeof import('sweetalert2');

async function getSwal(): Promise<SwalModule['default']> {
  const mod = await import('sweetalert2');
  return mod.default;
}

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

export async function alertaSucesso(title: string, text?: string, options: Record<string, any> = {}) {
  const Swal = await getSwal();
  return Swal.fire({ icon: 'success', title, text, ...BASE, customClass: CLASSES, ...options });
}

export async function alertaErro(title: string, text?: string, options: Record<string, any> = {}) {
  const Swal = await getSwal();
  return Swal.fire({ icon: 'error', title, text, ...BASE, customClass: CLASSES, ...options });
}

export async function alertaConfirmacao(title: string, text?: string, options: Record<string, any> = {}) {
  const Swal = await getSwal();
  return Swal.fire({ icon: 'warning', title, text, showCancelButton: true, ...BASE, customClass: CLASSES, ...options });
}

export async function promptEmail(cfg: {
  title: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputValue?: string;
  confirmText?: string;
  cancelText?: string;
}) {
  const Swal = await getSwal();
  const {
    title,
    inputLabel = 'Informe seu e-mail institucional',
    inputPlaceholder = 'exemplo@aluno.ifnmg.edu.br',
    inputValue = '',
    confirmText = 'Enviar',
    cancelText = 'Cancelar'
  } = cfg;
  return Swal.fire({
    title,
    input: 'email',
    inputLabel,
    inputPlaceholder,
    inputValue,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    ...BASE,
    customClass: CLASSES,
    inputValidator: (val) => {
      const v = (val || '').trim();
      if (v.length < 5 || !v.includes('@')) return 'Informe um e-mail válido.';
      return undefined as any;
    }
  });
}

export async function alertaInfo(title: string, text: string, options: Record<string, any> = {}) {
  const Swal = await getSwal();
  return Swal.fire({ icon: 'info', title, text, ...BASE, customClass: CLASSES, ...options });
}

export async function alertaDecisao(title: string, text: string, confirmText: string, options: Record<string, any> = {}) {
  const Swal = await getSwal();
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: 'var(--color-if-red)',
    ...BASE,
    customClass: CLASSES,
    ...options
  });
}
