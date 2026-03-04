"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenPayloadSchema = exports.RedefinirSenhaSchema = exports.SolicitarRecuperacaoSchema = exports.LoginSchema = exports.RegistrarSchema = void 0;
const zod_1 = require("zod");
/**
 * 🛡️ SCHEMA DE REGISTRO
 * Implementa validações rigorosas de formato e segurança.
 * O .strict() impede a injeção de campos como 'is_admin' ou 'cadastro_confirmado'.
 */
exports.RegistrarSchema = zod_1.z.object({
    nome_completo: zod_1.z.string()
        .min(2, "O nome completo deve ter pelo menos 2 caracteres")
        .max(150, "O nome completo não pode exceder 150 caracteres")
        .trim(),
    nome_user: zod_1.z.string()
        .min(2, "O apelido deve ter pelo menos 2 caracteres")
        .max(100, "O apelido não pode exceder 100 caracteres")
        .trim(),
    nome_campus: zod_1.z.string()
        .min(2, "O nome do campus deve ter pelo menos 2 caracteres")
        .max(100, "O nome do campus não pode exceder 100 caracteres")
        .trim(),
    data_nascimento: zod_1.z.coerce.date().refine((date) => !isNaN(date.getTime()), {
        message: "Data de nascimento inválida",
    }),
    email: zod_1.z.string()
        .email("Formato de e-mail inválido")
        .toLowerCase()
        .trim(),
    senha: zod_1.z.string()
        .min(8, "A senha deve ter no mínimo 8 caracteres")
        .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
        .regex(/[0-9]/, "A senha deve conter ao menos um número")
}).strict();
/**
 * 🛡️ SCHEMA DE LOGIN
 */
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("E-mail inválido").trim(),
    senha: zod_1.z.string().min(1, "A senha é obrigatória")
}).strict();
exports.SolicitarRecuperacaoSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email("Formato de e-mail inválido")
        .toLowerCase()
        .trim(),
}).strict();
exports.RedefinirSenhaSchema = zod_1.z.object({
    token: zod_1.z.string()
        .trim()
        .regex(/^[a-f0-9]{64}$/i, "Token de recuperação inválido"),
    novaSenha: zod_1.z.string()
        .min(8, "A nova senha deve ter no mínimo 8 caracteres")
        .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
        .regex(/[0-9]/, "A senha deve conter ao menos um número"),
}).strict();
const JwtMetaSchema = zod_1.z.object({
    iat: zod_1.z.number().optional(),
    exp: zod_1.z.number().optional()
});
exports.TokenPayloadSchema = JwtMetaSchema.and(zod_1.z.object({
    usuario_id: zod_1.z.number().int().positive(),
    perfil_id: zod_1.z.number().int().positive(),
    email: zod_1.z.string().email().optional(),
    is_admin: zod_1.z.boolean(),
    token_version: zod_1.z.number().int().nonnegative()
}));
