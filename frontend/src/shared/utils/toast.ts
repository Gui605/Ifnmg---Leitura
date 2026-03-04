import Swal from 'sweetalert2';

export type ToastLevel = 'info' | 'success' | 'warning' | 'error';

export function showToast(level: ToastLevel, title: string, text?: string) {
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
}
