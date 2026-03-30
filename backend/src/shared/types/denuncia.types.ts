import { z } from 'zod';

export const DenunciaCreateSchema = z.object({
  denuncia_tipo: z.number().int().positive(),
  descricao: z.string().max(500).optional(),
  conteudo_snapshot: z.string().min(1, "O snapshot do conteúdo é obrigatório")
}).strict();

export type DenunciaCreateBody = z.infer<typeof DenunciaCreateSchema>;

/**
 * 🛡️ SCHEMA DE RESPOSTA (Refletindo SetNull)
 */
export const DenunciaResponseSchema = z.object({
    denuncia_id: z.number(),
    post_id: z.number().nullable(),
    perfil_id: z.number().nullable(),
    denuncia_tipo: z.number(),
    descricao: z.string().nullable(),
    conteudo_snapshot: z.string(),
    data_criacao: z.date()
});
