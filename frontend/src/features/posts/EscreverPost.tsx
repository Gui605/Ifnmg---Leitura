// src/features/posts/EscreverPost.tsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Save, X, MapPin, Hash, GraduationCap, Scroll, Check, Languages, Activity } from "lucide-react";
import { Notificacao } from "../../shared/utils/Notificacao";
import { listarCategorias as getCategorias } from "../../shared/services/categoria.service";
import { criarPost } from "../../shared/services/post.service";
import { getMeuPerfil } from "../../shared/services/perfil.service";
import { Categoria } from "../../shared/types/categoria.types";
import { PerfilResumo } from "../../shared/types/perfil.types";
import EditorTexto from "./EditorTexto";
import PreviewCard from "./PreviewCard";
import Header from "../../shared/components/Header";

export default function EscreverPost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [perfil, setPerfil] = useState<PerfilResumo | null>(null);

  // Estados do Post
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [idioma, setIdioma] = useState("");
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<number[]>([]);
  const [exibirCampus, setExibirCampus] = useState(true);
  const [tagBusca, setTagBusca] = useState("");
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const tagInputRef = useRef<HTMLDivElement>(null);

  const sugestoesIniciais = categorias.slice(0, 3);
  const sugestoesFiltradas = tagBusca.length > 0 
    ? categorias
        .filter(c => c.nome.toLowerCase().includes(tagBusca.toLowerCase()))
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .slice(0, 10)
    : sugestoesIniciais;

  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (tagInputRef.current && !tagInputRef.current.contains(e.target as Node)) {
        setMostrarSugestoes(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  useEffect(() => {
    getMeuPerfil()
      .then(setPerfil)
      .catch(() => {
        // Fallback mock para perfil se falhar
        setPerfil({
          nome_user: "Guilherme_Dev",
          is_admin: true,
          score_karma: 1250,
          reading_points: 850,
          level: 10,
          xp: 500,
          xp_escrita: 200,
          xp_social: 150,
          xp_curadoria: 150
        });
      });

    getCategorias().then(setCategorias).catch(console.error);
  }, []);

  const handleCancelar = async () => {
    if (titulo || conteudo) {
      const confirmou = await Notificacao.modal.confirmar({
        titulo: "Descartar rascunho?",
        texto: "As alterações feitas no seu pergaminho serão perdidas permanentemente.",
        textoConfirmar: "Sim, descartar",
        textoCancelar: "Continuar escrevendo",
        isDestructive: true
      });
      if (!confirmou) return;
    }
    navigate(-1);
  };

  const handlePublicar = async () => {
    if (!titulo.trim() || !conteudo.trim() || !idioma) {
      Notificacao.toast.aviso("Título, conteúdo e idioma são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const tagsNomes = categorias
        .filter(c => categoriasSelecionadas.includes(c.categoria_id))
        .map(c => c.nome);

      await criarPost({
        titulo,
        conteudo,
        idioma,
        tags: tagsNomes
      });
      Notificacao.toast.sucesso("Pergaminho publicado com sucesso!");
      navigate("/feed");
    } catch (err: any) {
      Notificacao.toast.erro(err?.message || "Erro ao publicar pergaminho.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoria = (id: number) => {
    setCategoriasSelecionadas(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const writingHeaderActions = (
    <>
      <button 
        onClick={() => Notificacao.toast.info("Rascunho salvo localmente.")}
        className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--input-bg)] rounded-lg transition-all"
      >
        <Save size={16} /> Salvar Rascunho
      </button>
      <button 
        onClick={handlePublicar}
        disabled={loading}
        className="flex items-center gap-2 bg-[var(--accent-primary)] text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? "Publicando..." : (
          <>
            <Send size={16} /> Publicar Agora
          </>
        )}
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans">
      <Header 
        perfil={perfil}
        showSearch={false}
        onBack={handleCancelar}
        actions={writingHeaderActions}
      />

      <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-10">
        {/* Coluna do Editor */}
        <div className="space-y-8">
          {/* Título da Página */}
          <div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Criar Nova Publicação</h2>
            <p className="text-sm text-slate-500 mt-1">Compartilhe seu conhecimento acadêmico com a comunidade.</p>
          </div>

          {/* Título Independente */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-3 shadow-[var(--shadow-elevation-1)] space-y-2">
            <label className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Scroll size={16} className="text-[var(--accent-primary)]" />
                  Título do Pergaminho
                </label>
            <input 
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do seu pergaminho..."
              className="w-full bg-[var(--bg-card)] border border-[var(--accent-primary)]/20 rounded-xl px-5 py-1.5 text-3xs md:text-1.5xl font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30 focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-sm"
            />
          </div>
            
                
          {/* Categoria e Tags */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-3 shadow-[var(--shadow-elevation-1)] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seletor de Categoria */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <GraduationCap size={16} className="text-[var(--accent-primary)]" />
                  Categoria Principal
                </label>
                <select 
                  className="w-full bg-[var(--input-bg)] border-none rounded-lg px-4 py-1.5 text-sm font-semibold text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    if (id && !categoriasSelecionadas.includes(id)) {
                      setCategoriasSelecionadas(prev => [...prev, id]);
                    }
                  }}
                  value=""
                >
                  <option value="" disabled>Selecione uma categoria...</option>
                  {categorias.map(cat => (
                    <option key={cat.categoria_id} value={cat.categoria_id}>
                      {cat.nome.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
                  
              {/* Seletor de Tags com Autocomplete */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Hash size={16} className="text-[var(--accent-primary)]" />
                  Tags Adicionais
                </label>
                <div className="relative" ref={tagInputRef}>
                  <input 
                    type="text"
                    value={tagBusca}
                    onChange={(e) => {
                      setTagBusca(e.target.value);
                      setMostrarSugestoes(true);
                    }}
                    onFocus={() => setMostrarSugestoes(true)}
                    placeholder="Busque ou crie tags..."
                    className="w-full bg-[var(--input-bg)] border-none rounded-lg px-4 py-1.5 text-sm focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
                  />

                  {/* Popover de Sugestões */}
                  {mostrarSugestoes && (
                    <div className="absolute z-50 w-full mt-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto scrollbar-hide animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider px-4 py-2 bg-[var(--input-bg)]/30">
                        {tagBusca ? 'Resultados Encontrados' : 'Sugestões Populares'}
                      </p>
                      {sugestoesFiltradas.length > 0 ? (
                        sugestoesFiltradas.map(cat => (
                          <button
                            key={cat.categoria_id}
                            onClick={() => {
                              toggleCategoria(cat.categoria_id);
                              setTagBusca("");
                              setMostrarSugestoes(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/10 hover:text-[var(--accent-primary)] transition-colors flex items-center justify-between group"
                          >
                            <span>#{cat.nome.toUpperCase()}</span>
                            {categoriasSelecionadas.includes(cat.categoria_id) && (
                              <Check size={14} className="text-[var(--accent-primary)]" />
                            )}
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-3 text-xs text-[var(--text-secondary)] italic">Nenhuma tag encontrada.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Idioma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-color)]/30">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Languages size={16} className="text-[var(--accent-primary)]" />
                  Idioma
                </label>
                <select 
                  className="w-full bg-[var(--input-bg)] border-none rounded-lg px-4 py-1.5 text-sm font-semibold text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value)}
                >
                  <option value="" disabled>Selecione o idioma...</option>
                  <option value="Português">Português</option>
                  <option value="Inglês">Inglês</option>
                  <option value="Espanhol">Espanhol</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>

            {/* Tags Selecionadas */}
            <div className="flex flex-wrap gap-2 pt-2">
              {categoriasSelecionadas.map(id => {
                const cat = categorias.find(c => c.categoria_id === id);
                if (!cat) return null;
                return (
                  <button 
                    key={id}
                    onClick={() => toggleCategoria(id)}
                    className="flex items-center gap-1.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-3 py-1 rounded-full text-xs font-bold hover:bg-[var(--accent-primary)]/20 transition-all border border-[var(--accent-primary)]/20"
                  >
                    #{cat.nome.toUpperCase()}
                    <X size={12} />
                  </button>
                );
              })}
              {categoriasSelecionadas.length === 0 && (
                <span className="text-xs text-[var(--text-secondary)] italic opacity-60">Nenhuma tag selecionada ainda.</span>
              )}
            </div>
          </div>

          <EditorTexto 
            conteudo={conteudo} 
            setConteudo={setConteudo} 
          />

          {/* Identificação de Campus Separada */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-[var(--shadow-elevation-1)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg text-[var(--accent-primary)]">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">Identificação de Campus</p>
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-tight">Exibir "IFNMG - Araçuaí" no post</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={exibirCampus} 
                onChange={(e) => setExibirCampus(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-[var(--input-bg)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
            </label>
          </div>
        </div>

        {/* Coluna de Prévia */}
        <div className="hidden lg:block">
          <PreviewCard 
            titulo={titulo} 
            conteudo={conteudo} 
            autor={perfil?.nome_user || "Acadêmico"}
            campus={exibirCampus ? "Araçuaí" : undefined}
            tags={categorias.filter(c => categoriasSelecionadas.includes(c.categoria_id)).map(c => c.nome.toUpperCase())}
          />
        </div>
      </main>
    </div>
  );
}
