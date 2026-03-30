
import { useState } from 'react';
import { updateSenha } from '../../shared/services/perfil.service';
import { Notificacao } from '../../shared/utils/Notificacao';
import { Laptop, Smartphone } from 'lucide-react';
import { useAuth } from '../../shared/utils/authContext';

export function SubSeccionSeguranca() {
  const { logout } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarNovaSenha) {
      Notificacao.toast.erro('As novas senhas não coincidem.');
      return;
    }

    try {
      await updateSenha(senhaAtual, novaSenha, confirmarNovaSenha);
      Notificacao.toast.sucesso('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
    } catch (error) {
      Notificacao.toast.erro('Erro ao alterar a senha. Verifique sua senha atual.');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="bg-[var(--bg-card)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-elevation-1)]">
        <div className="flex flex-col mb-6">
          <h2 className="text-[var(--text-primary)] text-xl font-bold leading-tight font-lexend">
            Alterar Senha
          </h2>
          <p className="text-[var(--text-secondary)] text-sm">Use uma senha forte com pelo menos 8 caracteres.</p>
        </div>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl" onSubmit={handleChangePassword}>
          <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
            <label className="text-sm font-bold text-[var(--text-primary)] font-lexend">Senha Atual</label>
            <input
              className="rounded-xl border-[var(--border-color)] bg-[var(--input-bg)] focus:border-[var(--color-if-green)] focus:ring-0 w-full p-3 text-sm transition-all duration-300"
              placeholder="••••••••"
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
          </div>
          <div className="hidden md:block"></div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[var(--text-primary)] font-lexend">Nova Senha</label>
            <input
              className="rounded-xl border-[var(--border-color)] bg-[var(--input-bg)] focus:border-[var(--color-if-green)] focus:ring-0 w-full p-3 text-sm transition-all duration-300"
              placeholder="Nova senha"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[var(--text-primary)] font-lexend">Confirmar Nova Senha</label>
            <input
              className="rounded-xl border-[var(--border-color)] bg-[var(--input-bg)] focus:border-[var(--color-if-green)] focus:ring-0 w-full p-3 text-sm transition-all duration-300"
              placeholder="Repita a nova senha"
              type="password"
              value={confirmarNovaSenha}
              onChange={(e) => setConfirmarNovaSenha(e.target.value)}
            />
          </div>
          <div className="col-span-2 pt-2">
            <button
              className="bg-[var(--accent-primary)] hover:brightness-110 text-white font-bold py-3 px-6 rounded-xl transition-all text-sm active:scale-95"
              type="submit"
            >
              Atualizar Senha
            </button>
          </div>
        </form>
      </section>

      <section className="bg-[var(--bg-card)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-elevation-1)]">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex flex-col">
            <h2 className="text-[var(--text-primary)] text-xl font-bold leading-tight font-lexend">
              Gerenciamento de Sessões
            </h2>
            <p className="text-[var(--text-secondary)] text-sm">Você está conectado em 2 dispositivos.</p>
          </div>
          <button 
            onClick={() => logout(true)}
            className="flex items-center gap-2 border-2 border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 font-bold py-2 px-4 rounded-xl transition-all text-sm active:scale-95"
          >
            Sair de todos os dispositivos
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="size-10 flex items-center justify-center bg-[var(--bg-card)] shadow-[var(--shadow-elevation-1)] rounded-full text-[var(--accent-primary)] transition-transform duration-300 hover:scale-110">
                <Laptop strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)] font-lexend">Windows - Chrome</p>
                <p className="text-xs text-[var(--text-secondary)]">Montes Claros, Brasil • <span className="text-[var(--accent-primary)] font-bold">Sessão atual</span></p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-[var(--accent-primary)]/ border border-[var(--border-color)] rounded-xl hover:border-[var(--accent-primary)]/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="size-10 flex items-center justify-center bg-[var(--bg-card)] shadow-[var(--shadow-elevation-1)] rounded-full text-[var(--accent-primary)] transition-transform duration-300 hover:scale-110">
                <Smartphone strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)] font-lexend">iPhone 15 - App IFNMG Leitura</p>
                <p className="text-xs text-[var(--text-secondary)]">Belo Horizonte, Brasil • <span className="text-[var(--accent-primary)] font-bold">Ativo há 3 horas</span></p>
              </div>
            </div>
            
              
          </div>
        </div>
      </section>
    </div>
  );
}
