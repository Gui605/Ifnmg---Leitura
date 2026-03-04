import { z } from 'zod';

const SchemaNumerico = z.object({
  denuncia_tipo: z.number().int().positive(),
  descricao: z.string().max(500).optional()
}).strict();

const SchemaMotivo = z.object({
  motivo: z.string().min(3).max(500)
}).strict();

export const DenunciaCreateSchema = z.union([SchemaNumerico, SchemaMotivo]);

export type DenunciaCreateBody = z.infer<typeof DenunciaCreateSchema>;
