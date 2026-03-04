import { z } from 'zod';

/**
 * 🛡️ SCHEMA DE REGISTRO
 * Implementa validações rigorosas de formato e segurança.
 * O .strict() impede a injeção de campos como 'is_admin' ou 'cadastro_confirmado'.
 */
export const RegistrarSchema = z.object({
    nome_completo: z.string()
        .min(2, "O nome completo deve ter pelo menos 2 caracteres")
        .max(150, "O nome completo não pode exceder 150 caracteres")
        .trim(),
    nome_user: z.string()
        .min(2, "O apelido deve ter pelo menos 2 caracteres")
        .max(100, "O apelido não pode exceder 100 caracteres")
        .trim(),
    nome_campus: z.string()
        .min(2, "O nome do campus deve ter pelo menos 2 caracteres")
        .max(100, "O nome do campus não pode exceder 100 caracteres")
        .trim(),
    data_nascimento: z.coerce.date().refine((date) => !isNaN(date.getTime()), {
    message: "Data de nascimento inválida",
    }),
    email: z.string()
        .email("Formato de e-mail inválido")
        .toLowerCase()
        .trim(),
    senha: z.string()
        .min(8, "A senha deve ter no mínimo 8 caracteres")
        .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
        .regex(/[0-9]/, "A senha deve conter ao menos um número")
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

const JwtMetaSchema = z.object({
    iat: z.number().optional(),
    exp: z.number().optional()
});

export const TokenPayloadSchema = JwtMetaSchema.and(z.object({
    usuario_id: z.number().int().positive(),
    perfil_id: z.number().int().positive(),
    email: z.string().email().optional(),
    is_admin: z.boolean(),
    token_version: z.number().int().nonnegative()
}));

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;