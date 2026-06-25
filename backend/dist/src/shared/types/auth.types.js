"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenPayloadSchema = exports.JwtMetaSchema = exports.RedefinirSenhaSchema = exports.SolicitarRecuperacaoSchema = exports.LoginSchema = exports.RegistrarSchema = void 0;
const zod_1 = require("zod");
const unidades_1 = require("./unidades");
/**
 Schema de Registro de Usuário
 */
exports.RegistrarSchema = zod_1.z.object({
    nome_user: zod_1.z.string()
        .min(3, "O nome de usuário deve ter pelo menos 3 caracteres")
        .max(30, "O nome de usuário é muito longo (máximo 30)")
        .regex(/^[a-zA-Z0-9_]+$/, "O nome de usuário pode conter apenas letras, números e underline")
        .trim(),
    email: zod_1.z.string()
        .email("E-mail inválido")
        .toLowerCase()
        .trim(),
    senha: zod_1.z.string()
        .min(8, "A senha deve ter pelo menos 8 caracteres")
        .max(100, "A senha é muito longa")
        .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
        .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
        .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
    nome_completo: zod_1.z.string()
        .min(3, "O nome completo é obrigatório")
        .max(150, "O nome completo é muito longo (máximo 150)")
        .trim(),
    nome_campus: zod_1.z.enum(unidades_1.LISTA_CAMPUS, {
        error: "Selecione um campus oficial do IFNMG"
    }),
    data_nascimento: zod_1.z.coerce.date().refine((date) => !isNaN(date.getTime()), {
        message: "Data de nascimento inválida",
    }),
}).strict();
/**
 Schema de Login de Usuário
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
/*
 Schema de Metadados de JWT (iat, exp)
 */
exports.JwtMetaSchema = zod_1.z.object({
    iat: zod_1.z.number().optional(),
    exp: zod_1.z.number().optional()
});
exports.TokenPayloadSchema = exports.JwtMetaSchema.extend({
    usuario_id: zod_1.z.number().int().positive(),
    perfil_id: zod_1.z.number().int().positive(),
    is_admin: zod_1.z.boolean(),
    token_version: zod_1.z.number().int().nonnegative()
}).strict();
