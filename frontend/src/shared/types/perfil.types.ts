import { z } from 'zod';

export const TituloSchema = z.object({
  titulo_id: z.number(),
  nome: z.string(),
  descricao: z.string().optional().nullable(),
  categoria: z.string(),
  requisito: z.number().optional(),
});

export const PerfilTituloSchema = z.object({
  atribuido_em: z.string(), 
  esta_ativo: z.boolean(),
  titulo: TituloSchema,
});

export const EstatisticasSchema = z.object({
  pergaminhos: z.number(),
  curtidas: z.number(),
  seguidores: z.number(),
  seguindo: z.number(),
});

export const PerfilResumoSchema = z.object({
  perfil_id: z.number().optional(),
  nome_user: z.string(),
  bio: z.string().optional().nullable(),
  nome_campus: z.string().optional().nullable(),
  score_karma: z.number(),
  reading_points: z.number(),
  
  level: z.number().default(1),
  xp: z.number().default(0),
  xp_escrita: z.number().default(0),
  xp_social: z.number().default(0),
  xp_curadoria: z.number().default(0),
  titulo_ativo: z.string().optional().nullable(),
  
  is_admin: z.boolean().optional(),
  is_following: z.boolean().optional(),
  estatisticas: EstatisticasSchema.optional(),
  titulos: z.array(PerfilTituloSchema).optional(),
});

export type PerfilResumo = z.infer<typeof PerfilResumoSchema>;
export type Titulo = z.infer<typeof TituloSchema>;
export type PerfilTitulo = z.infer<typeof PerfilTituloSchema>;
export type Estatisticas = z.infer<typeof EstatisticasSchema>;
