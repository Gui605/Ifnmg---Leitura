
//frontend/src/shared/services/denuncia.service.ts
import { apiClient } from '../utils/apiClient';
import { DenunciaCreateBody, DenunciaCreateSchema } from '../types/denuncia.types';
import { z } from 'zod';

//Registra uma nova denúncia
export async function registrarDenuncia(postId: number, data: DenunciaCreateBody): Promise<any> {
  return apiClient.post(`/denuncias/${postId}`, data, z.any(), undefined, (raw) => raw?.data);
}
