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
    categoriasIds: z.array(z.number().positive())
        .min(1, "O post deve pertencer a pelo menos uma categoria")
        .max(5, "Um post pode ter no máximo 5 categorias")
}).strict();

/**
 * 🛡️ SCHEMA DE FILTRAGEM E PAGINAÇÃO
 * Valida os parâmetros de URL (Query Strings).
 */
export const PostsQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
    categoria: z.coerce.number().optional(),
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
    texto: z.string().min(1).max(1000)
}).strict();

export type PostCommentBody = z.infer<typeof PostCommentSchema>;
