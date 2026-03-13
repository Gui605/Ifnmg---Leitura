//frontend/src/features/auth/Login.tsx 
import React, { useEffect, useState } from 'react';
import logo from '../../shared/assets/ifnmg-logo-vertical.svg';
import ThemeToggle from '../../shared/components/ThemeToggle';
import { fazerLogin, registrarUsuario, solicitarRecuperacao } from '../../shared/services/auth.service';
import { CenarioLogin } from '../../shared/utils/Cenario';
import { useTema } from '../../shared/utils/themeHandler';
import { useAuth } from '../../shared/utils/authContext';
import { AppError } from '../../shared/utils/appError';
import { ErrorCodes } from '../../shared/types/errors';
import { CheckCircle, XCircle, Mail, Lock, BookOpen, AlertCircle, User, AtSign, Home, Calendar } from 'lucide-react';
import { Notificacao } from '../../shared/utils/Notificacao';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';

export default function Login() {
  const { modoEscuro } = useTema();
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [ehLogin, setEhLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState(''); // nome completo
  const [apelido, setApelido] = useState(''); // nome de exibição (nickname)
  const [campus, setCampus] = useState('');
  const [nascimento, setNascimento] = useState(''); // YYYY-MM-DD
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [erroVisual, setErroVisual] = useState(false);
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [erroNome, setErroNome] = useState('');
  const [erroApelido, setErroApelido] = useState('');
  const [erroCampus, setErroCampus] = useState('');
  const [erroNascimento, setErroNascimento] = useState('');
  const [erroConfirmar, setErroConfirmar] = useState('');
  const [mostraErroEmail, setMostraErroEmail] = useState(false);
  const [mostraErroSenha, setMostraErroSenha] = useState(false);
  const [mostraErroNome, setMostraErroNome] = useState(false);
  const [mostraErroApelido, setMostraErroApelido] = useState(false);
  const [mostraErroCampus, setMostraErroCampus] = useState(false);
  const [mostraErroNascimento, setMostraErroNascimento] = useState(false);
  const [mostraErroConfirmar, setMostraErroConfirmar] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);

  // Derivados visuais (Calculados em tempo real)
  const emailTrimNow = email.trim();
  const antesArrobaNow = emailTrimNow.split('@')[0] || '';
  const dominioOKNow = emailTrimNow.toLowerCase().endsWith('@ifnmg.edu.br') || emailTrimNow.toLowerCase().endsWith('@aluno.ifnmg.edu.br');
  const emailOkNow = dominioOKNow && antesArrobaNow.length >= 3;
  const senhaTrimNow = senha.trim();
  const senhaLenOKNow = senhaTrimNow.length >= 8;
  const senhaForteNow = senhaLenOKNow && /[A-Z]/.test(senhaTrimNow) && /\d/.test(senhaTrimNow);
  const lenOK = senhaTrimNow.length >= 8;
  const upperOK = /[A-Z]/.test(senhaTrimNow);
  const digitOK = /\d/.test(senhaTrimNow);
  const confirmarOkNow = confirmarSenha.trim().length > 0 && confirmarSenha.trim() === senhaTrimNow;
  const nomeOkNow = (nome.trim().split(/\s+/).filter(Boolean)).length >= 2;
  const apelidoOkNow = apelido.trim().length >= 2 && apelido.trim().length <= 100;
  const campusOkNow = campus.trim().length >= 2 && campus.trim().length <= 100;
  const nascimentoOkNow = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(nascimento.trim());
  const podeMostrarSucesso = !erroEmail && !erroSenha && !erroNome && !erroApelido && !erroCampus && !erroNascimento && !erroConfirmar;

  async function abrirRecuperacao(emailPreenchido?: string) {
    const emailRec = await Notificacao.modal.promptEmail({
      valorInicial: emailPreenchido || ''
    });

    if (emailRec) {
      const emailTyped = String(emailRec).trim();
      try {
        await solicitarRecuperacao(emailTyped);
        Notificacao.toast.sucesso(`Solicitação recebida. Se o e-mail ${emailTyped} estiver cadastrado, enviaremos um link em instantes.`);
      } catch (err: any) {
        const status = err?.status;
        if (status === 429) Notificacao.toast.aviso('Muitas tentativas. Aguarde alguns minutos.');
        else if (status === 410) Notificacao.toast.aviso('Link expirado. Enviamos um novo para seu e-mail.');
        else Notificacao.toast.aviso('Não foi possível solicitar a recuperação agora.');
      }
    }
  }

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if ((params.get('acao') || '').toLowerCase() === 'recuperar') {
        abrirRecuperacao();
      }
      const savedEmail = localStorage.getItem('portal_ifnmg_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setLembrarMe(true);
      }
    } catch {}
  }, []);

  async function alertaSucessoCadastro() {
    const res = await Notificacao.modal.sucesso({
      titulo: 'Cadastro Realizado!',
      texto: 'Enviamos um link de ativação para seu e-mail institucional. Verifique seu Gmail para acessar.',
      textoConfirmar: 'Abrir Gmail',
      textoCancelar: 'Fechar',
      mostrarBotaoCancelar: true
    });
    if (res.isConfirmed) {
      window.open('https://mail.google.com/', '_blank');
    }
    resetFormulario();
  }

  async function alertaCadastroPendente() {
    const res = await Notificacao.modal.aviso({
      titulo: 'Cadastro Pendente',
      texto: 'Você possui um cadastro pendente. Verifique seu Gmail para confirmar.',
      textoConfirmar: 'Abrir Gmail',
      textoCancelar: 'Fechar',
      mostrarBotaoCancelar: true
    });
    if (res.isConfirmed) {
      window.open('https://mail.google.com/', '_blank');
    }
  }

  async function alertaLinkReenviado() {
    const res = await Notificacao.modal.sucesso({
      titulo: 'Link Reenviado',
      texto: 'Vimos que seu link expirou. Um novo link foi enviado para sua caixa de entrada no Gmail.',
      textoConfirmar: 'Abrir Gmail',
      textoCancelar: 'Fechar',
      mostrarBotaoCancelar: true
    });
    if (res.isConfirmed) {
      window.open('https://mail.google.com/', '_blank');
    }
  }

  async function alertaContaPendenteLogin() {
    const res = await Notificacao.modal.aviso({
      titulo: 'Conta Não Ativada',
      texto: 'Sua conta ainda não foi ativada. Verifique seu e-mail.',
      textoConfirmar: 'Abrir Gmail',
      textoCancelar: 'Fechar',
      mostrarBotaoCancelar: true
    });
    if (res.isConfirmed) {
      window.open('https://mail.google.com/', '_blank');
    }
  }

  async function alertaEmailExistente() {
    const res = await Notificacao.modal.confirmar({
      titulo: 'Parece que você já é um de nós!',
      texto: 'Este e-mail institucional já possui uma conta ativa. Deseja entrar agora ou recuperar seu acesso?',
      textoConfirmar: 'Fazer Login',
      textoCancelar: 'Recuperar Senha',
      mostrarBotaoCancelar: true
    });

    if (res === true) {
      const emailAtual = emailTrimNow;
      resetFormulario(true);
      setEhLogin(true);
    } else if (res === false) {
      const emailAtual = emailTrimNow;
      resetFormulario(true);
      setEhLogin(true);
      await abrirRecuperacao(emailAtual);
    }
  }

  const resetFormulario = (keepEmail?: boolean) => {
    setNome(''); setApelido(''); setCampus(''); setNascimento('');
    setSenha(''); setConfirmarSenha('');
    if (!keepEmail) setEmail('');
    setMostraErroEmail(false); setMostraErroSenha(false); setMostraErroNome(false);
    setMostraErroApelido(false); setMostraErroCampus(false); setMostraErroNascimento(false);
    setMostraErroConfirmar(false);
    setErroEmail(''); setErroSenha(''); setErroNome(''); setErroApelido('');
    setErroCampus(''); setErroNascimento(''); setErroConfirmar('');
  };

  async function enviarFormulario(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErroEmail(''); setErroSenha(''); setErroNome(''); setErroApelido(''); setErroCampus(''); setErroNascimento(''); setErroConfirmar('');

    // Validação Hierárquica (Funil)
    if (!emailOkNow) {
      setErroEmail(emailTrimNow.length === 0 ? 'Informe seu e-mail.' : 'Utilize um e-mail institucional válido.');
      setMostraErroEmail(true); setErroVisual(true);
      setTimeout(() => setErroVisual(false), 500);
      return;
    }

    if (ehLogin) {
      if (!senhaLenOKNow) {
        setErroSenha('A senha deve ter pelo menos 8 caracteres.');
        setMostraErroSenha(true); setErroVisual(true);
        setTimeout(() => setErroVisual(false), 500);
        return;
      }
      setEstaCarregando(true);
      try {
        const { token } = await fazerLogin({ email, senha });
        setSession(token);
        if (lembrarMe) {
          localStorage.setItem('portal_ifnmg_email', emailTrimNow);
        } else {
          localStorage.removeItem('portal_ifnmg_email');
        }
        navigate('/dashboard', { replace: true });
      } catch (err: unknown) {
        if (err instanceof AppError) {
          switch (err.errorCode) {
            case ErrorCodes.UNAUTHENTICATED:
            case ErrorCodes.INVALID_CREDENTIALS:
              Notificacao.toast.show('warning', 'E-mail ou senha incorretos.');
              break;
            case ErrorCodes.FORBIDDEN:
              await alertaContaPendenteLogin();
              break;
            case ErrorCodes.RATE_LIMIT_EXCEEDED:
              Notificacao.toast.aviso('Muitas tentativas. Aguarde alguns minutos.');
              break;
            default:
              await Notificacao.modal.erro({ titulo: 'Erro no Acesso', texto: err.message });
          }
        } else {
          Notificacao.toast.show('error', 'Ocorreu um erro inesperado ao entrar.');
        }
        setErroVisual(true);
        setTimeout(() => setErroVisual(false), 500);
      } finally {
        setEstaCarregando(false);
      }
    } else {
      // Cadastro - Validação Unificada
      if (!nomeOkNow || !apelidoOkNow || !campusOkNow || !nascimentoOkNow || !senhaForteNow || !confirmarOkNow || !aceitouTermos) {
        setErroVisual(true);
        setTimeout(() => setErroVisual(false), 500);

        if (!nomeOkNow) Notificacao.toast.aviso('Informe nome completo (nome e sobrenome).');
        else if (!apelidoOkNow) Notificacao.toast.aviso('Informe um apelido entre 2 e 100 caracteres.');
        else if (!campusOkNow) Notificacao.toast.aviso('Informe o nome do campus (mín. 2 caracteres).');
        else if (!nascimentoOkNow) Notificacao.toast.aviso('Informe a data de nascimento válida (DD/MM/YYYY).');
        else if (!senhaForteNow) Notificacao.toast.aviso('A senha deve ter 8+ caracteres, 1 maiúscula e 1 número.');
        else if (!confirmarOkNow) Notificacao.toast.aviso('As senhas não coincidem.');
        else if (!aceitouTermos) Notificacao.toast.aviso('Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
        
        return;
      }

      setEstaCarregando(true);
      try {
        const nascimentoISO = (() => {
          const [dd, mm, yyyy] = nascimento.trim().split('/');
          return `${yyyy}-${mm}-${dd}`;
        })();
        await registrarUsuario({
          nome_completo: nome,
          nome_user: apelido,
          nome_campus: campus,
          data_nascimento: nascimentoISO,
          email,
          senha
        });

        // Fluxo de Sucesso do Cadastro (Genuíno 201/200)
        await alertaSucessoCadastro();
      } catch (err: unknown) {
        if (err instanceof AppError) {
          switch (err.errorCode) {
            case ErrorCodes.EMAIL_ALREADY_EXISTS:
            case ErrorCodes.CONFLICT:
              await alertaEmailExistente();
              break;
            case ErrorCodes.BAD_REQUEST:
              if (err.message.toLowerCase().includes('pendente')) {
                await alertaCadastroPendente();
              } else {
                await Notificacao.modal.erro({ titulo: 'Dados Inválidos', texto: err.message });
              }
              break;
            case ErrorCodes.TOKEN_EXPIRED:
              await alertaLinkReenviado();
              break;
            case ErrorCodes.VALIDATION_ERROR:
              Notificacao.toast.aviso('Verifique os campos destacados e tente novamente.');
              break;
            case ErrorCodes.RATE_LIMIT_EXCEEDED:
              Notificacao.toast.aviso('Muitas tentativas. Aguarde alguns minutos.');
              break;
            default:
              await Notificacao.modal.erro({ titulo: 'Erro no Cadastro', texto: err.message });
          }
        } else {
          Notificacao.toast.show('error', 'Ocorreu um erro inesperado ao realizar o cadastro.');
        }
        setErroVisual(true);
        setTimeout(() => setErroVisual(false), 500);
      } finally {
        setEstaCarregando(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <CenarioLogin />
      <header className="relative z-30 flex items-center justify-between px-6 md:px-20 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-3">
          <div className="text-[var(--accent-primary)]"><BookOpen size={28} /></div>
          <h2 className="text-xl font-bold tracking-tight">Portal IFNMG</h2>
        </div>
        <div className="flex items-center gap-6 justify-end">
          {!ehLogin && (
            <button
              type="button"
              onClick={() => { resetFormulario(false); setEhLogin(true); }}
              className="bg-[var(--accent-primary)] text-white font-bold py-2 px-6 rounded-lg hover:brightness-110 transition-all"
            >
              Entrar
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-30 flex-1 flex items-center justify-center p-4">
        <section className="card w-full max-w-[520px] p-8 md:p-10 shadow-xl">
          <div className="flex flex-col items-center gap-2 mb-8">
            <img src={logo} alt="IFNMG" className="h-16 w-auto" style={{ filter: modoEscuro ? 'brightness(0) invert(1)' : 'none' }} />
            <h1 className="text-3xl font-bold">{ehLogin ? 'Bem-vindo' : 'Criar Conta'}</h1>
            <p className="text-[var(--text-secondary)]">{ehLogin ? 'Acesse sua conta para continuar' : 'Preencha os dados abaixo'}</p>
          </div>

          <form noValidate className="space-y-6 w-full" onSubmit={enviarFormulario}>
            {!ehLogin && (
              <>
                <div className="flex flex-col gap-1 min-h-[95px]">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <User size={16} className="text-[var(--accent-primary)]" />
                    Nome Completo
                  </label>
                  <div className="relative">
                    <input type="text" placeholder="Nome Sobrenome" value={nome} onChange={(e) => setNome(e.target.value)} className={`w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all ${erroNome ? 'input-erro' : ''}`} />
                    {nome.length > 0 && nomeOkNow && podeMostrarSucesso && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                    {mostraErroNome && !nomeOkNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
                  </div>
                  {erroNome && <span className="text-[var(--color-if-red)] text-xs font-bold flex items-center gap-1"><AlertCircle size={14} />{erroNome}</span>}
                </div>

                <div className="flex flex-col gap-1 min-h-[95px]">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <AtSign size={16} className="text-[var(--accent-primary)]" />
                    Nome de Usuário
                  </label>
                  <div className="relative">
                    <input type="text" placeholder="ex: Joao_2" value={apelido} onChange={(e) => setApelido(e.target.value)} className={`w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all ${erroApelido ? 'input-erro' : ''}`} />
                    {apelido.length > 0 && apelidoOkNow && podeMostrarSucesso && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                    {mostraErroApelido && !apelidoOkNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
                  </div>
                  {erroApelido && <span className="text-[var(--color-if-red)] text-xs font-bold flex items-center gap-1"><AlertCircle size={14} />{erroApelido}</span>}
                </div>

                <div className="flex flex-col gap-1 min-h-[95px]">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Home size={16} className="text-[var(--accent-primary)]" />
                    Campus
                  </label>
                  <div className="relative">
                    <input type="text" placeholder="ex: IFNMG - Campus Araçuaí" value={campus} onChange={(e) => setCampus(e.target.value)} className={`w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all ${erroCampus ? 'input-erro' : ''}`} />
                    {campus.length > 0 && campusOkNow && podeMostrarSucesso && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                    {mostraErroCampus && !campusOkNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
                  </div>
                  {erroCampus && <span className="text-[var(--color-if-red)] text-xs font-bold flex items-center gap-1"><AlertCircle size={14} />{erroCampus}</span>}
                </div>

                <div className="flex flex-col gap-1 min-h-[95px]">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar size={16} className="text-[var(--accent-primary)]" />
                    Data de Nascimento
                  </label>
                  <div className="relative">
                    <InputMask
                      mask="99/99/9999"
                      value={nascimento}
                      onChange={(e) => setNascimento(e.target.value)}
                      maskPlaceholder=""
                    >
                      {(inputProps: any) => (
                        <input
                          {...inputProps}
                          type="text"
                          inputMode="numeric"
                          placeholder="DD/MM/YYYY"
                          className={`w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all cursor-pointer ${erroNascimento ? 'input-erro' : ''}`}
                        />
                      )}
                    </InputMask>
                    {nascimento.length > 0 && nascimentoOkNow && podeMostrarSucesso && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                    {mostraErroNascimento && !nascimentoOkNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
                  </div>
                  {erroNascimento && <span className="text-[var(--color-if-red)] text-xs font-bold flex items-center gap-1"><AlertCircle size={14} />{erroNascimento}</span>}
                </div>
              </>
            )}

            <div className="flex flex-col gap-1 min-h-[95px]">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Mail size={16} className="text-[var(--accent-primary)]" />
                E-mail Institucional
              </label>
              <div className="relative">
                <input type="email" placeholder="exemplo@aluno.ifnmg.edu.br" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all ${erroEmail ? 'input-erro' : ''}`} />
                {emailTrimNow.length > 0 && emailOkNow && podeMostrarSucesso && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                {mostraErroEmail && !emailOkNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
              </div>
              {erroEmail && <span className="text-[var(--color-if-red)] text-xs font-bold flex items-center gap-1"><AlertCircle size={14} />{erroEmail}</span>}
            </div>

            <div className="flex flex-col gap-1 min-h-[95px]">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Lock size={16} className="text-[var(--accent-primary)]" />
                  Senha
                </label>
                {ehLogin && (
                  <button
                    type="button"
                    onClick={() => abrirRecuperacao(emailTrimNow)}
                    className="text-xs font-semibold text-[var(--accent-primary)] hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <input type="password" placeholder="Mínimo 8 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} className={`w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all ${erroSenha ? 'input-erro' : ''}`} />
                {senhaLenOKNow && podeMostrarSucesso && (ehLogin || senhaForteNow) && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                {mostraErroSenha && !senhaLenOKNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
              </div>
              {erroSenha && <span className="text-[var(--color-if-red)] text-xs font-bold flex items-center gap-1"><AlertCircle size={14} />{erroSenha}</span>}
              
              {!ehLogin && (
                <div className="mt-2 w-full h-[6px] rounded bg-[var(--input-bg)] overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500" 
                    style={{ 
                      width: senhaTrimNow.length === 0 ? '0%' : senhaForteNow ? '100%' : senhaLenOKNow ? '66%' : '33%',
                      backgroundColor: senhaForteNow ? 'var(--color-if-green)' : senhaLenOKNow ? 'var(--accent-primary)' : 'var(--color-if-red)'
                    }} 
                  />
                </div>
              )}
              
              {ehLogin && (
                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <input type="checkbox" checked={lembrarMe} onChange={(e) => setLembrarMe(e.target.checked)} />
                    Lembrar de mim
                  </label>
                </div>
              )}
              
              {!ehLogin && !senhaForteNow && (
                <div className="mt-3 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)] p-3 text-xs text-[var(--text-secondary)] transition-all">
                  <div className="flex items-center gap-2">
                    {lenOK ? <CheckCircle size={14} className="text-[var(--color-if-green)]" /> : <XCircle size={14} className="text-[var(--color-if-red)]" />}
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {upperOK ? <CheckCircle size={14} className="text-[var(--color-if-green)]" /> : <XCircle size={14} className="text-[var(--color-if-red)]" />}
                    <span>Pelo menos 1 letra maiúscula</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {digitOK ? <CheckCircle size={14} className="text-[var(--color-if-green)]" /> : <XCircle size={14} className="text-[var(--color-if-red)]" />}
                    <span>Pelo menos 1 número</span>
                  </div>
                </div>
              )}
            </div>

            {!ehLogin && senhaForteNow && (
              <div className="flex flex-col gap-1 min-h-[95px] animate-fade-in">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Lock size={16} className="text-[var(--accent-primary)]" />
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input type="password" placeholder="Repita a senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className={`rounded-md px-3 h-11 w-full ${erroConfirmar ? 'input-erro' : ''}`} />
                  {confirmarSenha.length > 0 && confirmarOkNow && podeMostrarSucesso && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                  {mostraErroConfirmar && !confirmarOkNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
                </div>
                {erroConfirmar && <span className="text-[var(--color-if-red)] text-xs font-bold flex items-center gap-1"><AlertCircle size={14} />{erroConfirmar}</span>}
              </div>
            )}
            
            {!ehLogin && (
              <div className="mt-4 text-xs text-[var(--text-secondary)]">
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={aceitouTermos} onChange={(e) => setAceitouTermos(e.target.checked)} />
                  <span>
                    Eu concordo com os <a href="#" className="text-[var(--accent-primary)] hover:underline">Termos de Uso</a> e a <a href="#" className="text-[var(--accent-primary)] hover:underline">Política de Privacidade</a> da comunidade IFNMG
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={estaCarregando}
              className="w-full bg-[var(--accent-primary)] text-white font-bold py-4 rounded-lg hover:brightness-110 transition-all active:scale-[0.98]"
            >
              {estaCarregando ? (ehLogin ? 'Entrando...' : 'Enviando...') : (ehLogin ? 'Entrar' : 'Criar Conta')}
            </button>

            <div className="mt-8 text-center">
              <p className="text-[var(--text-secondary)] text-sm">
                {ehLogin ? 'Não possui conta?' : 'Já possui conta?'}{' '}
                <button type="button" className="text-[var(--accent-primary)] font-bold hover:underline" onClick={() => { resetFormulario(false); setEhLogin(!ehLogin); }}>
                  {ehLogin ? 'Cadastre-se' : 'Entre'}
                </button>
              </p>
            </div>
          </form>
        </section>
      </main>
      <footer className="relative z-30 px-6 md:px-20 py-3 border-t border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>© 2026 Portal IFNMG. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">Termos de Uso</a>
            <a href="#" className="hover:underline">Privacidade</a>
            <a href="#" className="hover:underline">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
