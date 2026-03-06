//frontend/src/features/dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Notificacao } from '../../shared/utils/Notificacao';
import { PerfilResumo } from '../../shared/types/perfil.types';
import { PostResumo } from '../../shared/types/post.types';
import { getMeuPerfil } from '../../shared/services/perfil.service';
import { getFeed } from '../../shared/services/post.service';
import { useTema } from '../../shared/utils/themeHandler';
import { Menu, X, Sun, Moon, Layout, Columns, Sidebar as SidebarIcon } from 'lucide-react';

export default function Dashboard() {
  const [perfil, setPerfil] = useState<PerfilResumo | null>(null);
  const [feed, setFeed] = useState<PostResumo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados de Visibilidade do Layout (Holy Grail Dinâmico)
  const [isLeftVisible, setIsLeftVisible] = useState(true);
  const [isRightVisible, setIsRightVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { modoEscuro, alternarTema } = useTema();

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const [p, f] = await Promise.all([getMeuPerfil(), getFeed()]);
        if (!cancelado) {
          setPerfil(p);
          setFeed(f);
          setErro(null);
        }
      } catch (err: any) {
        if (!cancelado) {
          const status = err?.status;
          if (status === 401) {
            // O interceptor global já cuida do redirecionamento, 
            // mas garantimos o estado de erro local.
            setErro('Sessão expirada.');
          } else {
            setErro('Erro ao carregar dados do servidor.');
          }
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Header Mobile / Controles de Layout */}
      <header className="sticky top-0 z-50 w-full h-16 bg-[var(--bg-card)] border-b border-[var(--input-bg)] px-4 flex items-center justify-between shadow-sm backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMobileMenu}
            className="p-2 hover:bg-[var(--input-bg)] rounded-lg md:hidden transition-colors"
            title="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center text-white font-bold">I</div>
            <span className="font-bold text-lg hidden sm:block">Portal IFNMG</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Controles de Coluna (Desktop Only) */}
          <div className="hidden md:flex items-center gap-1 bg-[var(--input-bg)] p-1 rounded-xl mr-4">
            <button 
              onClick={() => setIsLeftVisible(!isLeftVisible)}
              className={`p-2 rounded-lg transition-all ${isLeftVisible ? 'bg-[var(--bg-card)] shadow-sm text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              title="Alternar Sidebar"
            >
              <SidebarIcon size={18} />
            </button>
            <button 
              onClick={() => setIsRightVisible(!isRightVisible)}
              className={`p-2 rounded-lg transition-all ${isRightVisible ? 'bg-[var(--bg-card)] shadow-sm text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              title="Alternar Painel de Progresso"
            >
              <Layout size={18} className="rotate-180" />
            </button>
          </div>

          <button 
            onClick={alternarTema}
            className="p-2 hover:bg-[var(--input-bg)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="Alternar Tema"
          >
            {modoEscuro ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Grid Principal (Holy Grail) */}
      <div className={`
        max-w-[1600px] mx-auto p-4 md:p-6 grid gap-6 transition-all duration-500
        grid-cols-1 
        ${isLeftVisible && isRightVisible ? 'md:grid-cols-[260px,1fr,320px]' : 
          isLeftVisible ? 'md:grid-cols-[260px,1fr]' : 
          isRightVisible ? 'md:grid-cols-[1fr,320px]' : 'md:grid-cols-1'}
      `}>
        
        {/* Sidebar Esquerda (Drawer no Mobile, Sticky no Desktop) */}
        <aside className={`
          fixed inset-0 z-40 md:relative md:inset-auto md:z-0 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${!isLeftVisible ? 'md:hidden' : 'md:block'}
        `}>
          {/* Overlay Mobile */}
          <div 
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div className="relative w-[280px] md:w-full h-full md:h-auto bg-[var(--bg-card)] md:bg-transparent md:sticky md:top-24 flex flex-col gap-4 p-6 md:p-0">
            <div className="flex items-center justify-between md:hidden mb-4">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
            </div>
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--input-bg)] px-4 py-6 overflow-hidden">
              {loading ? <LoadingSkeleton count={3} /> : <Sidebar perfil={perfil} />}
            </div>
          </div>
        </aside>

        {/* Conteúdo Central (Feed) */}
        <main className="min-w-0 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <LoadingSkeleton count={5} height="200px" />
            </div>
          ) : erro ? (
            <div className="card p-8 text-center flex flex-col items-center gap-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--input-bg)]">
              <div className="w-16 h-16 bg-[var(--color-if-red)]/10 text-[var(--color-if-red)] rounded-full flex items-center justify-center">
                <X size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Ops! Algo deu errado</h3>
                <p className="text-[var(--text-secondary)]">{erro}</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <Feed posts={feed} />
          )}
        </main>

        {/* Painel Direito (Sticky no Desktop, Oculto no Mobile por padrão mas visível se forçado) */}
        <aside className={`
          ${isRightVisible ? 'block' : 'hidden'}
          md:sticky md:top-24 h-fit space-y-4
        `}>
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--input-bg)] px-5 py-6">
            <div className="flex items-center gap-2 mb-4 text-[var(--accent-primary)]">
              <Columns size={20} />
              <span className="font-bold">Estatísticas</span>
            </div>
            {loading ? <LoadingSkeleton count={2} /> : <GamificationPanel perfil={perfil} />}
          </div>
          
          <div className="bg-gradient-to-br from-accent-primary to-[#125e2a] p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-1">Dica do Dia</h4>
              <p className="text-sm opacity-90 leading-relaxed">Participe dos fóruns do seu campus para ganhar pontos de Karma extras!</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Layout size={100} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LoadingSkeleton({ count = 1, height = "20px" }: { count?: number, height?: string }) {
  return (
    <div className="space-y-3 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[var(--input-bg)] rounded-lg w-full" style={{ height }} />
      ))}
    </div>
  );
}

