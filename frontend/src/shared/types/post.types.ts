import { z } from 'zod';

export const PostResumoSchema = z.object({
  post_id: z.number().int(),
  titulo: z.string(),
  conteudo: z.string(),
  autor_id: z.number().int(),
  autor_nome_user: z.string().optional(),
  nome_campus: z.string().optional(),
  data_criacao: z.string().or(z.date()).optional(),
  
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

export interface FiltrosBusca {
  query?: string;
  curso?: string;
  idioma?: string;
  status?: string;
  tags?: string[];
  ordenar_por?: 'recentes' | 'populares' | 'citacoes';
  page?: number;
}
