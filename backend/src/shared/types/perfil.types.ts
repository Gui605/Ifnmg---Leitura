import { z } from 'zod';

/**
 * 🛡️ SCHEMAS DE VALIDAÇÃO (ZOD)
 * O .strict() garante que campos extras (Mass Assignment) disparem erro 400.
 * O .trim() já limpa espaços em branco automaticamente.
 */

// 1. Schemas de Perfil
export const TituloResumoSchema = z.object({
  titulo_id: z.number(),
  nome: z.string(),
  descricao: z.string().nullable(),
  categoria: z.string(),
});

export const PerfilTitulosSchema = z.object({
  atribuido_em: z.date(),
  esta_ativo: z.boolean(),
  titulo: TituloResumoSchema,
});

export const PatenteSchema = z.object({
  nivel: z.number(),
  nome: z.string(),
});

// 2. Schema para Atualização de Perfil
export const PerfilPatchSchema = z.object({
    nome: z.string().min(3).max(50).optional(),
    bio: z.string().max(255).optional(),
    titulo_ativo_id: z.number().positive().optional(),
}).strict();

// 3. Schema para Alteração de Senha
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

// 4. Schema para Deleção de Conta
export const DeletarContaSchema = z.object({
    senhaAtual: z.string().min(1, "A senha é necessária para confirmar a exclusão"),
}).strict();

/**
 * 💡 INFERÊNCIA DE TIPOS
 * O TypeScript extrai automaticamente as interfaces dos schemas acima.
 * Não é mais necessário escrever "export interface ..." manualmente!
 */
export type PerfilPatchBody = z.infer<typeof PerfilPatchSchema>;
export type TituloResumo = z.infer<typeof TituloResumoSchema>;
export type PerfilTitulos = z.infer<typeof PerfilTitulosSchema>;
export type Patente = z.infer<typeof PatenteSchema>;
export type SenhaPatchBody = z.infer<typeof SenhaPatchSchema>;
export type DeletarContaBody = z.infer<typeof DeletarContaSchema>;