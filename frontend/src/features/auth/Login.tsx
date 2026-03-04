//frontend/src/features/auth/Login.tsx 
import React, { useEffect, useState } from 'react';
import logo from '../../shared/assets/ifnmg-logo-vertical.svg';
import ThemeToggle from '../../shared/components/ThemeToggle';
import { fazerLogin, registrarUsuario, solicitarRecuperacao } from '../../shared/services/auth.service';
import { CenarioLogin } from '../../shared/utils/Cenario';
import { useTema } from '../../shared/utils/themeHandler';
import { useAuth } from '../../shared/utils/authContext';
import { ErrorCodes } from '../../shared/types/errors';
import { CheckCircle, XCircle } from 'lucide-react';
import { showToast } from '../../shared/utils/toast';
import { useNavigate } from 'react-router-dom';

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

  // Derivados visuais (Calculados em tempo real)
  const emailTrimNow = email.trim();
  const antesArrobaNow = emailTrimNow.split('@')[0] || '';
  const dominioOKNow = emailTrimNow.toLowerCase().endsWith('@ifnmg.edu.br') || emailTrimNow.toLowerCase().endsWith('@aluno.ifnmg.edu.br');
  const emailOkNow = dominioOKNow && antesArrobaNow.length >= 3;
  const senhaTrimNow = senha.trim();
  const senhaLenOKNow = senhaTrimNow.length >= 8;
  const senhaForteNow = senhaLenOKNow && /[A-Z]/.test(senhaTrimNow) && /\d/.test(senhaTrimNow);
  const confirmarOkNow = confirmarSenha.trim().length > 0 && confirmarSenha.trim() === senhaTrimNow;
  const nomeOkNow = (nome.trim().split(/\s+/).filter(Boolean)).length >= 2;
  const apelidoOkNow = apelido.trim().length >= 2 && apelido.trim().length <= 100;
  const campusOkNow = campus.trim().length >= 2 && campus.trim().length <= 100;
  const nascimentoOkNow = /^\d{4}-\d{2}-\d{2}$/.test(nascimento.trim());
  const podeMostrarSucesso = !erroEmail && !erroSenha && !erroNome && !erroApelido && !erroCampus && !erroNascimento && !erroConfirmar;

  async function getSwal() {
    try {
      const mod = await import('sweetalert2');
      return mod.default;
    } catch { return null; }
  }

  async function abrirRecuperacao(emailPreenchido?: string) {
    const Swal = await getSwal();
    if (!Swal) {
      const emailPrompt = window.prompt('Informe seu e-mail para recuperação:', emailPreenchido || '');
      if (emailPrompt && emailPrompt.trim().length > 3) {
        const emailLocal = emailPrompt.trim();
        try {
          await solicitarRecuperacao(emailLocal);
          showToast('success', `Solicitação recebida. Se o e-mail ${emailLocal} estiver cadastrado, enviaremos um link em instantes.`);
        } catch (err: any) {
          const status = err?.status;
          if (status === 429) showToast('warning', 'Muitas tentativas. Aguarde alguns minutos.');
          else if (status === 410) showToast('warning', 'Link expirado. Enviamos um novo para seu e-mail.');
          else showToast('warning', 'Não foi possível solicitar a recuperação agora.');
        }
      }
      return;
    }
    const { value: emailRec } = await Swal.fire({
      title: 'Recuperar Acesso',
      input: 'email',
      inputLabel: 'Informe seu e-mail institucional',
      inputPlaceholder: 'exemplo@aluno.ifnmg.edu.br',
      inputValue: emailPreenchido || '',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      confirmButtonColor: 'var(--color-if-green)',
      backdrop: 'rgba(0, 0, 0, 0.4) saturate(150%) backdrop-filter blur(8px)',
      inputValidator: (val) => {
        const v = (val || '').trim();
        if (v.length < 5 || !v.includes('@')) return 'Informe um e-mail válido.';
        return undefined as any;
      }
    });
    if (emailRec) {
      const emailTyped = String(emailRec).trim();
      try {
        const r = await solicitarRecuperacao(emailTyped);
        await Swal.fire({
          title: 'Solicitação Recebida!',
          text: `Se o e-mail ${emailTyped} estiver cadastrado, um link de recuperação será enviado.`,
          icon: 'success',
          showDenyButton: true,
          denyButtonText: 'Fechar',
          confirmButtonText: 'Abrir Gmail',
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          confirmButtonColor: 'var(--color-if-green)',
          denyButtonColor: 'var(--color-if-red)',
          backdrop: 'rgba(0, 0, 0, 0.4) saturate(150%) backdrop-filter blur(8px)'
        }).then((res) => {
          if (res.isConfirmed) window.open('https://mail.google.com', '_blank');
        });
      } catch (err: any) {
        const status = err?.status;
        let msg = err?.message || 'Falha ao solicitar recuperação.';
        if (status === 429) msg = 'Muitas tentativas. Aguarde alguns minutos.';
        else if (status === 410) msg = 'Link expirado. Enviamos um novo link para seu e-mail agora mesmo!';
        await Swal.fire({
          title: status === 429 ? 'Limite de Tentativas' : 'Não foi possível enviar',
          text: msg,
          icon: 'warning',
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          confirmButtonColor: 'var(--accent-primary)',
          backdrop: 'rgba(0, 0, 0, 0.4) saturate(150%) backdrop-filter blur(8px)'
        });
      }
    }
  }

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if ((params.get('acao') || '').toLowerCase() === 'recuperar') {
        abrirRecuperacao();
      }
    } catch {}
  }, []);

  async function alertaSucessoCadastro() {
    const Swal = await getSwal();
    if (!Swal) {
      showToast('success', 'Cadastro realizado! Verifique seu e-mail institucional.');
      resetFormulario();
      return;
    }
    await Swal.fire({
      title: 'Cadastro Realizado!',
      text: 'Enviamos um link de ativação para seu e-mail institucional. Verifique seu Gmail para acessar.',
      icon: 'success',
      showDenyButton: true,
      denyButtonText: 'Fechar',
      confirmButtonText: 'Abrir Gmail',
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      confirmButtonColor: 'var(--color-if-green)',
      denyButtonColor: 'var(--text-secondary)',
      backdrop: 'rgba(0, 0, 0, 0.4) saturate(150%) backdrop-filter blur(8px)'
    }).then((res) => {
      if (res.isConfirmed) window.open('https://mail.google.com', '_blank');
      resetFormulario();
    });
  }

  async function alertaCadastroPendente() {
    const Swal = await getSwal();
    if (!Swal) {
      showToast('warning', 'Você já possui um cadastro pendente. Verifique seu e-mail.');
      return;
    }
    await Swal.fire({
      title: 'Cadastro Pendente',
      text: 'Você já possui um cadastro pendente. Verifique seu Gmail para confirmar.',
      iconHtml: '<svg width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"var(--accent-primary)\" stroke=\"var(--color-if-black)\" stroke-width=\"1.5\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 7v6\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"16.5\" r=\"1\"/></svg>',
      showDenyButton: true,
      denyButtonText: 'Fechar',
      confirmButtonText: 'Abrir Gmail',
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      confirmButtonColor: 'var(--accent-primary)',
      denyButtonColor: 'var(--text-secondary)',
      backdrop: 'rgba(0, 0, 0, 0.4) saturate(150%) backdrop-filter blur(8px)'
    }).then((res) => {
      if (res.isConfirmed) window.open('https://mail.google.com', '_blank');
    });
  }

  async function alertaLinkReenviado() {
    const Swal = await getSwal();
    if (!Swal) {
      showToast('success', 'Link expirado detectado. Enviamos um novo para sua caixa de entrada.');
      return;
    }
    await Swal.fire({
      title: 'Link Reenviado',
      text: 'Vimos que seu link expirou. Um novo link foi enviado para sua caixa de entrada.',
      iconHtml: '<svg width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"var(--color-if-green)\" stroke=\"var(--color-if-black)\" stroke-width=\"1.2\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12\"/><path d=\"M2 12l4-2m-4 2l4 2\"/><path d=\"M9 12l2 2 4-4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',
      showDenyButton: true,
      denyButtonText: 'Fechar',
      confirmButtonText: 'Abrir Gmail',
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      confirmButtonColor: 'var(--color-if-green)',
      denyButtonColor: 'var(--text-secondary)',
      backdrop: 'rgba(0, 0, 0, 0.4) saturate(150%) backdrop-filter blur(8px)'
    }).then((res) => {
      if (res.isConfirmed) window.open('https://mail.google.com', '_blank');
    });
  }

  async function alertaContaPendenteLogin() {
    const Swal = await getSwal();
    if (!Swal) {
      showToast('warning', 'Sua conta ainda não foi ativada. Verifique seu e-mail.');
      return;
    }
    await Swal.fire({
      title: 'Conta Não Ativada',
      text: 'Sua conta ainda não foi ativada. Verifique seu e-mail.',
      iconHtml: '<svg width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"var(--accent-primary)\" stroke=\"var(--color-if-black)\" stroke-width=\"1.5\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 7v6\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"16.5\" r=\"1\"/></svg>',
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      confirmButtonText: 'Abrir Gmail',
      confirmButtonColor: 'var(--accent-primary)',
      backdrop: 'rgba(0, 0, 0, 0.4) saturate(150%) backdrop-filter blur(8px)'
    }).then((res) => {
      if (res.isConfirmed) window.open('https://mail.google.com', '_blank');
    });
  }

  async function alertaEmailExistente() {
    const Swal = await getSwal();
    if (!Swal) {
      showToast('warning', 'Este e-mail já possui conta. Faça login ou recupere o acesso.');
      return;
    }
    const res = await Swal.fire({
      title: 'Parece que você já é um de nós!',
      text: 'Este e-mail institucional já possui uma conta ativa. Deseja entrar agora ou recuperar seu acesso?',
      icon: 'warning',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Fazer Login',
      denyButtonText: 'Recuperar Senha',
      cancelButtonText: 'Fechar',
      background: modoEscuro ? 'var(--bg-card)' : '#fff',
      color: modoEscuro ? 'var(--text-primary)' : '#545454',
      confirmButtonColor: 'var(--color-if-green)',
      denyButtonColor: 'var(--accent-primary)',
      cancelButtonColor: 'var(--color-if-red)',
      backdrop: 'rgba(0, 0, 0, 0.4) saturate(150%) backdrop-filter blur(8px)',
      customClass: {
        actions: 'flex-col sm:flex-row gap-2 w-full px-4',
        confirmButton: 'w-full sm:w-auto order-1',
        denyButton: 'w-full sm:w-auto order-2',
        cancelButton: 'w-full sm:w-auto order-3'
      }
    });
    if (res.isConfirmed) {
      const emailAtual = emailTrimNow;
      resetFormulario(false);
      setEmail(emailAtual);
      setEhLogin(true);
    } else if (res.isDenied) {
      const emailAtual = emailTrimNow;
      resetFormulario(false);
      setEhLogin(true);
      await abrirRecuperacao(emailAtual);
    } else {
      // cancelado: não faz nada, preserva os dados atuais
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
        navigate('/dashboard', { replace: true });
      } finally { setEstaCarregando(false); }
    } else {
      // Cadastro
      if (!nomeOkNow) {
        setErroNome('Informe nome completo (nome e sobrenome).');
        setMostraErroNome(true); setErroVisual(true);
        setTimeout(() => setErroVisual(false), 500);
        return;
      }
      if (!apelidoOkNow) {
        setErroApelido('Informe um apelido entre 2 e 100 caracteres.');
        setMostraErroApelido(true); setErroVisual(true);
        setTimeout(() => setErroVisual(false), 500);
        return;
      }
      if (!campusOkNow) {
        setErroCampus('Informe o nome do campus (mín. 2 caracteres).');
        setMostraErroCampus(true); setErroVisual(true);
        setTimeout(() => setErroVisual(false), 500);
        return;
      }
      if (!nascimentoOkNow) {
        setErroNascimento('Informe a data de nascimento no formato YYYY-MM-DD.');
        setMostraErroNascimento(true); setErroVisual(true);
        setTimeout(() => setErroVisual(false), 500);
        return;
      }
      if (!senhaForteNow) {
        setErroSenha('A senha deve ter 8+ caracteres, 1 maiúscula e 1 número.');
        setMostraErroSenha(true); setErroVisual(true);
        setTimeout(() => setErroVisual(false), 500);
        return;
      }
      if (!confirmarOkNow) {
        setErroConfirmar('As senhas não coincidem.');
        setMostraErroConfirmar(true); setErroVisual(true);
        setTimeout(() => setErroVisual(false), 500);
        return;
      }

      setEstaCarregando(true);
      try {
        const resp = await registrarUsuario({
          nome_completo: nome,
          nome_user: apelido,
          nome_campus: campus,
          data_nascimento: nascimento,
          email,
          senha
        });
        const msg = (resp?.message || '').toLowerCase();
        if (msg.includes('pendente')) {
          await alertaCadastroPendente();
        } else if (msg.includes('expirou')) {
          await alertaLinkReenviado();
        } else if (resp?.message === 'Solicitação recebida.') {
          await alertaEmailExistente();
        } else {
          await alertaSucessoCadastro();
        }
      } catch (err: any) {
        if (err?.status === 400 || err?.status === 409) {
          await alertaEmailExistente();
        }
        setErroVisual(true); setTimeout(() => setErroVisual(false), 500);
      } finally { setEstaCarregando(false); }
    }
  }

  return (
    <div className="relative min-h-screen login-page-container bg-transparent text-[var(--text-primary)]">
      <ThemeToggle />
      <CenarioLogin />
      <main className="relative z-30 flex items-center justify-center min-h-screen p-4">
        <section className="card w-full max-w-md px-8 py-6 backdrop-blur">
          <div className="flex flex-col items-center gap-2 mb-4">
            <img src={logo} alt="IFNMG" className="h-16 w-auto" style={{ filter: modoEscuro ? 'brightness(0) invert(1)' : 'none' }} />
            <h1 className="text-2xl font-semibold">{ehLogin ? 'Acesso' : 'Criar Conta'}</h1>
            <p className="text-[var(--text-secondary)] text-sm">{ehLogin ? 'Entre com seu e-mail e senha.' : 'Preencha os dados abaixo.'}</p>
          </div>

          <form noValidate className="space-y-3 w-full" onSubmit={enviarFormulario}>
            {!ehLogin && (
              <>
                <div className="flex flex-col gap-1 min-h-[95px]">
                  <label className="font-semibold">Nome Completo</label>
                  <div className="relative">
                    <input type="text" placeholder="Nome Sobrenome" value={nome} onChange={(e) => setNome(e.target.value)} className={`rounded-md px-3 h-11 w-full ${erroNome ? 'input-erro' : ''}`} />
                    {nome.length > 0 && nomeOkNow && podeMostrarSucesso && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                    {mostraErroNome && !nomeOkNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
                  </div>
                  {erroNome && <span className="text-[var(--color-if-red)] text-xs font-bold">{erroNome}</span>}
                </div>

                <div className="flex flex-col gap-1 min-h-[95px]">
                  <label className="font-semibold">Nome de Usuário</label>
                  <div className="relative">
                    <input type="text" placeholder="ex: Joao_2" value={apelido} onChange={(e) => setApelido(e.target.value)} className={`rounded-md px-3 h-11 w-full ${erroApelido ? 'input-erro' : ''}`} />
                    {apelido.length > 0 && apelidoOkNow && podeMostrarSucesso && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                    {mostraErroApelido && !apelidoOkNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
                  </div>
                  {erroApelido && <span className="text-[var(--color-if-red)] text-xs font-bold">{erroApelido}</span>}
                </div>

                <div className="flex flex-col gap-1 min-h-[95px]">
                  <label className="font-semibold">Campus</label>
                  <div className="relative">
                    <input type="text" placeholder="ex: IFNMG - Campus Araçaí" value={campus} onChange={(e) => setCampus(e.target.value)} className={`rounded-md px-3 h-11 w-full ${erroCampus ? 'input-erro' : ''}`} />
                    {campus.length > 0 && campusOkNow && podeMostrarSucesso && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                    {mostraErroCampus && !campusOkNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
                  </div>
                  {erroCampus && <span className="text-[var(--color-if-red)] text-xs font-bold">{erroCampus}</span>}
                </div>

                <div className="flex flex-col gap-1 min-h-[95px]">
                  <label className="font-semibold">Data de Nascimento</label>
                  <div className="relative">
                    <input type="date" placeholder="YYYY-MM-DD" value={nascimento} onChange={(e) => setNascimento(e.target.value)} className={`rounded-md px-3 h-11 w-full ${erroNascimento ? 'input-erro' : ''}`} />
                    {nascimento.length > 0 && nascimentoOkNow && podeMostrarSucesso && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                    {mostraErroNascimento && !nascimentoOkNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
                  </div>
                  {erroNascimento && <span className="text-[var(--color-if-red)] text-xs font-bold">{erroNascimento}</span>}
                </div>
              </>
            )}

            <div className="flex flex-col gap-1 min-h-[95px]">
              <label className="font-semibold">E-mail</label>
              <div className="relative">
                <input type="email" placeholder="exemplo@aluno.ifnmg.edu.br" value={email} onChange={(e) => setEmail(e.target.value)} className={`rounded-md px-3 h-11 w-full ${erroEmail ? 'input-erro' : ''}`} />
                {emailTrimNow.length > 0 && emailOkNow && podeMostrarSucesso && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                {mostraErroEmail && !emailOkNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
              </div>
              {erroEmail && <span className="text-[var(--color-if-red)] text-xs font-bold">{erroEmail}</span>}
            </div>

            <div className="flex flex-col gap-1 min-h-[95px]">
              <label className="font-semibold">Senha</label>
              <div className="relative">
                <input type="password" placeholder="Mínimo 8 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} className={`rounded-md px-3 h-11 w-full ${erroSenha ? 'input-erro' : ''}`} />
                {senhaLenOKNow && podeMostrarSucesso && (ehLogin || senhaForteNow) && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                {mostraErroSenha && !senhaLenOKNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
              </div>
              {erroSenha && <span className="text-[var(--color-if-red)] text-xs font-bold">{erroSenha}</span>}
              
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
            </div>

            {!ehLogin && senhaForteNow && (
              <div className="flex flex-col gap-1 min-h-[95px] animate-fade-in">
                <label className="font-semibold">Confirmar Senha</label>
                <div className="relative">
                  <input type="password" placeholder="Repita a senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className={`rounded-md px-3 h-11 w-full ${erroConfirmar ? 'input-erro' : ''}`} />
                  {confirmarSenha.length > 0 && confirmarOkNow && podeMostrarSucesso && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-green)]" size={18} />}
                  {mostraErroConfirmar && !confirmarOkNow && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-if-red)]" size={18} />}
                </div>
                {erroConfirmar && <span className="text-[var(--color-if-red)] text-xs font-bold">{erroConfirmar}</span>}
              </div>
            )}

            <button type="submit" disabled={estaCarregando} className={`w-full rounded-md px-3 py-2 btn-entrar ${estaCarregando ? 'btn-sucesso' : erroVisual ? 'btn-erro' : ''}`}>
              {estaCarregando ? (ehLogin ? 'Entrando...' : 'Enviando...') : (ehLogin ? 'Entrar' : 'Criar Conta')}
            </button>

            <div className="mt-6 flex flex-col items-center gap-3 text-sm">
              <button
                type="button"
                className="text-[var(--text-secondary)] hover:text-[var(--color-if-green)] transition-colors"
                onClick={() => abrirRecuperacao(emailTrimNow)}
              >
                Esqueci minha senha
              </button>
              <div className="flex gap-2 text-[var(--text-secondary)]">
                <span>{ehLogin ? 'Não possui conta?' : 'Já possui conta?'}</span>
                <button type="button" className="font-bold text-[var(--color-if-green)] hover:underline" onClick={() => { resetFormulario(false); setEhLogin(!ehLogin); }}>
                  {ehLogin ? 'Cadastre-se' : 'Entre'}
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
