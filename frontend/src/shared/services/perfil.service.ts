import { apiClient } from '../utils/apiClient';
import { PerfilResumo, PerfilResumoSchema } from '../types/perfil.types';

export async function getMeuPerfil(): Promise<PerfilResumo> {
  return apiClient.get('/perfil/me', PerfilResumoSchema, undefined, (raw) => raw?.data) as Promise<PerfilResumo>;
}
