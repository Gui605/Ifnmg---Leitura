"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResponseSchema = exports.AutorDisplaySchema = exports.ReacaoSchema = exports.PostCommentSchema = exports.PostVoteSchema = exports.PostsQuerySchema = exports.PostCreateSchema = void 0;
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
    tags: zod_1.z.array(zod_1.z.string().min(1).max(30))
        .min(0, "O post pode não ter tags se for capítulo de obra")
        .max(5, "Um post pode ter no máximo 5 tags")
        .default([]),
    status: zod_1.z.enum(["ANDAMENTO", "CONCLUIDO"]).default("ANDAMENTO"),
    obra_id: zod_1.z.number().int().positive().nullable().optional(),
    comunidade_id: zod_1.z.number().int().positive().nullable().optional()
}).strict();
/**
 * 🛡️ SCHEMA DE FILTRAGEM E PAGINAÇÃO
 * Valida os parâmetros de URL (Query Strings).
 */
exports.PostsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(50).default(10),
    categoria: zod_1.z.coerce.number().optional(),
    autorId: zod_1.z.coerce.number().optional(),
    ordenarPor: zod_1.z.enum(['score', 'data']).optional()
});
exports.PostVoteSchema = zod_1.z.object({
    tipo: zod_1.z.enum(['UP', 'DOWN'])
}).strict();
exports.PostCommentSchema = zod_1.z.object({
    texto: zod_1.z.string().min(1, "O comentário não pode estar vazio").max(1000, "O comentário é muito longo"),
    parent_id: zod_1.z.number().int().positive().nullable().optional(),
    is_spoiler: zod_1.z.boolean().default(false)
}).strict();
/**
 * 🛡️ SCHEMA DE REAÇÃO
 */
exports.ReacaoSchema = zod_1.z.object({
    tipo: zod_1.z.enum(['LIKE', 'LOVE', 'FIRE', 'SAD'])
}).strict();
/**
 * 🛡️ SCHEMA DE RESPOSTA DE POST (Refletindo SetNull)
 */
exports.AutorDisplaySchema = zod_1.z.object({
    nome: zod_1.z.string(),
    campus: zod_1.z.string(),
    deletado: zod_1.z.boolean()
});
exports.PostResponseSchema = zod_1.z.object({
    post_id: zod_1.z.number(),
    titulo: zod_1.z.string(),
    conteudo: zod_1.z.string(),
    autor_id: zod_1.z.number().nullable(),
    autor_display: exports.AutorDisplaySchema,
    data_criacao: zod_1.z.date(),
    status: zod_1.z.enum(["ANDAMENTO", "CONCLUIDO"]),
    total_upvotes: zod_1.z.number(),
    total_downvotes: zod_1.z.number(),
    total_comentarios: zod_1.z.number(),
    obra_id: zod_1.z.number().nullable(),
    ordem: zod_1.z.number().nullable().optional(),
    comunidade_id: zod_1.z.number().nullable(),
    // Relações opcionais
    autor: zod_1.z.object({
        nome_user: zod_1.z.string()
    }).nullable().optional(),
    obra: zod_1.z.object({
        titulo: zod_1.z.string()
    }).nullable().optional()
});
