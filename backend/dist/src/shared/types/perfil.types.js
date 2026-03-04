"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletarContaSchema = exports.SenhaPatchSchema = exports.UpdatePerfilSchema = void 0;
const zod_1 = require("zod");
/**
 * 🛡️ SCHEMAS DE VALIDAÇÃO (ZOD)
 * O .strict() garante que campos extras (Mass Assignment) disparem erro 400.
 * O .trim() já limpa espaços em branco automaticamente.
 */
// 1. Schema para Atualização de Perfil
exports.UpdatePerfilSchema = zod_1.z.object({
    nome: zod_1.z.string()
        .min(2, "O nome deve ter pelo menos 2 caracteres")
        .max(100, "O nome não pode exceder 100 caracteres")
        .trim()
        .optional(),
    // Exemplo de campo futuro: 
    // bio: z.string().max(255).optional(),
}).strict();
// 2. Schema para Alteração de Senha
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
// 3. Schema para Deleção de Conta
exports.DeletarContaSchema = zod_1.z.object({
    senhaAtual: zod_1.z.string().min(1, "A senha é necessária para confirmar a exclusão"),
}).strict();
