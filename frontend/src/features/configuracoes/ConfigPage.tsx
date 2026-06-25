
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header';
import { useAuth } from '../../shared/utils/authContext';
import { LogOut, User, Shield, Lock } from 'lucide-react';

export function ConfigPage() {
  const navigate = useNavigate();
  const { logout, perfil } = useAuth();

  const navLinks = [
  { label: 'Início', path: '/feed' },
  { label: 'Explorar', path: '/explorar' },
  { label: 'Notificações', path: '/notificacoes' },
  { label: 'Comunidade', path: '/comunidade' },
  { label: 'Salvos', path: '/salvos' },
  { label: 'Minhas Obras', path: '/minhas-obras' },
  { label: 'Configurações', path: '/configuracoes/perfil' }
];

  const Links = [
    { to: '/configuracoes/perfil', icon: <User size={20} strokeWidth={1.5} />, label: 'Perfil Público' },
    { to: '/configuracoes/seguranca', icon: <Shield size={20} strokeWidth={1.5} />, label: 'Segurança' },
    { to: '/configuracoes/privacidade', icon: <Lock size={20} strokeWidth={1.5} />, label: 'Privacidade' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
      <Header
        title="Configurações"
        onBack={() => navigate(-1)}
        showSearch={false}
        navLinks={navLinks}
      />
      <main className="flex flex-1 justify-center py-8 px-4 md:px-10">
        <div className="flex flex-col md:flex-row max-w-6xl flex-1 gap-8">
          <aside className="w-full md:w-64 flex flex-col gap-2 shrink-0">
            <div className="mb-4">
              <h1 className="text-[var(--text-primary)] text-lg font-bold font-lexend">
                Configurações
              </h1>
              <p className="text-[var(--accent-primary)] text-sm font-medium">Conta e Segurança</p>
            </div>
            <nav className="flex flex-col gap-1">
              {Links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/5'
                    }`
                  }
                >
                  {link.icon}
                  <span className="text-sm font-lexend">{link.label}</span>
                </NavLink>
              ))}
              <hr className="my-2 border-[var(--border-color)]" />
              <button
                onClick={() => logout()}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-if-red)] hover:bg-[var(--color-if-red)]/10 transition-all duration-300 active:scale-95"
              >
                <LogOut size={20} strokeWidth={1.5} />
                <span className="text-sm font-medium font-lexend">Sair da Conta</span>
              </button>
            </nav>
          </aside>
          <div className="flex-1 flex flex-col gap-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
