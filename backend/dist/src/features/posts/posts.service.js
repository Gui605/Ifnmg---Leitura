"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//backend/src/features/posts/posts.service.ts
const prisma_client_1 = __importDefault(require("../../shared/prisma/prisma.client"));
const AppError_1 = require("../../shared/utils/AppError");
const logService_1 = require("../../shared/utils/logService");
const ErrorCodes_1 = require("../../errors/ErrorCodes");
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
        const novo = await tx.posts.create({
            data: {
                titulo: data.titulo,
                conteudo: data.conteudo,
                autor_id: perfilId,
                autor_nome_user: perfil.nome_user, // Campo denormalizado
                nome_campus: perfil.usuario?.nome_campus // Campo denormalizado
            }
        });
        if (data.categoriasIds?.length) {
            const links = data.categoriasIds.map((cid) => ({ post_id: novo.post_id, categoria_id: cid }));
            await tx.postsCategorias.createMany({ data: links, skipDuplicates: true });
        }
        return novo;
    });
    await (0, logService_1.registrar)(perfilId, 'POST_CREATED', { post_id: post.post_id }, requestId);
    return post;
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
async function listarPosts(q, perfilId, requestId) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 10;
    const skip = (page - 1) * limit;
    // Definição tipada do where (usando Prisma.PostsWhereInput se possível)
    const where = {};
    if (q.categoria) {
        where.categorias = { some: { categoria_id: q.categoria } };
    }
    const orderBy = q.ordenarPor === 'score'
        ? [{ total_upvotes: 'desc' }, { data_criacao: 'desc' }]
        : [{ data_criacao: 'desc' }];
    const [total, posts] = await Promise.all([
        prisma_client_1.default.posts.count({ where }),
        prisma_client_1.default.posts.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            include: {
                categorias: {
                    include: {
                        categoria: {
                            select: {
                                nome: true,
                                categoria_id: true
                            }
                        }
                    }
                }
            }
        })
    ]);
    const totalPages = Math.ceil(total / limit);
    // Mantenha os contadores (stats) que o seu backend já calcula!
    // O Frontend precisa deles para exibir o contador na tela.
    const postsComDados = posts.map((p) => ({
        ...p, // Espalha os dados brutos (inclui stats e autor_nome_user denormalizado)
        autor_nome_user: p.autor_nome_user ?? 'Anônimo', // Fallback caso o campo denormalizado esteja nulo (posts antigos)
        tags: p.categorias.map(c => c.categoria.nome) // Flatten tags para o frontend
    }));
    return {
        data: postsComDados,
        meta: {
            total,
            page,
            limit,
            totalPages
        }
    };
}
async function votarPost(perfilId, postId, tipo, requestId) {
    const post = await prisma_client_1.default.posts.findUnique({ where: { post_id: postId }, select: { post_id: true } });
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
async function comentarPost(perfilId, postId, texto, requestId) {
    const post = await prisma_client_1.default.posts.findUnique({ where: { post_id: postId }, select: { post_id: true } });
    if (!post)
        throw AppError_1.AppError.notFound('Publicação não encontrada.');
    await prisma_client_1.default.$transaction(async (tx) => {
        await tx.comentarios.create({
            data: { perfil_id: perfilId, post_id: postId, texto }
        });
        const total = await tx.comentarios.count({ where: { post_id: postId } });
        await tx.posts.update({ where: { post_id: postId }, data: { total_comentarios: total } });
    });
    await (0, logService_1.registrar)(perfilId, 'POST_COMMENTED', { post_id: postId }, requestId);
    const postAtualizado = await prisma_client_1.default.posts.findUnique({
        where: { post_id: postId },
        include: { autor: { select: { nome_user: true } } }
    });
    if (!postAtualizado)
        throw AppError_1.AppError.notFound('Publicação não encontrada após atualização.');
    return postAtualizado;
}
exports.default = { criarPost, deletarPost, listarPosts, votarPost, comentarPost };
