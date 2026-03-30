import { z } from 'zod';

export const AutorDisplaySchema = z.object({
  nome: z.string(),
  campus: z.string(),
  deletado: z.boolean().default(false)
});

export type AutorDisplay = z.infer<typeof AutorDisplaySchema>;

export const PostResumoSchema = z.object({
  post_id: z.number().int(),
  titulo: z.string(),
  conteudo: z.string(),
  autor_id: z.number().int().nullable(),
  autor_display: AutorDisplaySchema.optional(),
  data_criacao: z.string().or(z.date()).optional(),
  
  status: z.enum(["ANDAMENTO", "CONCLUIDO"]).optional(),
  obra_id: z.number().int().positive().nullable().optional(),
  comunidade_id: z.number().int().positive().nullable().optional(),
  ordem: z.number().int().positive().nullable().optional(),
  obra: z.object({
    titulo: z.string()
  }).nullable().optional(),

  tags: z.array(z.string()).optional(),
  total_upvotes: z.number().int().default(0),
  total_downvotes: z.number().int().default(0),
  total_comentarios: z.number().int().default(0),
});

export type PostResumo = z.infer<typeof PostResumoSchema>;

export const TrabalhoResumoSchema = PostResumoSchema.extend({
  idioma: z.string().optional(),
  status_trabalho: z.enum(['Em Andamento', 'Concluído', 'Revisado']).optional(),
  numero_citacoes: z.number().int().default(0),
  visualizacoes: z.number().int().default(0),
  curso: z.string().optional(),
});

export type TrabalhoResumo = z.infer<typeof TrabalhoResumoSchema>;

export const PostCreateBodySchema = z.object({
  titulo: z.string().min(5).max(150),
  conteudo: z.string().min(10).max(10000),
  tags: z.array(z.string()).min(0).max(5),
  obra_id: z.number().int().positive().nullable().optional(),
  comunidade_id: z.number().int().positive().nullable().optional()
});

export type PostCreateBody = z.infer<typeof PostCreateBodySchema>;

export const PostResponseSchema = PostResumoSchema.extend({
  navegacao: z.object({
    anterior_id: z.number().nullable(),
    proximo_id: z.number().nullable()
  }).optional(),
  reacoes_count: z.record(z.string(), z.number()).optional(),
  minha_reacao: z.string().nullable().optional(),
  comentarios: z.array(z.any()).optional()
});

export type PostResponse = z.infer<typeof PostResponseSchema>;

export interface FiltrosBusca {
  query?: string;
  curso?: string;
  idioma?: string;
  status?: string;
  tags?: string[];
  ordenar_por?: 'recentes' | 'populares' | 'citacoes';
  page?: number;
}
