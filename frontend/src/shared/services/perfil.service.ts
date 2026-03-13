import { z } from 'zod';
import { apiClient } from '../utils/apiClient';
import { PerfilResumo, PerfilResumoSchema } from '../types/perfil.types';

export async function getMeuPerfil(): Promise<PerfilResumo> {
  return apiClient.get('/perfil/me', PerfilResumoSchema, undefined, (raw) => raw?.data) as Promise<PerfilResumo>;
}

export async function toggleFollow(id: number): Promise<{ seguindo: boolean }> {
  return apiClient.post(`/perfil/${id}/seguir`, {}, z.object({ seguindo: z.boolean() }), undefined, (raw) => raw?.data) as Promise<{ seguindo: boolean }>;
}
