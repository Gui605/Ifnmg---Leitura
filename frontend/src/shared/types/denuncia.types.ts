import { z } from 'zod';

export const DenunciaCreateSchema = z.object({
  denuncia_tipo: z.number().int().positive(),
  descricao: z.string().max(500).optional()
}).strict();

export type DenunciaCreateBody = z.infer<typeof DenunciaCreateSchema>;
