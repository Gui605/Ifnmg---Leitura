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
