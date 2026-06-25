import { z } from 'zod';
import { PostResumoSchema } from './post.types';

//schema de criação de obra
export const ObraCreateSchema = z.object({
  titulo: z.string()
    .min(5, "O título deve ter pelo menos 5 caracteres")
    .max(200, "O título é muito longo (máximo 200)")
    .trim(),
  descricao: z.string()
    .max(1000, "A descrição é muito longa (máximo 1000)")
    .optional(),
  idioma: z.string().min(1, "Selecione o idioma"),
  status: z.enum(["ANDAMENTO", "CONCLUIDO"]),
  imagem_capa: z.string().url("A imagem de capa deve ser uma URL válida").optional().or(z.literal("")),
  categorias: z.array(z.number().int()).min(1, "Selecione pelo menos uma categoria").max(3, "Máximo 3 categorias permitidas")
}).strict();

//schema de edição de obra
export const ObraUpdateSchema = z.object({
  titulo: z.string().min(5).max(200).trim().optional(),
  descricao: z.string().max(1000).optional(),
  imagem_capa: z.string().url().optional().or(z.literal("")),
  categorias: z.array(z.number().int()).min(1).max(3).optional(),
  status: z.enum(["ANDAMENTO", "CONCLUIDO"]).optional()
}).strict();


export type ObraCreateBody = z.infer<typeof ObraCreateSchema>;
export type ObraUpdateBody = z.infer<typeof ObraUpdateSchema>;

//schema de resposta de obra
export const ObraResponseSchema = z.object({
  obra_id: z.number(),
  autor_id: z.number().nullable(),
  titulo: z.string(),
  descricao: z.string().nullable(),
  imagem_capa: z.string().nullable(),
  data_criacao: z.string().or(z.date()),
  status: z.enum(["ANDAMENTO", "CONCLUIDO"]).optional(),
  total_visualizacoes: z.number().optional(),
  capitulos: z.array(z.any()).optional(), // Usamos any para evitar dependência circular complexa no schema
  _count: z.object({
    capitulos: z.number()
  }).optional(),
  categorias: z.array(z.object({
    categoria: z.object({
      categoria_id: z.number(),
      nome: z.string()
    })
  })).optional(),
  autor: z.object({
    nome_user: z.string()
  }).optional()
});

export type ObraResponse = z.infer<typeof ObraResponseSchema>;
