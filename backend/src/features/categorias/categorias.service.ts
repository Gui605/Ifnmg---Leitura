import prisma from '../../shared/prisma/prisma.client';
import { CategoriaCreateBody, CategoriaUpdateBody, InteresseResponse, TrendingCategoriaResponse } from '../../shared/types/categoria.types';
import { AppError } from '../../shared/utils/AppError';
import { ErrorCodes } from '../../errors/ErrorCodes';

async function listar(requestId?: string) {
    const data = await prisma.categorias.findMany({
        orderBy: { nome: 'asc' }
    });
    return data;
}
// buscarPorId será implementado em painel admin
async function buscarPorId(id: number, requestId?: string) {
    if (!id || isNaN(id)) throw AppError.badRequest('ID inválido.');

    const categoria = await prisma.categorias.findUnique({
        where: { categoria_id: id }
    });
    
    if (!categoria) throw AppError.notFound('Categoria não encontrada.');
    
    return categoria;
}

async function criar(data: CategoriaCreateBody, requestId?: string) {
    const nomeLimpo = data.nome?.trim();
    if (!nomeLimpo) throw AppError.badRequest('O nome da categoria é obrigatório.');

    // 🛡️ SOLUÇÃO UNIVERSAL: Busca o registro e compara no JavaScript
    // Isso funciona em SQLite, MySQL e Postgres sem erro de 'mode'
    const existe = await prisma.categorias.findFirst({
        where: { nome: nomeLimpo } // Busca exata primeiro (mais rápido)
    });

    // Se não achou exato, fazemos uma busca de segurança para evitar "TI" e "ti"
    if (!existe) {
        const todas = await prisma.categorias.findMany({ select: { nome: true } });
        const alvo = nomeLimpo.toLowerCase();
        const duplicadoCase = todas.some(({ nome }) => nome.toLowerCase() === alvo);
        if (duplicadoCase) throw AppError.conflict('Já existe uma categoria com este nome (mesmo que com letras maiúsculas/minúsculas diferentes).');
    } else {
        throw AppError.conflict('Já existe uma categoria cadastrada com este nome.');
    }

    const created = await prisma.categorias.create({
        data: { nome: nomeLimpo }
    });
    return created;
}

async function atualizar(id: number, data: CategoriaUpdateBody, requestId?: string) {
    if (!id || isNaN(id)) throw AppError.badRequest('ID inválido.');
    const nomeLimpo = data.nome?.trim();
    if (!nomeLimpo) throw AppError.badRequest('O novo nome é obrigatório.');

    if (nomeLimpo.toLowerCase() === 'geral') {
        throw AppError.badRequest('O nome "Geral" é reservado para o sistema.');
    }

    const categoria = await prisma.categorias.findUnique({ where: { categoria_id: id } });
    if (!categoria) throw AppError.notFound('Categoria não encontrada.');

    // Verifica duplicidade manual (Universal)
    const todasExcetoEsta = await prisma.categorias.findMany({
        where: { NOT: { categoria_id: id } },
        select: { nome: true }
    });
    
    const novoNome = nomeLimpo.toLowerCase();
    const duplicada = todasExcetoEsta.some(({ nome }) => nome.toLowerCase() === novoNome);
    if (duplicada) throw AppError.conflict('Já existe outra categoria com este nome.');

    const updated = await prisma.categorias.update({
        where: { categoria_id: id },
        data: { nome: nomeLimpo }
    });
    return updated;
}

async function excluir(id: number, requestId?: string) {
    if (!id || isNaN(id)) throw AppError.badRequest('ID inválido.');

    const vinculacoes = await prisma.postsCategorias.count({
        where: { categoria_id: id }
    });

    if (vinculacoes > 0) {
        throw AppError.conflict(
            `Não é possível excluir: existem ${vinculacoes} publicações vinculadas a esta categoria.`
        );
    }

    const deleted = await prisma.categorias.delete({
        where: { categoria_id: id }
    });
    return deleted;
}

export default { listar, criar, atualizar, excluir };

// ====== Fusão de Interesses (Taxonomia) ======
export async function seguirCategoria(perfilId: number, categoriaId: number, requestId?: string): Promise<void> {
    const categoriaExiste = await prisma.categorias.findUnique({
        where: { categoria_id: categoriaId },
        select: { categoria_id: true } 
    });
    if (!categoriaExiste) {
        throw AppError.notFound('A categoria que você tenta seguir não existe ou foi removida.');
    }
    await prisma.interesses.upsert({
        where: {
            perfil_id_categoria_id: {
                perfil_id: perfilId,
                categoria_id: categoriaId
            }
        },
        update: {},
        create: {
            perfil_id: perfilId,
            categoria_id: categoriaId
        }
    });
}

export async function deixarDeSeguirCategoria(perfilId: number, categoriaId: number, requestId?: string): Promise<void> {
    try {
        await prisma.interesses.delete({
            where: {
                perfil_id_categoria_id: {
                    perfil_id: perfilId,
                    categoria_id: categoriaId
                }
            }
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            throw AppError.notFound('Você não segue esta categoria ou ela já foi removida.');
        }
        throw error;
    }
}

export async function listarInteresses(perfilId: number, requestId?: string): Promise<InteresseResponse[]> {
    const interesses = await prisma.interesses.findMany({
        where: { perfil_id: perfilId },
        include: {
            categoria: {
                select: {
                    categoria_id: true,
                    nome: true
                }
            }
        },
        orderBy: {
            categoria: {
                nome: 'asc'
            }
        }
    });
    const out = interesses.map(item => ({
        perfil_id: item.perfil_id,
        categoria_id: item.categoria_id,
        categoria: {
            categoria_id: item.categoria.categoria_id,
            nome: item.categoria.nome
        }
    }));
    return out;
}

/**
 * 📈 TRENDING TAGS: Agregação de Categorias em Alta
 * Identifica as categorias com mais posts nos últimos 7 dias.
 */
export async function buscarCategoriasEmAlta(limite: number = 5, _requestId?: string): Promise<TrendingCategoriaResponse[]> {
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Agrega contagem de posts por categoria no período
    const agregacao = await prisma.postsCategorias.groupBy({
        by: ['categoria_id'],
        where: {
            post: {
                data_criacao: {
                    gte: seteDiasAtras
                }
            }
        },
        _count: {
            post_id: true
        },
        orderBy: {
            _count: {
                post_id: 'desc'
            }
        },
        take: limite
    });

    if (agregacao.length === 0) return [];

    // 2. Hidrata com o nome das categorias
    const ids = agregacao.map(a => a.categoria_id);
    const categorias = await prisma.categorias.findMany({
        where: { categoria_id: { in: ids } },
        select: { categoria_id: true, nome: true }
    });

    // 3. Formata o retorno mantendo a ordem da agregação
    return agregacao.map(a => {
        const cat = categorias.find(c => c.categoria_id === a.categoria_id);
        return {
            categoria_id: a.categoria_id,
            nome: cat?.nome ?? 'Desconhecida',
            contagem: a._count.post_id
        };
    });
}
