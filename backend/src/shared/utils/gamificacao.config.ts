// implementar / refatorar
/*
Configuração do Motor de Gamificação
 XP Orgânico com Decaimento Temporal e Especialização
 */

//Categorias e Pesos de XP

// XP por ação própria: Recompensa o esforço de criação de conteúdo.
export const CATEGORIA_ESCRITA = {
    POST_AVULSO: 20,    // Mínimo 100 caracteres (Post simples)
    OBRA_CAPITULO: 40,  // Mínimo 300 caracteres (Capítulo de uma obra)
    OBRA_CRIAR: 50,     // Criação de nova Obra (Projeto)
} as const;

// XP por ação de curadoria: Recompensa a disseminação de conhecimento.
export const CATEGORIA_CURADORIA = {
    REPOST_REALIZADO: 10,
} as const;

// XP social (karma): Recompensa quem recebe engajamento.
// Apenas o autor do post ganha XP quando alguém interage.
export const CATEGORIA_SOCIAL = {
    VOTO_UP_RECEBIDO: 5,
    REACAO_RECEBIDA: 3,
    FAVORITO_RECEBIDO: 10,
} as const;

// Regras de spam e espontaneidade

/*
 Regras de espontaneidade:
- O usuário que REAGE ou COMENTA não ganha XP (Ação espontânea).
- O objetivo é focar exclusivamente em RECOMPENSAR QUEM RECEBE engajamento.
*/
export const LIMITES_DIARIOS = {
    MAX_XP_POR_DIA: 2000, // limite de XP por dia para evitar saltos artificiais de nível por post viral
} as const;

// Motor de decaimento temporal

/*
 Calcula o XP final de uma interação social baseada na antiguidade do post.
 Lógica de Decaimento:
-  0h a 48h: 1.0x Engajamento fresco - Recompensa total
-  48h a 168h (1 semana): 0.5x Conteúdo esfriando
-  > 168h: 0.1x Conteúdo antigo - Proteção contra spam de posts "zumbis"
 
 @param pontosBase Valor fixo da CATEGORIA_SOCIAL
 @param dataCriacaoPost Data em que o post original foi publicado
 @returns Pontos ajustados pelo tempo
 */
export function calcularXpComDecaimento(pontosBase: number, dataCriacaoPost: Date): number {
    const agora = new Date().getTime();
    const criacao = new Date(dataCriacaoPost).getTime();
    const diffHoras = (agora - criacao) / (1000 * 60 * 60);

    if (diffHoras <= 48) return pontosBase;
    if (diffHoras <= 168) return Math.floor(pontosBase * 0.5) || 1;
    
    return Math.floor(pontosBase * 0.1) || 1; // Garante pelo menos 1 XP
}

// Motor de nível

/*
 Fórmula Geométrica de Nível de XP
 Curva: Nível * 100 * (1.5 ^ Nível)
 
 Progressão Estimada:
 Lvl 1: ~150 XP
 Lvl 5: ~750 XP * 7.5 = 5625 XP
 Lvl 10: ~1000 XP * 57 = 57000 XP
 */
export function calcularNivel(xpTotal: number): number {
    let nivel = 1;
    while (xpTotal >= xpParaNivel(nivel + 1)) {
        nivel++;
    }
    return nivel;
}

//Retorna o XP TOTAL necessário para alcançar o nível alvo.
export function xpParaNivel(nivel: number): number {
    if (nivel <= 1) return 0;
    return Math.floor(nivel * 100 * Math.pow(1.5, nivel));
}

// Especialização de Títulos

export type CategoriaXp = 'ESCRITA' | 'CURADORIA' | 'SOCIAL';

export interface TituloEspecialidade {
    nome: string;
    exigenciaXp: number;
    categoria: CategoriaXp;
}

/*
 Mapeamento de Títulos por Especialidade.
 O sistema de service deve rastrear XP por categoria separadamente para validar estas exigências.
 */
export const TITULOS_ESPECIALIDADE: TituloEspecialidade[] = [
    { nome: "Escritor Iniciante", exigenciaXp: 500, categoria: 'ESCRITA' },
    { nome: "Escritor Experiente", exigenciaXp: 1000, categoria: 'ESCRITA' },
    { nome: "Curador da Biblioteca", exigenciaXp: 1000, categoria: 'CURADORIA' },
    { nome: "Mestre da Comunidade", exigenciaXp: 10000, categoria: 'SOCIAL' },
];

// Patentes Globais baseadas apenas no Nível Total.
export const PATENTES_GLOBAIS = [
    { nivel: 1, nome: "Calouro" },
    { nivel: 10, nome: "Explorador" },
    { nivel: 20, nome: "Pesquisador" },
    { nivel: 30, nome: "Erudito" },
    { nivel: 50, nome: "Mestre Lendário" }
] as const;
