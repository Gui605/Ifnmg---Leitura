"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const posts_service_1 = __importDefault(require("./posts.service"));
const AppError_1 = require("../../shared/utils/AppError");
const criarPost = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const perfilId = req.perfil_id;
    const { titulo, conteudo, categoriasIds } = req.body;
    if (!perfilId) {
        throw AppError_1.AppError.unauthorized('Sessão inválida. Por favor, faça login novamente.');
    }
    // Garante integridade referencial removendo duplicatas
    const categoriasUnicas = [...new Set(categoriasIds)];
    const novoPost = await posts_service_1.default.criarPost(perfilId, {
        titulo,
        conteudo,
        categoriasIds: categoriasUnicas
    }, req.requestId);
    return res.status(201).json({
        status: 'success',
        message: 'Post publicado com sucesso.',
        data: novoPost,
        meta: null
    });
});
const listarPosts = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const perfilId = req.perfil_id;
    const { page, limit, categoria, ordenarPor } = req.query;
    const result = await posts_service_1.default.listarPosts({ page, limit, categoria, ordenarPor }, perfilId, req.requestId);
    return res.status(200).json({
        status: 'success',
        message: 'Publicações recuperadas com sucesso.',
        data: result.data,
        meta: result.meta
    });
});
const deletarPost = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const postId = Number(req.params.id);
    const perfilId = req.perfil_id;
    // 🛡️ Validação robusta de tipos numéricos para prevenir SQL Errors
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError_1.AppError.badRequest("ID da publicação inválido.");
    }
    if (!perfilId)
        throw AppError_1.AppError.unauthorized('Acesso não autorizado.');
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
    const perfilId = req.perfil_id;
    const { tipo } = req.body;
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError_1.AppError.badRequest("ID da publicação inválido.");
    }
    if (!perfilId)
        throw AppError_1.AppError.unauthorized('Acesso não autorizado.');
    const postAtualizado = await posts_service_1.default.votarPost(perfilId, postId, tipo, req.requestId);
    return res.status(200).json({ status: 'success', message: 'Voto registrado.', data: postAtualizado, meta: null });
});
const comentarPost = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const postId = Number(req.params.id);
    const perfilId = req.perfil_id;
    const { texto } = req.body;
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError_1.AppError.badRequest("ID da publicação inválido.");
    }
    if (!perfilId)
        throw AppError_1.AppError.unauthorized('Acesso não autorizado.');
    const postAtualizado = await posts_service_1.default.comentarPost(perfilId, postId, texto, req.requestId);
    return res.status(201).json({ status: 'success', message: 'Comentário publicado.', data: postAtualizado, meta: null });
});
exports.default = { criarPost, listarPosts, deletarPost, votarPost, comentarPost };
