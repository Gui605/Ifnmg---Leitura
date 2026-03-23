import { z } from 'zod';
import { apiClient } from '../utils/apiClient';
import { PostResumo, PostResumoSchema, TrabalhoResumo, TrabalhoResumoSchema, FiltrosBusca } from '../types/post.types';

export async function getPosts(page: number = 1): Promise<{ posts: PostResumo[]; meta: any }> {
  return apiClient.get(`/posts?page=${page}&limit=10`, z.any(), undefined, (raw) => ({
    posts: raw?.data,
    meta: raw?.meta
  })) as Promise<{ posts: PostResumo[]; meta: any }>;
}

export async function pesquisarTrabalhos(filtros: FiltrosBusca): Promise<{ trabalhos: TrabalhoResumo[]; meta: any }> {
  const params = new URLSearchParams();
  if (filtros.query) params.append('q', filtros.query);
  if (filtros.curso) params.append('curso', filtros.curso);
  if (filtros.idioma) params.append('idioma', filtros.idioma);
  if (filtros.status) params.append('status', filtros.status);
  if (filtros.ordenar_por) params.append('sort', filtros.ordenar_por);
  params.append('page', String(filtros.page || 1));
  params.append('limit', '10');

  return apiClient.get(`/posts/pesquisa?${params.toString()}`, z.any(), undefined, (raw) => ({
    trabalhos: raw?.data || [],
    meta: raw?.meta || { total: 0, page: 1, totalPages: 1 }
  })) as Promise<{ trabalhos: TrabalhoResumo[]; meta: any }>;
}

export async function getPostsByUserId(userId: number, page: number = 1): Promise<{ posts: PostResumo[]; meta: any }> {
  return apiClient.get(`/posts?autor_id=${userId}&page=${page}&limit=10`, z.any(), undefined, (raw) => ({
    posts: raw?.data,
    meta: raw?.meta
  })) as Promise<{ posts: PostResumo[]; meta: any }>;
}

export async function getPostsFavoritados(page: number = 1): Promise<{ posts: PostResumo[]; meta: any }> {
  // Nota: Implementação do endpoint de favoritos pendente no backend, usando mock estruturado
  return apiClient.get(`/posts/favoritos?page=${page}&limit=10`, z.any(), undefined, (raw) => ({
    posts: raw?.data || [],
    meta: raw?.meta || { page: 1, totalPages: 1 }
  })) as Promise<{ posts: PostResumo[]; meta: any }>;
}

export async function criarPost(data: { titulo: string; conteudo: string; tags: string[] }): Promise<any> {
  return apiClient.post('/posts', data, z.any(), undefined, (raw) => raw?.data);
}

export async function votarPost(postId: number, tipo: 'up' | 'down'): Promise<{ total_upvotes: number; total_downvotes: number }> {
  return apiClient.post(`/posts/${postId}/votar`, { tipo }, z.object({
    total_upvotes: z.number(),
    total_downvotes: z.number()
  }), undefined, (raw) => raw?.data) as Promise<{ total_upvotes: number; total_downvotes: number }>;
}
