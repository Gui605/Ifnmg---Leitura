import { z } from 'zod';
import { apiClient } from '../utils/apiClient';
import { PerfilResumo, PerfilResumoSchema } from '../types/perfil.types';

export async function getMeuPerfil(): Promise<PerfilResumo> {
  return apiClient.get('/perfil/me', PerfilResumoSchema, undefined, (raw) => raw?.data) as Promise<PerfilResumo>;
}

export async function getPerfilPublico(id: number): Promise<PerfilResumo> {
  return apiClient.get(`/perfil/${id}`, PerfilResumoSchema, undefined, (raw) => raw?.data) as Promise<PerfilResumo>;
}

export async function toggleFollow(id: number): Promise<{ seguindo: boolean }> {
  return apiClient.post(`/perfil/${id}/seguir`, {}, z.object({ seguindo: z.boolean() }), undefined, (raw) => raw?.data) as Promise<{ seguindo: boolean }>;
}

export async function updateMeuPerfil(data: { nome_user?: string; bio?: string }): Promise<{ perfil: PerfilResumo }> {
  return apiClient.patch('/perfil', data, z.object({ perfil: PerfilResumoSchema }), undefined, (raw) => raw?.data) as Promise<{ perfil: PerfilResumo }>;
}

export async function updateSenha(senha_antiga: string, senha_nova: string): Promise<void> {
  return apiClient.patch('/perfil/seguranca/senha', { senha_antiga, senha_nova }, z.void(), undefined, (raw) => raw?.data) as Promise<void>;
}

export async function deleteMinhaConta(): Promise<void> {
  return apiClient.delete('/perfil', undefined, undefined, (raw) => raw?.data) as Promise<void>;
}

export async function setTituloAtivo(tituloId: number): Promise<PerfilResumo> {
  return apiClient.patch(`/perfil/titulos/${tituloId}/ativar`, {}, PerfilResumoSchema, undefined, (raw) => raw?.data) as Promise<PerfilResumo>;
}
