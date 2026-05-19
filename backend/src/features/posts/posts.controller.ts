//backend/src/features/posts/posts.controller.ts
import { Request, Response } from 'express';
import { tratarAssincrono } from '../../shared/utils/asyncHandler'; 
import postsService from './posts.service';
import comentariosService from './comentarios.service';
import perfilService from '../perfil/perfil.service';
import { PostCreateBody, PostsQuery, PostVoteBody, PostCommentBody, ReacaoBody } from '../../shared/types/post.types';
import { AppError } from '../../shared/utils/AppError';

// 🛡️ Tipagem de parâmetros da URL para evitar 'undefined'
type PostIdParams = { id: string };
type EmptyBody = Record<string, never>;

const criarPost = tratarAssincrono(async (req: Request<{}, any, PostCreateBody>, res: Response) => {
    const perfilId = req.user.perfil_id; 
    
    // 🔍 DEBUG: Log do payload recebido no backend
    console.log("[DEBUG] Recebendo payload para criação de post/capítulo:", req.body);
    
    const { titulo, conteudo, tags, idioma } = req.body; 

    // Garante integridade referencial removendo duplicatas de tags
    const tagsUnicas = tags ? [...new Set(tags)] : [];

    const novoPost = await postsService.criarPost(perfilId, { 
        titulo, 
        conteudo, 
        idioma,
        tags: tagsUnicas,
        status: req.body.status || 'ANDAMENTO',
        obra_id: req.body.obra_id,
        comunidade_id: req.body.comunidade_id
    }, req.requestId);

    // 🛡️ ENRIQUECIMENTO: Busca perfil atualizado após ganho de XP
    const perfilAtualizado = await perfilService.buscarPerfilCompleto(perfilId, perfilId, req.requestId);

    return res.status(201).json({
        status: 'success',
        message: 'Post publicado com sucesso.',
        data: novoPost,
        perfil_atualizado: perfilAtualizado,
        meta: null
    });
});

const listarPosts = tratarAssincrono(async (req: Request<{}, any, any, PostsQuery>, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const categoriaId = req.query.categoria ? Number(req.query.categoria) : undefined;
    const autorId = req.query.autorId ? Number(req.query.autorId) : undefined;
    const { ordenarPor } = req.query;

    const { posts, meta } = await postsService.listar({ 
        page, 
        limit, 
        categoriaId,
        autorId,
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
    const perfilId = req.user.perfil_id;

    // 🛡️ Validação robusta de tipos numéricos para prevenir SQL Errors
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError.badRequest("ID da publicação inválido.");
    }

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
    const perfilId = req.user.perfil_id;
    const { tipo } = req.body;
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError.badRequest("ID da publicação inválido.");
    }
    
    const postAtualizado = await postsService.votarPost(perfilId, postId, tipo, req.requestId);

    // 🛡️ ENRIQUECIMENTO: Busca perfil atualizado após voto
    const perfilLogado = await perfilService.buscarPerfilCompleto(perfilId, perfilId, req.requestId);

    return res.status(200).json({ 
        status: 'success', 
        message: 'Voto registrado.', 
        data: postAtualizado, 
        perfil_atualizado: perfilLogado,
        meta: null 
    });
});

const comentarPost = tratarAssincrono(async (req: Request<PostIdParams, any, PostCommentBody>, res: Response) => {
    const postId = Number(req.params.id);
    const perfilId = req.user.perfil_id;
    
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError.badRequest("ID da publicação inválido.");
    }
    
    const novoComentario = await comentariosService.criarComentario(perfilId, postId, req.body, req.requestId);

    // 🛡️ ENRIQUECIMENTO: Busca perfil atualizado após comentário
    const perfilLogado = await perfilService.buscarPerfilCompleto(perfilId, perfilId, req.requestId);

    return res.status(201).json({ 
        status: 'success', 
        message: 'Comentário publicado.', 
        data: novoComentario, 
        perfil_atualizado: perfilLogado,
        meta: null 
    });
});

const listarComentarios = tratarAssincrono(async (req: Request<PostIdParams>, res: Response) => {
    const postId = Number(req.params.id);
    if (isNaN(postId)) throw AppError.badRequest("ID inválido.");

    const comentarios = await comentariosService.listarPorPost(postId);

    return res.status(200).json({
        status: 'success',
        data: comentarios
    });
});

const deletarComentario = tratarAssincrono(async (req: Request<PostIdParams>, res: Response) => {
    const comentarioId = Number(req.params.id);
    const perfilId = req.user.perfil_id;
    const isAdmin = req.user.is_admin;

    const result = await comentariosService.deletarComentario(comentarioId, perfilId, isAdmin);

    return res.status(200).json({
        status: 'success',
        ...result
    });
});

const reagirPost = tratarAssincrono(async (req: Request<PostIdParams, any, ReacaoBody>, res: Response) => {
    const postId = Number(req.params.id);
    const perfilId = req.user.perfil_id;
    const { tipo } = req.body;
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError.badRequest("ID da publicação inválido.");
    }
    
    const postAtualizado = await postsService.reagirPost(perfilId, postId, tipo, req.requestId);

    // 🛡️ ENRIQUECIMENTO: Busca perfil atualizado após reação
    const perfilLogado = await perfilService.buscarPerfilCompleto(perfilId, perfilId, req.requestId);

    return res.status(200).json({ 
        status: 'success', 
        message: 'Reação registrada.', 
        data: postAtualizado, 
        perfil_atualizado: perfilLogado,
        meta: null 
    });
});

const getPostById = tratarAssincrono(async (req: Request<PostIdParams>, res: Response) => {
    const postId = Number(req.params.id);
    const perfilId = (req as any).user?.perfil_id; // Opcional

    const post = await postsService.getPostById(postId, perfilId);

    return res.status(200).json({
        status: 'success', 
        message: 'Publicação encontrada.',
        data: post,
        meta: null
    });
});

const pesquisar = tratarAssincrono(async (req: Request, res: Response) => {
    const { termo, tipo, idioma, status } = req.query;

    const resultados = await postsService.pesquisarUnificado({
        termo: termo as string,
        tipo: tipo as any,
        idioma: idioma as string,
        status: status as string
    });

    return res.status(200).json({
        status: 'success',
        message: 'Pesquisa realizada com sucesso.',
        data: resultados,
        meta: {
            total: resultados.length
        }
    });
});

export default { criarPost, listarPosts, deletarPost, votarPost, comentarPost, reagirPost, listarComentarios, deletarComentario, getPostById, pesquisar };
