//frontend/shared/services/post.service.ts
import { z } from 'zod';
import { apiClient } from '../utils/apiClient';
import { PostResumo, PostResumoSchema, TrabalhoResumo, TrabalhoResumoSchema, FiltrosBusca, PostCreateBody } from '../types/post.types';

export async function getPosts(filtros: { page?: number; categoriaId?: number; autorId?: number } = {}): Promise<{ posts: PostResumo[]; meta: any }> {
  const params = new URLSearchParams();
  params.append('page', String(filtros.page || 1));
  params.append('limit', '10');
  if (filtros.categoriaId) params.append('categoria', String(filtros.categoriaId));
  if (filtros.autorId) params.append('autorId', String(filtros.autorId));

  return apiClient.get(`/posts?${params.toString()}`, z.any(), undefined, (raw) => ({
    posts: raw?.data,
    meta: raw?.meta
  })) as Promise<{ posts: PostResumo[]; meta: any }>;
}

export async function pesquisarTrabalhos(filtros: FiltrosBusca): Promise<{ trabalhos: TrabalhoResumo[]; meta: any }> {
  const params = new URLSearchParams();
  if (filtros.query) params.append('termo', filtros.query);
  if (filtros.curso) params.append('curso', filtros.curso);
  if (filtros.idioma) params.append('idioma', filtros.idioma);
  if (filtros.status) params.append('status', filtros.status);
  if (filtros.tipo) params.append('tipo', filtros.tipo.toUpperCase());
  if (filtros.ordenar_por) params.append('sort', filtros.ordenar_por);
  params.append('page', String(filtros.page || 1));
  params.append('limit', '10');

  console.log("📡 Chamando API URL:", `/posts/pesquisa?${params.toString()}`);

  return apiClient.get(`/posts/pesquisa?${params.toString()}`, z.any(), undefined, (raw) => ({
    trabalhos: raw?.data || [],
    meta: raw?.meta || { total: 0, page: 1, totalPages: 1 }
  })) as Promise<{ trabalhos: TrabalhoResumo[]; meta: any }>;
}

export async function getPostsByUserId(userId: number, page: number = 1): Promise<{ posts: PostResumo[]; meta: any }> {
  return getPosts({ autorId: userId, page });
}

export async function getPostsFavoritados(page: number = 1): Promise<{ posts: PostResumo[]; meta: any }> {
  // Nota: Implementação do endpoint de favoritos pendente no backend, usando mock estruturado
  return apiClient.get(`/posts/favoritos?page=${page}&limit=10`, z.any(), undefined, (raw) => ({
    posts: raw?.data || [],
    meta: raw?.meta || { page: 1, totalPages: 1 }
  })) as Promise<{ posts: PostResumo[]; meta: any }>;
}

export async function criarPost(data: PostCreateBody): Promise<any> {
  return apiClient.post('/posts', data, z.any(), undefined, (raw) => raw?.data);
}

export async function votarPost(postId: number, tipo: 'up' | 'down'): Promise<{ total_upvotes: number; total_downvotes: number }> {
  return apiClient.post(`/posts/${postId}/votar`, { tipo: tipo.toUpperCase() }, z.any(), undefined, (raw) => raw?.data) as Promise<{ total_upvotes: number; total_downvotes: number }>;
}

export async function getPostById(postId: number): Promise<any> {
  return apiClient.get(`/posts/${postId}`, z.any(), undefined, (raw) => raw?.data);
}

export async function reagirPost(postId: number, tipo: string): Promise<any> {
  return apiClient.post(`/posts/${postId}/reagir`, { tipo }, z.any(), undefined, (raw) => raw?.data);
}

export async function comentarPost(postId: number, texto: string, parentId?: number, isSpoiler: boolean = false): Promise<any> {
  return apiClient.post(`/posts/${postId}/comentarios`, { texto, parent_id: parentId, is_spoiler: isSpoiler }, z.any(), undefined, (raw) => raw?.data);
}
