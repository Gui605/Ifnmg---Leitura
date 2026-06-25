"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletarContaSchema = exports.SenhaPatchSchema = exports.PerfilPatchSchema = exports.PatenteSchema = exports.PerfilTitulosSchema = exports.TituloResumoSchema = void 0;
const zod_1 = require("zod");
//Schema de validação de perfil
exports.TituloResumoSchema = zod_1.z.object({
    titulo_id: zod_1.z.number(),
    nome: zod_1.z.string(),
    descricao: zod_1.z.string().nullable(),
    categoria: zod_1.z.string(),
});
exports.PerfilTitulosSchema = zod_1.z.object({
    atribuido_em: zod_1.z.date(),
    esta_ativo: zod_1.z.boolean(),
    titulo: exports.TituloResumoSchema,
});
exports.PatenteSchema = zod_1.z.object({
    nivel: zod_1.z.number(),
    nome: zod_1.z.string(),
});
// Schema para Atualização de Perfil
exports.PerfilPatchSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3).max(50).optional(),
    bio: zod_1.z.string().max(255).optional(),
    titulo_ativo_id: zod_1.z.number().positive().optional(),
}).strict();
// Schema para Alteração de Senha
exports.SenhaPatchSchema = zod_1.z.object({
    senhaAntiga: zod_1.z.string().min(1, "A senha antiga é obrigatória"),
    novaSenha: zod_1.z.string()
        .min(8, "A nova senha deve ter no menos 8 caracteres")
        .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
        .regex(/[0-9]/, "A senha deve conter ao menos um número"),
    confirmarNovaSenha: zod_1.z.string().min(1, "A confirmação de senha é obrigatória"),
}).strict().refine((data) => data.novaSenha === data.confirmarNovaSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarNovaSenha"],
});
// Schema para Deleção de Conta
exports.DeletarContaSchema = zod_1.z.object({
    senhaAtual: zod_1.z.string().min(1, "A senha é necessária para confirmar a exclusão"),
}).strict();
