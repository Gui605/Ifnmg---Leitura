//backend/src/shared/types/denuncia.types.ts
import { z } from 'zod';

export const DenunciaCreateSchema = z.object({
  denuncia_tipo: z.number().int().positive(),
  descricao: z.string().max(500).optional(),
  conteudo_snapshot: z.any()
}).strict();

export type DenunciaCreateBody = z.infer<typeof DenunciaCreateSchema>;

/*
Schema de Resposta
  */
export const DenunciaResponseSchema = z.object({
    denuncia_id: z.number(),
    post_id: z.number().nullable(),
    perfil_id: z.number().nullable(),
    denuncia_tipo: z.number(),
    descricao: z.string().nullable(),
    conteudo_snapshot: z.any(),
    data_criacao: z.date()
});
