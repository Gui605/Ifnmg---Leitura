import { z } from 'zod';
import { apiClient } from '../utils/apiClient';
import { 
  ObraCreateBody, 
  ObraUpdateBody, 
  ObraResponseSchema, 
  ObraResponse 
} from '../types/obra.types';


//Cria uma nova obra
export async function criarObra(data: ObraCreateBody): Promise<ObraResponse> {
  return apiClient.post('/obras', data, ObraResponseSchema, undefined, (raw) => raw?.data) as Promise<ObraResponse>;
}

//Lista todas as obras do usuário
export async function listarMinhasObras(): Promise<ObraResponse[]> {
  const schema = z.array(ObraResponseSchema);
  return apiClient.get('/obras', schema, undefined, (raw) => raw?.data) as Promise<ObraResponse[]>;
}

//Busca uma obra por ID
export async function buscarObraPorId(obraId: number): Promise<ObraResponse> {
  return apiClient.get(`/obras/${obraId}`, ObraResponseSchema, undefined, (raw) => raw?.data) as Promise<ObraResponse>;
}

//Atualiza uma obra existente
export async function atualizarObra(obraId: number, data: ObraUpdateBody): Promise<ObraResponse> {
  return apiClient.patch(`/obras/${obraId}`, data, ObraResponseSchema, undefined, (raw) => raw?.data) as Promise<ObraResponse>;
}

//Deleta uma obra
export async function deletarObra(obraId: number): Promise<void> {
  return apiClient.delete(`/obras/${obraId}`, {}, z.any(), undefined, () => {}) as unknown as Promise<void>;
}
