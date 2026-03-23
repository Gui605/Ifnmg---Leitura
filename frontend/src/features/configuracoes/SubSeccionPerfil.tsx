
import { useAuth } from '../../shared/utils/authContext';
import { updateMeuPerfil, setTituloAtivo } from '../../shared/services/perfil.service';
import { Notificacao } from '../../shared/utils/Notificacao';
import { useState, useEffect } from 'react';
import { Medal, Check } from 'lucide-react';

export function SubSeccionPerfil() {
  const { perfil, setPerfil } = useAuth();
  const [nomeUser, setNomeUser] = useState(perfil?.nome_user || '');
  const [bio, setBio] = useState(perfil?.bio || '');
  const [loadingTitulo, setLoadingTitulo] = useState<number | null>(null);

  useEffect(() => {
    if (perfil) {
      setNomeUser(perfil.nome_user || '');
      setBio(perfil.bio || '');
    }
  }, [perfil]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil) return;

    try {
      const updatedPerfil = await updateMeuPerfil({ nome_user: nomeUser, bio });
      setPerfil(updatedPerfil.perfil);
      Notificacao.toast.sucesso('Perfil atualizado com sucesso!');
    } catch (error) {
      Notificacao.toast.erro('Erro ao atualizar o perfil.');
    }
  };

  const handleEquipar = async (tituloId: number) => {
    setLoadingTitulo(tituloId);
    try {
      const updated = await setTituloAtivo(tituloId);
      setPerfil(updated);
      Notificacao.toast.sucesso("Título Atualizado!", "Sua nova identidade acadêmica foi salva.");
    } catch (error) {
      Notificacao.toast.erro("Erro ao equipar título.");
    } finally {
      setLoadingTitulo(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="bg-[var(--bg-card)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-elevation-1)]">
        <div className="flex flex-col mb-6">
          <h2 className="text-[var(--text-primary)] dark:text-slate-100 text-xl font-bold leading-tight font-lexend">
            Perfil Público
          </h2>
          <p className="text-[var(--text-secondary)] text-sm">Essas informações serão exibidas publicamente.</p>
        </div>
        <form className="grid grid-cols-1 gap-6 max-w-2xl" onSubmit={handleSave}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[var(--text-primary)] font-lexend">Nome de Usuário</label>
            <input
              className="rounded-xl border-[var(--border-color)] bg-[var(--input-bg)] focus:border-[var(--color-if-green)] focus:ring-0 w-full p-3 text-sm transition-all duration-300"
              value={nomeUser}
              onChange={(e) => setNomeUser(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[var(--text-primary)] font-lexend">Biografia</label>
            <textarea
              className="rounded-xl border-[var(--border-color)] bg-[var(--input-bg)] focus:border-[var(--color-if-green)] focus:ring-0 w-full p-3 text-sm transition-all duration-300"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>
          </div>
          <div className="col-span-1 pt-2">
            <button
              className="bg-[var(--accent-primary)] hover:brightness-110 text-white font-bold py-3 px-6 rounded-xl transition-all text-sm active:scale-95"
              type="submit"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </section>

      {/* Seção de Títulos */}
      <section className="bg-[var(--bg-card)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-elevation-1)]">
        <div className="flex flex-col mb-6">
          <h2 className="text-[var(--text-primary)] text-xl font-bold leading-tight font-lexend">
            Meus Títulos Acadêmicos
          </h2>
          <p className="text-[var(--text-secondary)] text-sm">Escolha como deseja ser reconhecido na plataforma.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {perfil?.titulos?.map((pt) => {
            const isAtivo = pt.titulo.nome === perfil.titulo_ativo;
            const isLoading = loadingTitulo === pt.titulo.titulo_id;

            return (
              <button
                key={pt.titulo.titulo_id}
                onClick={() => !isAtivo && handleEquipar(pt.titulo.titulo_id)}
                disabled={isAtivo || isLoading}
                className={`
                  flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left
                  ${isAtivo 
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 cursor-default' 
                    : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/30'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-lg flex items-center justify-center transition-colors ${isAtivo ? 'bg-[var(--accent-primary)] text-white shadow-[0_0_10px_rgba(26,128,57,0.3)]' : 'bg-[var(--input-bg)] text-[var(--text-secondary)]'}`}>
                    <Medal size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className={`text-sm font-black font-lexend ${isAtivo ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                      {pt.titulo.nome}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">
                      {pt.titulo.categoria}
                    </p>
                  </div>
                </div>
                {isAtivo && <Check size={18} strokeWidth={2} className="text-[var(--accent-primary)]" />}
                {isLoading && <div className="size-4 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
