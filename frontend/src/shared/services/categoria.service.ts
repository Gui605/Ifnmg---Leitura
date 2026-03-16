import { apiClient } from '../utils/apiClient';
import { Categoria, CategoriaSchema, TrendingCategoria, TrendingCategoriaSchema } from '../types/categoria.types';
import { z } from 'zod';

export async function getTodas(): Promise<Categoria[]> {
  return apiClient.get('/categorias', z.array(CategoriaSchema), undefined, (raw) => raw?.data) as Promise<Categoria[]>;
}

export async function getTrendingTags(): Promise<TrendingCategoria[]> {
  return apiClient.get('/categorias/trending', z.array(TrendingCategoriaSchema), undefined, (raw) => raw?.data) as Promise<TrendingCategoria[]>;
}
