
import { deleteMinhaConta } from '../../shared/services/perfil.service';
import { Notificacao } from '../../shared/utils/Notificacao';
import { useAuth } from '../../shared/utils/authContext';
import { ShieldAlert } from 'lucide-react';

export function SubSeccionPrivacidade() {
  const { logout } = useAuth();

  const handleDeleteAccount = async () => {
    const isConfirmed = await Notificacao.modal.confirmar({
      titulo: 'Excluir Conta',
      texto: 'Esta ação é irreversível. Todos os seus dados serão anonimizados. Deseja continuar?',
      isDestructive: true,
    });

    if (isConfirmed) {
      try {
        await deleteMinhaConta();
        Notificacao.toast.sucesso('Conta excluída com sucesso.');
        logout();
      } catch (error) {
        Notificacao.toast.erro('Erro ao excluir a conta.');
      }
    }
  };

  return (
    <section className="bg-[var(--color-if-red)]/5 p-6 md:p-8 rounded-2xl border border-[var(--color-if-red)]/20 shadow-[var(--shadow-elevation-1)]">
      <div className="flex items-start gap-4 mb-6">
        <div className="size-12 flex items-center justify-center bg-[var(--color-if-red)]/10 rounded-full text-[var(--color-if-red)] shrink-0 shadow-sm">
          <ShieldAlert strokeWidth={1.5} />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[var(--color-if-red)] text-xl font-bold leading-tight font-lexend">
            Zona de Perigo
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            A exclusão da conta é permanente e não pode ser desfeita.
          </p>
        </div>
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--color-if-red)]/10 p-5 rounded-xl mb-6 shadow-sm">
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
          <strong className="text-[var(--color-if-red)]">Importante:</strong> Ao excluir sua conta, todos os seus dados pessoais serão removidos. Seus textos e posts públicos permanecerão na plataforma para manter o contexto das conversas, porém serão completamente <strong>anonimizados</strong> (o autor aparecerá como "Usuário Removido").
        </p>
      </div>
      <button
        onClick={handleDeleteAccount}
        className="bg-[var(--color-if-red)] hover:brightness-110 text-white font-bold py-3 px-8 rounded-xl transition-all text-sm w-full md:w-auto active:scale-95 shadow-lg shadow-red-500/20"
      >
        Excluir minha conta permanentemente
      </button>
    </section>
  );
}