function Sidebar({ perfil }: { perfil: PerfilResumo | null }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 p-2 bg-[var(--input-bg)] rounded-xl">
        <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center text-white font-bold text-lg">
          {perfil?.nome_user?.charAt(0).toUpperCase() ?? '?'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold truncate text-[var(--text-primary)]">@{perfil?.nome_user ?? '...'}</span>
          <span className="text-xs text-[var(--text-secondary)]">{perfil?.is_admin ? 'Administrador' : 'Estudante'}</span>
        </div>
      </div>
      
      <nav className="flex flex-col gap-1">
        <SidebarLink href="#" icon={<Layout size={20} />} label="Início" active />
        <SidebarLink href="#" icon={<SidebarIcon size={20} />} label="Explorar" />
        <SidebarLink href="#" icon={<Columns size={20} />} label="Biblioteca" />
        <SidebarLink href="#" icon={<Layout size={20} />} label="Perfil" />
      </nav>

      <button className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white bg-[var(--accent-primary)] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
        <span>Novo Post</span>
      </button>
    </div>
  );
}

function SidebarLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a 
      href={href} 
      className={`
        flex items-center gap-3 rounded-xl px-4 py-3 transition-all
        ${active ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold' : 'text-[var(--text-secondary)] hover:bg-[var(--input-bg)] hover:text-[var(--text-primary)]'}
      `}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

function Feed({ posts }: { posts: PostResumo[] }) {
  if (posts.length === 0) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl p-12 text-center border border-dashed border-[var(--input-bg)]">
        <p className="text-[var(--text-secondary)]">Nenhum post encontrado no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {posts.map((p) => (
        <article key={p.post_id} className="group rounded-2xl p-6 shadow-sm bg-[var(--bg-card)] border border-[var(--input-bg)] hover:border-[var(--color-if-green)]/30 transition-all duration-300">
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--input-bg)] rounded-full flex items-center justify-center text-[var(--text-secondary)] text-xs font-bold">
                {p.autor_nome_user?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div className="text-sm font-bold text-[var(--text-primary)]">@{p.autor_nome_user ?? 'desconhecido'}</div>
            </div>
            <div className="text-xs text-[var(--text-secondary)]">2h atrás</div>
          </header>
          
          <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--accent-primary)] transition-colors">{p.titulo}</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-4">{p.conteudo}</p>
          
          <footer className="pt-4 border-t border-[var(--input-bg)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[var(--input-bg)] transition-colors">
                <Layout size={16} /> <span>Votar</span>
              </button>
              <button className="flex items-center gap-2 text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[var(--input-bg)] transition-colors">
                <Columns size={16} /> <span>Comentar</span>
              </button>
            </div>
            <DenunciarButton postId={p.post_id} />
          </footer>
        </article>
      ))}
    </div>
  );
}

function DenunciarButton({ postId }: { postId: number }) {
  return (
    <button
      className="flex items-center gap-2 text-xs font-bold rounded-lg px-3 py-2 text-[var(--color-if-red)] hover:bg-[var(--color-if-red)]/10 transition-colors"
      onClick={async (e) => {
        e.preventDefault();
        const res = await Notificacao.modal.confirmar({
          titulo: 'Denunciar Post',
          texto: 'Esta ação enviará o conteúdo para análise da moderação. Confirmar?',
          textoConfirmar: 'Sim, denunciar',
          isDestructive: true
        });
        if (res === true) {
          // Implementação futura da denúncia
          Notificacao.toast.sucesso('Denúncia enviada!', 'Obrigado por ajudar a manter a comunidade segura.');
        }
      }}
    >
      <X size={14} />
      <span>Denunciar</span>
    </button>
  );
}

function GamificationPanel({ perfil }: { perfil: PerfilResumo | null }) {
  const karma = Math.max(0, Math.min(100, Math.round((perfil?.score_karma ?? 0) % 101)));
  const leitura = Math.max(0, Math.min(100, Math.round((perfil?.reading_points ?? 0) % 101)));
  
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold">Karma</span>
          <span className="text-xs text-[var(--text-secondary)] font-mono">{perfil?.score_karma ?? 0} pts</span>
        </div>
        <div className="h-3 w-full rounded-full bg-[var(--input-bg)] overflow-hidden p-0.5">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--accent-primary-rgb),0.3)]" 
            style={{ width: `${karma}%`, backgroundColor: 'var(--accent-primary)' }} 
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold">Leitura</span>
          <span className="text-xs text-[var(--text-secondary)] font-mono">{perfil?.reading_points ?? 0} pts</span>
        </div>
        <div className="h-3 w-full rounded-full bg-[var(--input-bg)] overflow-hidden p-0.5">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${leitura}%`, backgroundColor: 'var(--color-if-green)' }} 
          />
        </div>
      </div>

      <div className="mt-2 p-3 bg-[var(--input-bg)]/50 rounded-xl border border-[var(--input-bg)]">
        <p className="text-[10px] text-[var(--text-secondary)] text-center italic">
          Nível atual: {karma > 80 ? 'Veterano' : karma > 40 ? 'Engajado' : 'Novato'}
        </p>
      </div>
    </div>
  );
}
