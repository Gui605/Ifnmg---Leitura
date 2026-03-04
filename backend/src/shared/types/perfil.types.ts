import { z } from 'zod';

/**
 * 🛡️ SCHEMAS DE VALIDAÇÃO (ZOD)
 * O .strict() garante que campos extras (Mass Assignment) disparem erro 400.
 * O .trim() já limpa espaços em branco automaticamente.
 */

// 1. Schema para Atualização de Perfil
export const UpdatePerfilSchema = z.object({
    nome: z.string()
        .min(2, "O nome deve ter pelo menos 2 caracteres")
        .max(100, "O nome não pode exceder 100 caracteres")
        .trim()
        .optional(),
    // Exemplo de campo futuro: 
    // bio: z.string().max(255).optional(),
}).strict();

// 2. Schema para Alteração de Senha
export const SenhaPatchSchema = z.object({
    senhaAntiga: z.string().min(1, "A senha antiga é obrigatória"),
    novaSenha: z.string()
        .min(8, "A nova senha deve ter no menos 8 caracteres")
        .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
        .regex(/[0-9]/, "A senha deve conter ao menos um número"),
    confirmarNovaSenha: z.string().min(1, "A confirmação de senha é obrigatória"),
}).strict().refine((data) => data.novaSenha === data.confirmarNovaSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarNovaSenha"],
});

// 3. Schema para Deleção de Conta
export const DeletarContaSchema = z.object({
    senhaAtual: z.string().min(1, "A senha é necessária para confirmar a exclusão"),
}).strict();

/**
 * 💡 INFERÊNCIA DE TIPOS
 * O TypeScript extrai automaticamente as interfaces dos schemas acima.
 * Não é mais necessário escrever "export interface ..." manualmente!
 */
export type PerfilPatchBody = z.infer<typeof UpdatePerfilSchema>;
export type SenhaPatchBody = z.infer<typeof SenhaPatchSchema>;
export type DeletarContaBody = z.infer<typeof DeletarContaSchema>;