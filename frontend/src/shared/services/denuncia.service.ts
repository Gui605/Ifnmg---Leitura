import { apiClient } from '../utils/apiClient';
import { DenunciaCreateBody, DenunciaCreateSchema } from '../types/denuncia.types';
import { z } from 'zod';

export async function registrarDenuncia(postId: number, data: DenunciaCreateBody): Promise<any> {
  return apiClient.post(`/denuncias/${postId}`, data, z.any(), undefined, (raw) => raw?.data);
}
