import { z } from 'zod';

export const CategoriaSchema = z.object({
  categoria_id: z.number().int(),
  nome: z.string(),
  slug: z.string().optional(),
});

export type Categoria = z.infer<typeof CategoriaSchema>;

export const TrendingCategoriaSchema = z.object({
  categoria_id: z.number().int(),
  nome: z.string(),
  contagem: z.number().int(),
});

export type TrendingCategoria = z.infer<typeof TrendingCategoriaSchema>;
