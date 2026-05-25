// backend/src/shared/types/categoria.types.ts
import { z } from 'zod';


/**
Schema de Criação de Categoria
 O .strict() impede que o usuário tente injetar IDs manuais.
 */
export const CategoriaCreateSchema = z.object({
    nome: z.string()
        .min(2, "O nome da categoria deve ter pelo menos 2 caracteres")
        .max(50, "O nome da categoria é muito longo")
        .trim()
}).strict();

/*
Schema de Atualização de Categoria
 No update, o campo nome também é obrigatório se a rota for chamada.
 */
export const CategoriaUpdateSchema = CategoriaCreateSchema;

/*
Inferência Automática de Tipos
 */
export type CategoriaCreateBody = z.infer<typeof CategoriaCreateSchema>;
export type CategoriaUpdateBody = z.infer<typeof CategoriaUpdateSchema>;


/*
Schema de Fusão de Interesses
 */
export const ToggleInteresseSchema = z.object({
    categoria_id: z.number().positive("ID da categoria inválido")
}).strict();

export type ToggleInteresseBody = z.infer<typeof ToggleInteresseSchema>;

export type InteresseResponse = {
    perfil_id: number;
    categoria_id: number;
    categoria: {
        categoria_id: number;
        nome: string;
    };
};

export type TrendingCategoriaResponse = {
    categoria_id: number;
    nome: string;
    contagem: number;
};
