import { z } from 'zod';
import { apiClient } from '../utils/apiClient';
import { PostResumo, PostResumoSchema } from '../types/post.types';

export async function getFeed(): Promise<PostResumo[]> {
  return apiClient.get('/feed', z.array(PostResumoSchema), undefined, (raw) => raw?.data) as Promise<PostResumo[]>;
}
