"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostCommentSchema = exports.PostVoteSchema = exports.PostsQuerySchema = exports.PostCreateSchema = void 0;
const zod_1 = require("zod");
// backend/src/shared/types/post.types.ts
/**
 * 🛡️ SCHEMA DE CRIAÇÃO DE POST
 * O .strict() impede que o usuário envie autor_id, data_criacao ou posts_id.
 */
exports.PostCreateSchema = zod_1.z.object({
    titulo: zod_1.z.string()
        .min(5, "O título deve ter pelo menos 5 caracteres")
        .max(150, "O título é muito longo (máximo 150)")
        .trim(),
    conteudo: zod_1.z.string()
        .min(10, "O conteúdo deve ter pelo menos 10 caracteres")
        .max(10000, "O post excedeu o limite de 10.000 caracteres"),
    categoriasIds: zod_1.z.array(zod_1.z.number().positive())
        .min(1, "O post deve pertencer a pelo menos uma categoria")
        .max(5, "Um post pode ter no máximo 5 categorias")
}).strict();
/**
 * 🛡️ SCHEMA DE FILTRAGEM E PAGINAÇÃO
 * Valida os parâmetros de URL (Query Strings).
 */
exports.PostsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(50).default(10),
    categoria: zod_1.z.coerce.number().optional(),
    ordenarPor: zod_1.z.enum(['score', 'data']).optional()
});
exports.PostVoteSchema = zod_1.z.object({
    tipo: zod_1.z.enum(['UP', 'DOWN'])
}).strict();
exports.PostCommentSchema = zod_1.z.object({
    texto: zod_1.z.string().min(1).max(1000)
}).strict();
