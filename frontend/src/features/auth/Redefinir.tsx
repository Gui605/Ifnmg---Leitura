import React, { useEffect, useMemo, useState } from 'react';
import logo from '../../shared/assets/ifnmg-logo-vertical.svg';
import ThemeToggle from '../../shared/components/ThemeToggle';
import { CenarioLogin } from '../../shared/utils/Cenario';
import { useTema } from '../../shared/utils/themeHandler';
import { redefinirSenha } from '../../shared/services/auth.service';
import { CheckCircle, XCircle } from 'lucide-react';
import { showToast } from '../../shared/utils/toast';

export default function Redefinir() {
  const { modoEscuro } = useTema();
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erroVisual, setErroVisual] = useState(false);
  const [erroSenha, setErroSenha] = useState('');
  const [erroConfirmar, setErroConfirmar] = useState('');
  const [carregando, setCarregando] = useState(false);

  const token = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('token');
    } catch { return null; }
  }, []);

  useEffect(() => {
    if (!token) {
      (async () => {
        const Swal = await getSwal();
        if (Swal) {
          await Swal.fire({
            title: 'Link inválido',
            text: 'Token ausente ou inválido. Solicite um novo link de recuperação.',
            icon: 'warning',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            confirmButtonColor: 'var(--accent-primary)'
          });
        } else {
          showToast('warning', 'Token ausente ou inválido. Solicite um novo link.');
        }
        window.location.assign('/');
      })();
    }
  }, [token]);

  const senhaTrim = senha.trim();
  const senhaLenOK = senhaTrim.length >= 8;
  const senhaForte = senhaLenOK && /[A-Z]/.test(senhaTrim) && /\d/.test(senhaTrim);
  const confirmarOk = confirmar.trim().length > 0 && confirmar.trim() === senhaTrim;

  async function getSwal() {
    try {
      const mod = await import('sweetalert2');
      return mod.default;
    } catch { return null; }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErroSenha(''); setErroConfirmar('');

    if (!senhaForte) {
      setErroSenha('A senha deve ter 8+ caracteres, 1 maiúscula e 1 número.');
      setErroVisual(true); setTimeout(() => setErroVisual(false), 500);
      return;
    }
    if (!confirmarOk) {
      setErroConfirmar('As senhas não coincidem.');
      setErroVisual(true); setTimeout(() => setErroVisual(false), 500);
      return;
    }
    if (!token) return;

    setCarregando(true);
    try {
      const resp = await redefinirSenha(token, senhaTrim);
      const Swal = await getSwal();
      if (Swal) {
        await Swal.fire({
          title: 'Senha alterada com sucesso!',
          text: 'Agora você já pode acessar sua conta com a nova senha.',
          icon: 'success',
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          confirmButtonText: 'Ir para o Login',
          confirmButtonColor: 'var(--color-if-green)'
        });
      } else {
        showToast('success', 'Senha alterada com sucesso.');
      }
      window.location.assign('/');
    } catch (err: any) {
      setErroVisual(true); setTimeout(() => setErroVisual(false), 500);
    } finally { setCarregando(false); }
  }

  return (
    <div className="relative min-h-screen login-page-container bg-transparent text-[var(--text-primary)]">
      <ThemeToggle />
      <CenarioLogin />
      <main className="relative z-30 flex items-center justify-center min-h-screen p-4">
        <section className="card w-full max-w-md px-8 py-6 backdrop-blur">
          <div className="flex flex-col items-center gap-2 mb-4">
            <img src={logo} alt="IFNMG" className="h-16 w-auto" style={{ filter: modoEscuro ? 'brightness(0) invert(1)' : 'none' }} />
            <h1 className="text-2xl font-semibold">Redefinir Senha</h1>
            <p className="text-[var(--text-secondary)] text-sm">Defina sua nova senha para acessar.</p>
          </div>

          <form noValidate className="space-y-3 w-full" onSubmit={onSubmit}>
            <div className="flex flex-col gap-1 min-h-[95px]">
              <label className="font-semibold">Nova Senha</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={`rounded-md px-3 h-11 w-full ${erroSenha ? 'input-erro' : ''}`}
                />
                {senhaLenOK && (senhaForte) && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                {erroSenha && !senhaLenOK && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
              </div>
              {erroSenha && <span className="text-[var(--color-if-red)] text-xs font-bold">{erroSenha}</span>}

              <div className="mt-2 w-full h-[6px] rounded bg-[var(--bg-card)] overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: senhaTrim.length === 0 ? '0%' : senhaForte ? '100%' : senhaLenOK ? '66%' : '33%',
                    backgroundColor: senhaForte ? 'var(--color-if-green)' : senhaLenOK ? 'var(--accent-primary)' : 'var(--color-if-red)'
                  }}
                />
              </div>
            </div>

            {senhaForte && (
              <div className="flex flex-col gap-1 min-h-[95px] animate-fade-in">
                <label className="font-semibold">Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Repita a senha"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    className={`rounded-md px-3 h-11 w-full ${erroConfirmar ? 'input-erro' : ''}`}
                  />
                  {confirmar.length > 0 && confirmarOk && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                  {erroConfirmar && !confirmarOk && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
                </div>
                {erroConfirmar && <span className="text-[var(--color-if-red)] text-xs font-bold">{erroConfirmar}</span>}
              </div>
            )}

            <button type="submit" disabled={carregando} className={`w-full rounded-md px-3 py-2 btn-entrar ${carregando ? 'btn-sucesso' : erroVisual ? 'btn-erro' : ''}`}>
              {carregando ? 'Enviando...' : 'Redefinir Senha'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
