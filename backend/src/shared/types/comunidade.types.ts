import { z } from 'zod';

/*
Schema de Criação de Comunidade
 */
export const ComunidadeCreateSchema = z.object({
    nome: z.string()
        .min(3, "O nome deve ter pelo menos 3 caracteres")
        .max(100, "O nome é muito longo (máximo 100)")
        .trim(),
    descricao: z.string()
        .max(255, "A descrição é muito longa (máximo 255)")
        .optional()
}).strict();

export type ComunidadeCreateBody = z.infer<typeof ComunidadeCreateSchema>;

/*
Schema de Configuração de Comunidade
 */
export const ComunidadeConfigSchema = z.object({
    privada: z.boolean().default(false),
    somente_admin_post: z.boolean().default(false)
}).strict();

export type ComunidadeConfigBody = z.infer<typeof ComunidadeConfigSchema>;

/*
Enum de Membros de Comunidade
 */
export const ComunidadeRoleEnum = z.enum(['MEMBRO', 'MODERADOR', 'ADMIN', 'DONO']);
export type ComunidadeRole = z.infer<typeof ComunidadeRoleEnum>;

/*
Schema de Membro de Comunidade  
 */
export const ComunidadeMembroSchema = z.object({
    perfil_id: z.number().int().positive(),
    role: ComunidadeRoleEnum.default('MEMBRO')
}).strict();

export type ComunidadeMembro = z.infer<typeof ComunidadeMembroSchema>;
