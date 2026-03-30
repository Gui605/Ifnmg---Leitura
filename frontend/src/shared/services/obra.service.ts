import { z } from 'zod';
import { apiClient } from '../utils/apiClient';
import { 
  ObraCreateBody, 
  ObraUpdateBody, 
  ObraResponseSchema, 
  ObraResponse 
} from '../types/obra.types';

/**
 * 💡 SERVIÇO DE OBRAS (Frontend)
 * Conecta a UI com os endpoints de projetos literários/acadêmicos.
 */

export async function criarObra(data: ObraCreateBody): Promise<ObraResponse> {
  return apiClient.post('/obras', data, ObraResponseSchema, undefined, (raw) => raw?.data) as Promise<ObraResponse>;
}

export async function listarMinhasObras(): Promise<ObraResponse[]> {
  const schema = z.array(ObraResponseSchema);
  return apiClient.get('/obras', schema, undefined, (raw) => raw?.data) as Promise<ObraResponse[]>;
}

export async function buscarObraPorId(obraId: number): Promise<ObraResponse> {
  return apiClient.get(`/obras/${obraId}`, ObraResponseSchema, undefined, (raw) => raw?.data) as Promise<ObraResponse>;
}

export async function atualizarObra(obraId: number, data: ObraUpdateBody): Promise<ObraResponse> {
  return apiClient.patch(`/obras/${obraId}`, data, ObraResponseSchema, undefined, (raw) => raw?.data) as Promise<ObraResponse>;
}

export async function deletarObra(obraId: number): Promise<void> {
  return apiClient.delete(`/obras/${obraId}`, {}, z.any(), undefined, () => {}) as unknown as Promise<void>;
}
