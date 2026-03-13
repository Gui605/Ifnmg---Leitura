import { apiClient } from '../utils/apiClient';
import { TrendingCategoria, TrendingCategoriaSchema } from '../types/categoria.types';
import { z } from 'zod';

export async function getTrendingTags(): Promise<TrendingCategoria[]> {
  return apiClient.get('/categorias/trending', z.array(TrendingCategoriaSchema), undefined, (raw) => raw?.data) as Promise<TrendingCategoria[]>;
}
