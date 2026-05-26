//frontend/src/shared/components/Header.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Menu, 
  X, 
  ArrowLeft, 
  BookOpen, 
  Layout, 
  PanelLeft, 
  PanelRight, 
  Sun, 
  Moon,
  LogOut
} from 'lucide-react';
import { useTema } from '../utils/themeHandler';
import { useAuth } from '../utils/authContext';
import { PerfilResumo } from '../types/perfil.types';

export interface HeaderProps {
  perfil?: PerfilResumo | null;
  title?: string;
  showSearch?: boolean;
  hideBack?: boolean;
  onBack?: () => void;
  navLinks?: { label: string; path: string; icon?: React.ReactNode }[];
  actions?: React.ReactNode;
  toggleLeft?: () => void;
  toggleRight?: () => void;
  isLeftVisible?: boolean;
  isRightVisible?: boolean;
}

export default function Header({
  perfil: perfilProp,
  title,
  showSearch = true,
  hideBack = false,
  onBack,
  navLinks,
  actions,
  toggleLeft,
  toggleRight,
  isLeftVisible,
  isRightVisible
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { modoEscuro, alternarTema } = useTema();
  const { autenticado, logout, perfil: perfilAuth } = useAuth();
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthPage = location.pathname.startsWith('/entrada');

  const perfil = perfilAuth || perfilProp;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-[var(--bg-card)]/80 border-b border-[var(--accent-primary)]/10 px-4 md:px-10 flex items-center justify-between shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-8 flex-1">
        {/* Logo e Voltar  */}
        <div className="flex items-center gap-3">
          {/* Ícone Campus  */}
          <Link to="/feed" className="flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 shrink-0">
            <BookOpen 
              size={28} 
              strokeWidth={1.5} 
              className={`transition-colors duration-300 ${isAuthPage ? 'text-white' : 'text-[var(--accent-primary)]'}`}
            />
            <h1 className={`text-sm font-black tracking-tighter hidden sm:block font-lexend uppercase transition-colors duration-300 ${
              isAuthPage ? 'text-white' : 'text-[var(--text-primary)]'
            }`}>
              PAPIRUS
            </h1>
          </Link>

          {/* Botão Voltar, à direita do Campus, dinâmico */}
          {!hideBack && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-[var(--input-bg)] rounded-xl transition-all active:scale-90 text-[var(--text-secondary)] border border-[var(--border-color)]/50"
              title="Voltar"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
          )}

          {/* Menu Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-[var(--input-bg)] rounded-lg md:hidden transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Busca ou Título */}
        {showSearch ? (
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-primary)]"
                size={18}
                strokeWidth={1.5}
              />
              <input
                type="text"
                placeholder="Buscar pergaminhos acadêmicos..."
                className="w-full bg-[var(--input-bg)] rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--accent-primary)] border-none font-lexend"
              />
            </div>
          </div>
        ) : title && (
          <div className="hidden md:flex flex-1 justify-center">
            <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest truncate max-w-xs font-lexend">
              {title}
            </h2>
          </div>
        )}
      </div>

      {/* Menu Direito */}
      <div className="flex items-center gap-4 md:gap-8">
        {/* Nav Links */}
        {navLinks && (
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors font-lexend"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {actions && <div className="flex items-center gap-3">{actions}</div>}

        {/* Layout Toggle */}
        {(toggleLeft || toggleRight) && (
          <div className="relative">
            <button
              onMouseEnter={() => setIsLayoutMenuOpen(true)}
              onMouseLeave={() => setIsLayoutMenuOpen(false)}
              className="p-2 hover:bg-[var(--input-bg)] rounded-lg text-[var(--text-secondary)]"
            >
              <Layout size={20} strokeWidth={1.5} />
            </button>

            {isLayoutMenuOpen && (
              <div
                onMouseEnter={() => setIsLayoutMenuOpen(true)}
                onMouseLeave={() => setIsLayoutMenuOpen(false)}
                className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl p-2 z-50"
              >
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider px-3 py-2 font-lexend">Visualização</p>
                {toggleLeft && (
                  <button
                    onClick={toggleLeft}
                    className="w-full flex items-center justify-between p-2 hover:bg-[var(--input-bg)] rounded-lg text-sm transition-colors font-lexend"
                  >
                    <div className="flex items-center gap-3">
                      <PanelLeft size={16} strokeWidth={1.5} />
                      Sidebar Esquerda
                    </div>
                    {isLeftVisible && <Plus size={14} className="rotate-45" />}
                  </button>
                )}

                {toggleRight && (
                  <button
                    onClick={toggleRight}
                    className="w-full flex items-center justify-between p-2 hover:bg-[var(--input-bg)] rounded-lg text-sm transition-colors font-lexend"
                  >
                    <div className="flex items-center gap-3">
                      <PanelRight size={16} strokeWidth={1.5} />
                      Sidebar Direita
                    </div>
                    {isRightVisible && <Plus size={14} className="rotate-45" />}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Alternar Tema */}
        <button
          onClick={alternarTema}
          className="p-2 hover:bg-[var(--input-bg)] rounded-lg text-[var(--text-secondary)] transition-colors"
          title={modoEscuro ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {modoEscuro ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
        </button>

        {/* Avatar */}
        {autenticado && (
          <div className="flex items-center gap-3">
            <Link 
              to="/perfil/me"
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--accent-primary)] cursor-pointer hover:scale-110 active:scale-95 transition-transform shadow-sm"
            >
              <img
                className="w-full h-full object-cover"
                alt="User"
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${perfil?.nome_user || 'user'}&backgroundColor=b6e3f4`}
              />
            </Link>

            <button
              onClick={() => logout()}
              className="p-2 text-[var(--color-if-red)] hover:bg-[var(--color-if-red)]/10 rounded-lg transition-all active:scale-95"
              title="Sair"
            >
              <LogOut size={20} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// Auxiliar para o ícone de Plus/X
function Plus({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
