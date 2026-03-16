import { z } from 'zod';
import { apiClient } from '../utils/apiClient';
import { PostResumo, PostResumoSchema } from '../types/post.types';

export async function getPosts(page: number = 1): Promise<{ posts: PostResumo[]; meta: any }> {
  return apiClient.get(`/posts?page=${page}&limit=10`, z.any(), undefined, (raw) => ({
    posts: raw?.data,
    meta: raw?.meta
  })) as Promise<{ posts: PostResumo[]; meta: any }>;
}

export async function criarPost(data: { titulo: string; conteudo: string; tags: string[] }): Promise<any> {
  return apiClient.post('/posts', data, z.any(), undefined, (raw) => raw?.data);
}
