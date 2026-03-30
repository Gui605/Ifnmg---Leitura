import { z } from 'zod';

// backend/src/shared/types/post.types.ts

/**
 * 🛡️ SCHEMA DE CRIAÇÃO DE POST
 * O .strict() impede que o usuário envie autor_id, data_criacao ou posts_id.
 */
export const PostCreateSchema = z.object({
    titulo: z.string()
        .min(5, "O título deve ter pelo menos 5 caracteres")
        .max(150, "O título é muito longo (máximo 150)")
        .trim(),
    conteudo: z.string()
        .min(10, "O conteúdo deve ter pelo menos 10 caracteres")
        .max(10000, "O post excedeu o limite de 10.000 caracteres"),
    tags: z.array(z.string().min(1).max(30))
        .min(0, "O post pode não ter tags se for capítulo de obra")
        .max(5, "Um post pode ter no máximo 5 tags")
        .default([]),
    status: z.enum(["ANDAMENTO", "CONCLUIDO"]).default("ANDAMENTO"),
    obra_id: z.number().int().positive().nullable().optional(),
    comunidade_id: z.number().int().positive().nullable().optional()
}).strict();

/**
 * 🛡️ SCHEMA DE FILTRAGEM E PAGINAÇÃO
 * Valida os parâmetros de URL (Query Strings).
 */
export const PostsQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
    categoria: z.coerce.number().optional(),
    autorId: z.coerce.number().optional(),
    ordenarPor: z.enum(['score','data']).optional()
});

/**
 * 💡 INFERÊNCIA DE TIPOS AUTOMÁTICA
 */
export type PostCreateBody = z.infer<typeof PostCreateSchema>;
export type PostsQuery = z.infer<typeof PostsQuerySchema>;

export const PostVoteSchema = z.object({
    tipo: z.enum(['UP','DOWN'])
}).strict();

export type PostVoteBody = z.infer<typeof PostVoteSchema>;

export const PostCommentSchema = z.object({
    texto: z.string().min(1, "O comentário não pode estar vazio").max(1000, "O comentário é muito longo"),
    parent_id: z.number().int().positive().nullable().optional(),
    is_spoiler: z.boolean().default(false)
}).strict();

export type PostCommentBody = z.infer<typeof PostCommentSchema>;

/**
 * 🛡️ SCHEMA DE REAÇÃO
 */
export const ReacaoSchema = z.object({
    tipo: z.enum(['LIKE', 'LOVE', 'FIRE', 'SAD'])
}).strict();

export type ReacaoBody = z.infer<typeof ReacaoSchema>;

/**
 * 🛡️ SCHEMA DE RESPOSTA DE POST (Refletindo SetNull)
 */
export const AutorDisplaySchema = z.object({
    nome: z.string(),
    campus: z.string(),
    deletado: z.boolean()
});

export type AutorDisplay = z.infer<typeof AutorDisplaySchema>;

export const PostResponseSchema = z.object({
    post_id: z.number(),
    titulo: z.string(),
    conteudo: z.string(),
    autor_id: z.number().nullable(),
    autor_display: AutorDisplaySchema,
    data_criacao: z.date(),
    status: z.enum(["ANDAMENTO", "CONCLUIDO"]),
    total_upvotes: z.number(),
    total_downvotes: z.number(),
    total_comentarios: z.number(),
    obra_id: z.number().nullable(),
    ordem: z.number().nullable().optional(),
    comunidade_id: z.number().nullable(),
    // Relações opcionais
    autor: z.object({
        nome_user: z.string()
    }).nullable().optional(),
    obra: z.object({
        titulo: z.string()
    }).nullable().optional()
});

export type PostResponse = z.infer<typeof PostResponseSchema>;
