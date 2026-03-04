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
    const { titulo, conteudo, categoriasIds } = req.body; 
    
    if (!perfilId) {
        throw AppError.unauthorized('Sessão inválida. Por favor, faça login novamente.');
    }

    // Garante integridade referencial removendo duplicatas
    const categoriasUnicas = [...new Set(categoriasIds)];

    const novoPost = await postsService.criarPost(perfilId, { 
        titulo, 
        conteudo, 
        categoriasIds: categoriasUnicas 
    }, req.requestId);

    return res.status(201).json({
        status: 'success',
        message: 'Post publicado com sucesso.',
        data: novoPost
    });
});

const listarPosts = tratarAssincrono(async (req: Request<{}, any, any, PostsQuery>, res: Response) => {
    const perfilId = req.perfil_id; 
    const { page, limit, categoria, ordenarPor } = req.query;
    
    const result = await postsService.listarPosts({ page, limit, categoria, ordenarPor } as any, perfilId, req.requestId);

    return res.status(200).json({
        status: 'success',
        message: 'Publicações recuperadas com sucesso.',
        data: result.data,
        meta: result.meta
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

    return res.status(204).send();
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
    return res.status(200).json({ status: 'success', message: 'Voto registrado.', data: postAtualizado });
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
    return res.status(201).json({ status: 'success', message: 'Comentário publicado.', data: postAtualizado });
});

export default { criarPost, listarPosts, deletarPost, votarPost, comentarPost };
