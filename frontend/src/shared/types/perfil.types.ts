import { z } from 'zod';

export const PerfilResumoSchema = z.object({
  nome_user: z.string(),
  score_karma: z.number(),
  reading_points: z.number(),
  is_admin: z.boolean().optional(),
});

export type PerfilResumo = z.infer<typeof PerfilResumoSchema>;
