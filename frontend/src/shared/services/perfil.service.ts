//frontend/src/shared/services/perfil.service.ts
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

export async function updateMeuPerfil(data: { nome?: string; bio?: string; titulo_ativo_id?: number }): Promise<{ perfil: PerfilResumo }> {
  return apiClient.patch('/perfil/me', data, z.object({ perfil: PerfilResumoSchema }), undefined, (raw) => raw?.data) as Promise<{ perfil: PerfilResumo }>;
}

export async function updateSenha(senhaAntiga: string, novaSenha: string, confirmarNovaSenha: string): Promise<void> {
  return apiClient.patch('/perfil/seguranca/senha', { senhaAntiga, novaSenha, confirmarNovaSenha }, z.any(), undefined, (raw) => raw?.data) as Promise<void>;
}

export async function deleteMinhaConta(senhaAtual: string): Promise<void> {
  return apiClient.delete('/perfil/seguranca/conta', { senhaAtual }, z.any(), undefined, (raw) => raw?.data) as Promise<void>;
}

export interface PendenciasExclusao {
  podeExcluir: boolean;
  comunidadesImpeditivas: Array<{ id: number; nome: string; totalMembros: number }>;
  isRootAdmin: boolean;
}

export async function checkPendenciasExclusao(): Promise<PendenciasExclusao> {
  const schema = z.object({
    podeExcluir: z.boolean(),
    comunidadesImpeditivas: z.array(z.object({
      id: z.number(),
      nome: z.string(),
      totalMembros: z.number()
    })),
    isRootAdmin: z.boolean()
  });
  return apiClient.get('/perfil/seguranca/check-exclusao', schema, undefined, (raw) => raw?.data) as Promise<PendenciasExclusao>;
}

export async function setTituloAtivo(tituloId: number): Promise<PerfilResumo> {
  return apiClient.patch(`/perfil/titulos/${tituloId}/ativar`, {}, PerfilResumoSchema, undefined, (raw) => raw?.data) as Promise<PerfilResumo>;
}
