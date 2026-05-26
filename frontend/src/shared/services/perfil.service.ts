//frontend/src/shared/services/perfil.service.ts
import { z } from 'zod';
import { apiClient } from '../utils/apiClient';
import { PerfilResumo, PerfilResumoSchema } from '../types/perfil.types';

//Busca o perfil do usuário logado
export async function getMeuPerfil(): Promise<PerfilResumo> {
  return apiClient.get('/perfil/me', PerfilResumoSchema, undefined, (raw) => raw?.data) as Promise<PerfilResumo>;
}

//Busca o perfil de outro usuário
export async function getPerfilPublico(id: number): Promise<PerfilResumo> {
  return apiClient.get(`/perfil/${id}`, PerfilResumoSchema, undefined, (raw) => raw?.data) as Promise<PerfilResumo>;
}

//Segue ou deixa de seguir um usuário
export async function toggleFollow(id: number): Promise<{ seguindo: boolean }> {
  return apiClient.post(`/perfil/${id}/seguir`, {}, z.object({ seguindo: z.boolean() }), undefined, (raw) => raw?.data) as Promise<{ seguindo: boolean }>;
}

//Atualiza o perfil do usuário logado
export async function updateMeuPerfil(data: { nome?: string; bio?: string; titulo_ativo_id?: number }): Promise<{ perfil: PerfilResumo }> {
  return apiClient.patch('/perfil/me', data, z.object({ perfil: PerfilResumoSchema }), undefined, (raw) => raw?.data) as Promise<{ perfil: PerfilResumo }>;
}

//Atualiza a senha do usuário logado
export async function updateSenha(senhaAntiga: string, novaSenha: string, confirmarNovaSenha: string): Promise<void> {
  return apiClient.patch('/perfil/seguranca/senha', { senhaAntiga, novaSenha, confirmarNovaSenha }, z.any(), undefined, (raw) => raw?.data) as Promise<void>;
}

//Deleta a conta do usuário logado
export async function deleteMinhaConta(senhaAtual: string): Promise<void> {
  return apiClient.delete('/perfil/seguranca/conta', { senhaAtual }, z.any(), undefined, (raw) => raw?.data) as Promise<void>;
}

export interface PendenciasExclusao {
  podeExcluir: boolean;
  comunidadesImpeditivas: Array<{ id: number; nome: string; totalMembros: number }>;
  isRootAdmin: boolean;
}

//Verifica se o usuário pode excluir a conta
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

//Define o título ativo do usuário
export async function setTituloAtivo(tituloId: number): Promise<PerfilResumo> {
  return apiClient.patch(`/perfil/titulos/${tituloId}/ativar`, {}, PerfilResumoSchema, undefined, (raw) => raw?.data) as Promise<PerfilResumo>;
}
