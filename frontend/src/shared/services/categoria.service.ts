//frontend/src/shared/services/categoria.service.ts
import { apiClient } from '../utils/apiClient';
import { Categoria, CategoriaSchema, TrendingCategoria, TrendingCategoriaSchema } from '../types/categoria.types';
import { z } from 'zod';

//Lista todas as categorias
export async function listarCategorias(): Promise<Categoria[]> {
  return apiClient.get('/categorias', z.array(CategoriaSchema), undefined, (raw) => raw?.data) as Promise<Categoria[]>;
}

//Obtém as categorias mais populares
export async function getTrendingTags(): Promise<TrendingCategoria[]> {
  return apiClient.get('/categorias/trending', z.array(TrendingCategoriaSchema), undefined, (raw) => raw?.data) as Promise<TrendingCategoria[]>;
}
