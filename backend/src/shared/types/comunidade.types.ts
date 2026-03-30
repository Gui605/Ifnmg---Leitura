import { z } from 'zod';

/**
 * 🛡️ SCHEMA DE CRIAÇÃO DE COMUNIDADE
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

/**
 * 🛡️ SCHEMA DE CONFIGURAÇÃO DE COMUNIDADE
 */
export const ComunidadeConfigSchema = z.object({
    privada: z.boolean().default(false),
    somente_admin_post: z.boolean().default(false)
}).strict();

export type ComunidadeConfigBody = z.infer<typeof ComunidadeConfigSchema>;

/**
 * 🛡️ ENUMS DE MEMBROS
 */
export const ComunidadeRoleEnum = z.enum(['MEMBRO', 'MODERADOR', 'ADMIN', 'DONO']);
export type ComunidadeRole = z.infer<typeof ComunidadeRoleEnum>;

/**
 * 🛡️ SCHEMA DE MEMBRO
 */
export const ComunidadeMembroSchema = z.object({
    perfil_id: z.number().int().positive(),
    role: ComunidadeRoleEnum.default('MEMBRO')
}).strict();

export type ComunidadeMembro = z.infer<typeof ComunidadeMembroSchema>;
