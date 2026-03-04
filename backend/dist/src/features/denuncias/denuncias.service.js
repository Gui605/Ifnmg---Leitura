"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("../../shared/prisma/prisma.client"));
const AppError_1 = require("../../shared/utils/AppError");
const logService_1 = require("../../shared/utils/logService");
async function registrarDenuncia(perfilId, postId, data, requestId) {
    const result = await prisma_client_1.default.$transaction(async (tx) => {
        const dup = await tx.denuncias.findFirst({
            where: { perfil_id: perfilId, post_id: postId, status: 'PENDENTE' }
        });
        if (dup) {
            throw AppError_1.AppError.badRequest('Você já registrou uma denúncia para este post.');
        }
        const post = await tx.posts.findUnique({
            where: { post_id: postId },
            select: { post_id: true, titulo: true, conteudo: true, autor_id: true, total_upvotes: true, total_downvotes: true, total_comentarios: true }
        });
        if (!post)
            throw AppError_1.AppError.notFound('Publicação não encontrada.');
        const snapshot = JSON.stringify({
            post_id: post.post_id,
            titulo: post.titulo,
            conteudo: post.conteudo,
            autor_id: post.autor_id,
            total_upvotes: post.total_upvotes,
            total_downvotes: post.total_downvotes,
            total_comentarios: post.total_comentarios
        });
        const created = await tx.denuncias.create({
            data: {
                denuncia_tipo: data.denuncia_tipo,
                descricao: data.descricao ?? null,
                conteudo_snapshot: snapshot,
                post_id: postId,
                perfil_id: perfilId
            }
        });
        return created;
    });
    await (0, logService_1.registrar)(perfilId, 'REPORT_CREATED', { denuncia_id: result.denuncia_id, post_id: postId }, requestId);
    return result;
}
exports.default = { registrarDenuncia };
