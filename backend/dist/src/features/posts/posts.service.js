"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/features/posts/posts.service.ts
const prisma_client_1 = __importDefault(require("../../shared/prisma/prisma.client"));
const AppError_1 = require("../../shared/utils/AppError");
const logService_1 = require("../../shared/utils/logService");
const ErrorCodes_1 = require("../../errors/ErrorCodes");
const perfil_service_1 = __importDefault(require("../perfil/perfil.service"));
async function criarPost(perfilId, data, requestId) {
    // 🛡️ Denormalização: Busca o nome do autor e o campus antes de criar o post
    const perfil = await prisma_client_1.default.perfis.findUnique({
        where: { perfil_id: perfilId },
        select: {
            nome_user: true,
            usuario: {
                select: { nome_campus: true }
            }
        }
    });
    if (!perfil)
        throw AppError_1.AppError.notFound('Perfil do autor não encontrado.');
    const post = await prisma_client_1.default.$transaction(async (tx) => {
        let categoriasIds = [];
        // 🛡️ SEGURANÇA: Se houver obra_id, valida se o perfilId é o autor da obra e herda categorias
        if (data.obra_id) {
            const obra = await tx.obras.findUnique({
                where: { obra_id: data.obra_id },
                include: {
                    categorias: {
                        select: { categoria_id: true }
                    }
                }
            });
            if (!obra)
                throw AppError_1.AppError.notFound('Obra vinculada não encontrada.');
            // TODO: Considerar implementação de Co-autoria no futuro para permitir que outros perfis postem nesta Obra
            const isAutor = obra.autor_id === perfilId;
            if (!isAutor) {
                throw AppError_1.AppError.forbidden('Você não tem permissão para adicionar capítulos a esta obra.');
            }
            // Herança de categorias da obra
            categoriasIds = obra.categorias.map(c => c.categoria_id);
        }
        else {
            // 1. Converter tags (nomes) em IDs de categorias (apenas se não for obra)
            if (data.tags) {
                for (const tagName of data.tags) {
                    const categoria = await tx.categorias.upsert({
                        where: { nome: tagName },
                        update: {},
                        create: { nome: tagName }
                    });
                    categoriasIds.push(categoria.categoria_id);
                }
            }
        }
        // 2. Lógica de Ordem para Capítulos de Obras (Busca o maior valor atual para evitar duplicidade)
        let ordem = undefined;
        if (data.obra_id) {
            const ultimoCapitulo = await tx.posts.findFirst({
                where: { obra_id: data.obra_id },
                orderBy: { ordem: 'desc' },
                select: { ordem: true }
            });
            ordem = (ultimoCapitulo?.ordem ?? 0) + 1;
        }
        // 3. Criar o post com snapshot de autoria e relações
        const novo = await tx.posts.create({
            data: {
                titulo: data.titulo,
                conteudo: data.conteudo,
                autor_id: perfilId,
                autor_nome_user: perfil.nome_user, // Snapshot
                nome_campus: perfil.usuario?.nome_campus, // Snapshot
                obra_id: data.obra_id,
                ordem, // Sequencial se for obra
                comunidade_id: data.comunidade_id,
                status: data.status || 'ANDAMENTO'
            }
        });
        // 4. Vincular categorias (Herdadas ou novas)
        if (categoriasIds.length > 0) {
            const links = categoriasIds.map((cid) => ({ post_id: novo.post_id, categoria_id: cid }));
            await tx.postsCategorias.createMany({ data: links, skipDuplicates: true });
        }
        return novo;
    });
    await (0, logService_1.registrar)(perfilId, 'POST_CREATED', { post_id: post.post_id }, requestId);
    // 🎮 LÓGICA DE XP (IFNMG) - Recompensa apenas se atingir o tamanho mínimo
    const isObra = !!data.obra_id;
    const length = data.conteudo.length;
    if (isObra && length >= 300) {
        // Capítulo de Obra: >= 300 caracteres
        console.log(`[XP] Ganho por Capítulo de Obra - Perfil: ${perfilId}`);
        await perfil_service_1.default.processarGanhoXP(perfilId, 'OBRA_CAPITULO', requestId);
    }
    else if (!isObra && length >= 100) {
        // Post Avulso: >= 100 caracteres
        console.log(`[XP] Ganho por Post Avulso - Perfil: ${perfilId}`);
        await perfil_service_1.default.processarGanhoXP(perfilId, 'POST_AVULSO', requestId);
    }
    else {
        // Log informativo para monitoramento de spam/qualidade
        await (0, logService_1.registrar)(perfilId, 'XP_SKIPPED_MIN_CHARS', {
            post_id: post.post_id,
            length,
            required: isObra ? 300 : 100
        }, requestId);
    }
    return post;
}
async function listar(q) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 10;
    const skip = (page - 1) * limit;
    const where = {};
    if (q.categoriaId) {
        where.categorias = { some: { categoria_id: q.categoriaId } };
    }
    if (q.autorId) {
        where.autor_id = q.autorId;
    }
    const orderBy = q.ordenarPor === 'score'
        ? { total_upvotes: 'desc' }
        : { data_criacao: 'desc' };
    const [total, posts] = await Promise.all([
        prisma_client_1.default.posts.count({ where }),
        prisma_client_1.default.posts.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: {
                autor: {
                    select: { nome_user: true }
                },
                obra: {
                    select: { titulo: true }
                },
                categorias: {
                    include: {
                        categoria: {
                            select: { nome: true }
                        }
                    }
                }
            }
        })
    ]);
    const data = posts.map(p => ({
        ...p,
        autor_display: {
            nome: p.autor?.nome_user ?? p.autor_nome_user ?? "Usuário Deletado",
            campus: p.nome_campus ?? "IFNMG",
            deletado: !p.autor
        },
        tags: p.categorias.map(c => c.categoria.nome)
    }));
    return {
        posts: data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}
