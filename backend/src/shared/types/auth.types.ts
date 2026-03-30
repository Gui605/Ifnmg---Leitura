import { z } from 'zod';
import { LISTA_CAMPUS } from '../constants/unidades';

/**
 * 🛡️ SCHEMA DE REGISTRO
 * Implementa validações rigorosas de formato e segurança.
 * O .strict() impede a injeção de campos como 'is_admin' ou 'cadastro_confirmado'.
 */
export const RegistrarSchema = z.object({
    nome_user: z.string()
        .min(3, "O nome de usuário deve ter pelo menos 3 caracteres")
        .max(30, "O nome de usuário é muito longo (máximo 30)")
        .regex(/^[a-zA-Z0-9_]+$/, "O nome de usuário pode conter apenas letras, números e underline")
        .trim(),
    email: z.string()
        .email("E-mail inválido")
        .toLowerCase()
        .trim(),
    senha: z.string()
        .min(8, "A senha deve ter pelo menos 8 caracteres")
        .max(100, "A senha é muito longa")
        .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
        .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
        .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
    nome_completo: z.string()
        .min(3, "O nome completo é obrigatório")
        .max(150, "O nome completo é muito longo (máximo 150)")
        .trim(),
    nome_campus: z.enum(LISTA_CAMPUS, {
        error: "Selecione um campus oficial do IFNMG"
    }),
    data_nascimento: z.coerce.date().refine((date) => !isNaN(date.getTime()), {
        message: "Data de nascimento inválida",
    }),
}).strict();

/**
 * 🛡️ SCHEMA DE LOGIN
 */
export const LoginSchema = z.object({
    email: z.string().email("E-mail inválido").trim(),
    senha: z.string().min(1, "A senha é obrigatória")
}).strict();

export const SolicitarRecuperacaoSchema = z.object({
    email: z.string()
        .email("Formato de e-mail inválido")
        .toLowerCase()
        .trim(),
}).strict();

export const RedefinirSenhaSchema = z.object({
    token: z.string()
        .trim()
        .regex(/^[a-f0-9]{64}$/i, "Token de recuperação inválido"),
    novaSenha: z.string()
        .min(8, "A nova senha deve ter no mínimo 8 caracteres")
        .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
        .regex(/[0-9]/, "A senha deve conter ao menos um número"),
}).strict();

/**
 * 💡 INFERÊNCIA DE TIPOS
 */
export type RegistrarData = z.infer<typeof RegistrarSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type SolicitarRecuperacaoBody = z.infer<typeof SolicitarRecuperacaoSchema>;
export type RedefinirSenhaBody = z.infer<typeof RedefinirSenhaSchema>;

/**
 * 🛡️ SCHEMA DE METADADOS JWT (iat, exp)
 */
export const JwtMetaSchema = z.object({
    iat: z.number().optional(),
    exp: z.number().optional()
});

export const TokenPayloadSchema = JwtMetaSchema.extend({
    usuario_id: z.number().int().positive(),
    perfil_id: z.number().int().positive(),
    is_admin: z.boolean(),
    token_version: z.number().int().nonnegative()
}).strict();

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;

/**
 * 💡 TIPO DE USUÁRIO AUTENTICADO (Request User)
 */
export interface AuthUser {
    usuario_id: number;
    perfil_id: number;
    is_admin: boolean;
    token_version: number;
}
