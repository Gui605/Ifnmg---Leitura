"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const posts_service_1 = __importDefault(require("./posts.service"));
const comentarios_service_1 = __importDefault(require("./comentarios.service"));
const perfil_service_1 = __importDefault(require("../perfil/perfil.service"));
const AppError_1 = require("../../shared/utils/AppError");
const criarPost = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const perfilId = req.user.perfil_id;
    // 🔍 DEBUG: Log do payload recebido no backend
    console.log("[DEBUG] Recebendo payload para criação de post/capítulo:", req.body);
    const { titulo, conteudo, tags } = req.body;
    // Garante integridade referencial removendo duplicatas de tags
    const tagsUnicas = tags ? [...new Set(tags)] : [];
    const novoPost = await posts_service_1.default.criarPost(perfilId, {
        titulo,
        conteudo,
        tags: tagsUnicas,
        status: req.body.status || 'ANDAMENTO',
        obra_id: req.body.obra_id,
        comunidade_id: req.body.comunidade_id
    }, req.requestId);
    // 🛡️ ENRIQUECIMENTO: Busca perfil atualizado após ganho de XP
    const perfilAtualizado = await perfil_service_1.default.buscarPerfilCompleto(perfilId, perfilId, req.requestId);
    return res.status(201).json({
        status: 'success',
        message: 'Post publicado com sucesso.',
        data: novoPost,
        perfil_atualizado: perfilAtualizado,
        meta: null
    });
});
const listarPosts = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const categoriaId = req.query.categoria ? Number(req.query.categoria) : undefined;
    const autorId = req.query.autorId ? Number(req.query.autorId) : undefined;
    const { ordenarPor } = req.query;
    const { posts, meta } = await posts_service_1.default.listar({
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
const deletarPost = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const postId = Number(req.params.id);
    const perfilId = req.user.perfil_id;
    // 🛡️ Validação robusta de tipos numéricos para prevenir SQL Errors
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError_1.AppError.badRequest("ID da publicação inválido.");
    }
    await posts_service_1.default.deletarPost(postId, perfilId, req.requestId);
    return res.status(200).json({
        status: 'success',
        message: 'Post excluído com sucesso.',
        data: null,
        meta: null
    });
});
const votarPost = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const postId = Number(req.params.id);
    const perfilId = req.user.perfil_id;
    const { tipo } = req.body;
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError_1.AppError.badRequest("ID da publicação inválido.");
    }
    const postAtualizado = await posts_service_1.default.votarPost(perfilId, postId, tipo, req.requestId);
    // 🛡️ ENRIQUECIMENTO: Busca perfil atualizado após voto
    const perfilLogado = await perfil_service_1.default.buscarPerfilCompleto(perfilId, perfilId, req.requestId);
    return res.status(200).json({
        status: 'success',
        message: 'Voto registrado.',
        data: postAtualizado,
        perfil_atualizado: perfilLogado,
        meta: null
    });
});
const comentarPost = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const postId = Number(req.params.id);
    const perfilId = req.user.perfil_id;
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError_1.AppError.badRequest("ID da publicação inválido.");
    }
    const novoComentario = await comentarios_service_1.default.criarComentario(perfilId, postId, req.body, req.requestId);
    // 🛡️ ENRIQUECIMENTO: Busca perfil atualizado após comentário
    const perfilLogado = await perfil_service_1.default.buscarPerfilCompleto(perfilId, perfilId, req.requestId);
    return res.status(201).json({
        status: 'success',
        message: 'Comentário publicado.',
        data: novoComentario,
        perfil_atualizado: perfilLogado,
        meta: null
    });
});
const listarComentarios = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const postId = Number(req.params.id);
    if (isNaN(postId))
        throw AppError_1.AppError.badRequest("ID inválido.");
    const comentarios = await comentarios_service_1.default.listarPorPost(postId);
    return res.status(200).json({
        status: 'success',
        data: comentarios
    });
});
const deletarComentario = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const comentarioId = Number(req.params.id);
    const perfilId = req.user.perfil_id;
    const isAdmin = req.user.is_admin;
    const result = await comentarios_service_1.default.deletarComentario(comentarioId, perfilId, isAdmin);
    return res.status(200).json({
        status: 'success',
        ...result
    });
});
const reagirPost = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const postId = Number(req.params.id);
    const perfilId = req.user.perfil_id;
    const { tipo } = req.body;
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError_1.AppError.badRequest("ID da publicação inválido.");
    }
    const postAtualizado = await posts_service_1.default.reagirPost(perfilId, postId, tipo, req.requestId);
    // 🛡️ ENRIQUECIMENTO: Busca perfil atualizado após reação
    const perfilLogado = await perfil_service_1.default.buscarPerfilCompleto(perfilId, perfilId, req.requestId);
    return res.status(200).json({
        status: 'success',
        message: 'Reação registrada.',
        data: postAtualizado,
        perfil_atualizado: perfilLogado,
        meta: null
    });
});
const getPostById = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const postId = Number(req.params.id);
    const perfilId = req.user?.perfil_id; // Opcional
    const post = await posts_service_1.default.getPostById(postId, perfilId);
    return res.status(200).json({
        status: 'success',
        message: 'Publicação encontrada.',
        data: post,
        meta: null
    });
});
exports.default = { criarPost, listarPosts, deletarPost, votarPost, comentarPost, reagirPost, listarComentarios, deletarComentario, getPostById };
