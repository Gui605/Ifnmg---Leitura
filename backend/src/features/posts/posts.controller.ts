//backend/src/features/posts/posts.controller.ts
import { Request, Response } from 'express';
import { tratarAssincrono } from '../../shared/utils/asyncHandler'; 
import postsService from './posts.service';
import { PostCreateBody, PostsQuery, PostVoteBody, PostCommentBody } from '../../shared/types/post.types';
import { AppError } from '../../shared/utils/AppError';

// 🛡️ Tipagem de parâmetros da URL para evitar 'undefined'
type PostIdParams = { id: string };
type EmptyBody = Record<string, never>;

const criarPost = tratarAssincrono(async (req: Request<{}, any, PostCreateBody>, res: Response) => {
    const perfilId = req.perfil_id; 
    const { titulo, conteudo, tags } = req.body; 
    
    if (!perfilId) {
        throw AppError.unauthorized('Sessão inválida. Por favor, faça login novamente.');
    }

    // Garante integridade referencial removendo duplicatas de tags
    const tagsUnicas = [...new Set(tags)];

    const novoPost = await postsService.criarPost(perfilId, { 
        titulo, 
        conteudo, 
        tags: tagsUnicas 
    }, req.requestId);

    return res.status(201).json({
        status: 'success',
        message: 'Post publicado com sucesso.',
        data: novoPost,
        meta: null
    });
});

const listarPosts = tratarAssincrono(async (req: Request<{}, any, any, PostsQuery>, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const categoriaId = req.query.categoria ? Number(req.query.categoria) : undefined;
    const { ordenarPor } = req.query;

    const { posts, meta } = await postsService.listar({ 
        page, 
        limit, 
        categoriaId,
        ordenarPor 
    });

    return res.status(200).json({
        status: 'success',
        message: 'Feed de posts recuperado.',
        data: posts,
        meta
    });
});

const deletarPost = tratarAssincrono(async (req: Request<PostIdParams, any, EmptyBody>, res: Response) => {
    const postId = Number(req.params.id);
    const perfilId = req.perfil_id;

    // 🛡️ Validação robusta de tipos numéricos para prevenir SQL Errors
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError.badRequest("ID da publicação inválido.");
    }

    if (!perfilId) throw AppError.unauthorized('Acesso não autorizado.');

    await postsService.deletarPost(postId, perfilId, req.requestId);

    return res.status(200).json({
        status: 'success',
        message: 'Post excluído com sucesso.',
        data: null,
        meta: null
    });
});

const votarPost = tratarAssincrono(async (req: Request<PostIdParams, any, PostVoteBody>, res: Response) => {
    const postId = Number(req.params.id);
    const perfilId = req.perfil_id;
    const { tipo } = req.body;
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError.badRequest("ID da publicação inválido.");
    }
    if (!perfilId) throw AppError.unauthorized('Acesso não autorizado.');
    const postAtualizado = await postsService.votarPost(perfilId, postId, tipo, req.requestId);
    return res.status(200).json({ status: 'success', message: 'Voto registrado.', data: postAtualizado, meta: null });
});

const comentarPost = tratarAssincrono(async (req: Request<PostIdParams, any, PostCommentBody>, res: Response) => {
    const postId = Number(req.params.id);
    const perfilId = req.perfil_id;
    const { texto } = req.body;
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError.badRequest("ID da publicação inválido.");
    }
    if (!perfilId) throw AppError.unauthorized('Acesso não autorizado.');
    const postAtualizado = await postsService.comentarPost(perfilId, postId, texto, req.requestId);
    return res.status(201).json({ status: 'success', message: 'Comentário publicado.', data: postAtualizado, meta: null });
});

export default { criarPost, listarPosts, deletarPost, votarPost, comentarPost };
