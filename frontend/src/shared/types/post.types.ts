import { z } from 'zod';

export const PostResumoSchema = z.object({
  post_id: z.number().int(),
  titulo: z.string(),
  conteudo: z.string(),
  autor_id: z.number().int(),
  autor_nome_user: z.string().optional(),
});

export type PostResumo = z.infer<typeof PostResumoSchema>;