async function deletarPost(postId, perfilId, requestId) {
    const post = await prisma_client_1.default.posts.findUnique({ where: { post_id: postId }, select: { autor_id: true } });
    if (!post)
        throw AppError_1.AppError.notFound('Publicação não encontrada.');
    if (!post.autor_id || post.autor_id !== perfilId)
        throw new AppError_1.AppError('Você não tem permissão para excluir esta publicação.', 403, ErrorCodes_1.ErrorCodes.FORBIDDEN);
    await prisma_client_1.default.posts.delete({ where: { post_id: postId } });
    await (0, logService_1.registrar)(perfilId, 'POST_DELETED', { post_id: postId }, requestId);
}
async function votarPost(perfilId, postId, tipo, requestId) {
    const post = await prisma_client_1.default.posts.findUnique({
        where: { post_id: postId },
        select: { post_id: true, autor_id: true }
    });
    if (!post)
        throw AppError_1.AppError.notFound('Publicação não encontrada.');
    await prisma_client_1.default.$transaction(async (tx) => {
        const existente = await tx.votos.findUnique({
            where: { perfil_id_post_id: { perfil_id: perfilId, post_id: postId } },
            select: { tipo: true }
        });
        if (existente && existente.tipo === tipo) {
            throw AppError_1.AppError.badRequest('Voto já registrado para este post.');
        }
        // 🛡️ RECOMPENSA DE XP (Idempotência: apenas o primeiro voto gera XP)
        if (!existente) {
            // 1. Autor do post ganha XP se for um UPVOTE
            if (tipo === 'UP' && post.autor_id) {
                // Passamos a data de criação do post para calcular o decaimento
                const dataPost = await tx.posts.findUnique({
                    where: { post_id: postId },
                    select: { data_criacao: true }
                });
                if (dataPost) {
                    await perfil_service_1.default.processarGanhoXP(post.autor_id, 'VOTO_UP_RECEBIDO', requestId, dataPost.data_criacao);
                }
            }
        }
        try {
            await tx.votos.upsert({
                where: { perfil_id_post_id: { perfil_id: perfilId, post_id: postId } },
                update: { tipo },
                create: { perfil_id: perfilId, post_id: postId, tipo }
            });
        }
        catch (e) {
            if (e?.code === 'P2002') {
                await tx.votos.update({
                    where: { perfil_id_post_id: { perfil_id: perfilId, post_id: postId } },
                    data: { tipo }
                });
            }
            else {
                throw e;
            }
        }
        const counts = await tx.votos.groupBy({
            by: ['post_id', 'tipo'],
            where: { post_id: postId },
            _count: { _all: true }
        });
        const up = counts.find((c) => c.tipo === 'UP')?._count._all ?? 0;
        const down = counts.find((c) => c.tipo === 'DOWN')?._count._all ?? 0;
        await tx.posts.update({
            where: { post_id: postId },
            data: { total_upvotes: up, total_downvotes: down }
        });
    });
    await (0, logService_1.registrar)(perfilId, 'POST_VOTED', { post_id: postId, tipo }, requestId);
    const postAtualizado = await prisma_client_1.default.posts.findUnique({
        where: { post_id: postId },
        include: { autor: { select: { nome_user: true } } }
    });
    if (!postAtualizado)
        throw AppError_1.AppError.notFound('Publicação não encontrada após atualização.');
    return postAtualizado;
}
async function reagirPost(perfilId, postId, tipo, requestId) {
    const post = await prisma_client_1.default.posts.findUnique({
        where: { post_id: postId },
        select: { post_id: true, autor_id: true, data_criacao: true }
    });
    if (!post)
        throw AppError_1.AppError.notFound('Publicação não encontrada.');
    await prisma_client_1.default.$transaction(async (tx) => {
        const existente = await tx.reacoes.findUnique({
            where: { perfil_id_post_id_tipo: { perfil_id: perfilId, post_id: postId, tipo } }
        });
        if (existente) {
            throw AppError_1.AppError.badRequest('Reação já registrada.');
        }
        // 🛡️ RECOMPENSA DE XP (IFNMG)
        // Apenas reações positivas geram XP para o autor do post
        const reacoesPositivas = ['LIKE', 'LOVE', 'FIRE'];
        if (reacoesPositivas.includes(tipo) && post.autor_id) {
            await perfil_service_1.default.processarGanhoXP(post.autor_id, 'REACAO_RECEBIDA', requestId, post.data_criacao);
        }
        await tx.reacoes.create({
            data: { perfil_id: perfilId, post_id: postId, tipo }
        });
    });
    await (0, logService_1.registrar)(perfilId, 'POST_REACTED', { post_id: postId, tipo }, requestId);
    return await prisma_client_1.default.posts.findUnique({
        where: { post_id: postId },
        include: { reacoes: true }
    });
}
async function getPostById(postId, perfilId) {
    const post = await prisma_client_1.default.posts.findUnique({
        where: { post_id: postId },
        include: {
            autor: {
                select: {
                    nome_user: true,
                    perfil_id: true,
                    level: true,
                    titulo_ativo: true,
                    xp_escrita: true,
                    xp_social: true,
                    xp_curadoria: true
                }
            },
            obra: {
                select: {
                    obra_id: true,
                    titulo: true,
                    autor_id: true
                }
            },
            categorias: {
                include: {
                    categoria: {
                        select: { nome: true }
                    }
                }
            },
            reacoes: true,
            comentarios: {
                where: { parent_id: null },
                orderBy: { data_criacao: 'desc' },
                include: {
                    perfil: {
                        select: {
                            nome_user: true,
                            perfil_id: true,
                            level: true,
                            titulo_ativo: true
                        }
                    },
                    respostas: {
                        include: {
                            perfil: {
                                select: {
                                    nome_user: true,
                                    perfil_id: true,
                                    level: true,
                                    titulo_ativo: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    if (!post)
        throw AppError_1.AppError.notFound('Publicação não encontrada.');
    // Incrementa visualizações (fora da transação principal)
    // 🛡️ DEBUG: Log para rastrear incremento de visualização
    console.log(`[DEBUG] Incrementando visualização para post ${postId}`);
    await prisma_client_1.default.posts.update({
        where: { post_id: postId },
        data: { visualizacoes: { increment: 1 } }
    });
    // 🛡️ NAVEGAÇÃO ENTRE CAPÍTULOS
    let navegacao = { anterior_id: null, proximo_id: null };
    if (post.obra_id && post.ordem !== null) {
        const [anterior, proximo] = await Promise.all([
            prisma_client_1.default.posts.findFirst({
                where: { obra_id: post.obra_id, ordem: { lt: post.ordem } },
                orderBy: { ordem: 'desc' },
                select: { post_id: true }
            }),
            prisma_client_1.default.posts.findFirst({
                where: { obra_id: post.obra_id, ordem: { gt: post.ordem } },
                orderBy: { ordem: 'asc' },
                select: { post_id: true }
            })
        ]);
        navegacao = {
            anterior_id: anterior?.post_id ?? null,
            proximo_id: proximo?.post_id ?? null
        };
    }
    // 📊 AGRUPAMENTO DE REAÇÕES
    const reacoesAgrupadas = post.reacoes.reduce((acc, curr) => {
        acc[curr.tipo] = (acc[curr.tipo] || 0) + 1;
        return acc;
    }, {});
    // 🛡️ VERIFICA REAÇÃO DO USUÁRIO LOGADO
    let minhaReacao = null;
    if (perfilId) {
        const reacao = post.reacoes.find(r => r.perfil_id === perfilId);
        minhaReacao = reacao ? reacao.tipo : null;
    }
    return {
        ...post,
        autor_display: {
            nome: post.autor?.nome_user ?? post.autor_nome_user ?? "Usuário Deletado",
            campus: post.nome_campus ?? "IFNMG",
            deletado: !post.autor
        },
        navegacao,
        reacoes_count: reacoesAgrupadas,
        minha_reacao: minhaReacao,
        tags: post.categorias.map(c => c.categoria.nome)
    };
}
exports.default = { criarPost, deletarPost, listar, votarPost, reagirPost, getPostById };
