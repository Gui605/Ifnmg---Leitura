import prisma from '../prisma/prisma.client';
import { logger } from './logger';

export async function registrar(perfilId: number, evento: string, detalhes?: any, requestId?: string) {
  try {
    await prisma.logAtividade.create({
      data: {
        perfil_id: perfilId,
        evento,
        detalhes: detalhes ?? null
      }
    });
  } catch (e: any) {
    logger.error('LOG_SERVICE_PERSIST_FAIL', { evento, perfil_id: perfilId, error: e?.message, requestId });
  }
  try {
    logger.info('LOG_SERVICE_EVENT', { evento, perfil_id: perfilId, detalhes, requestId });
  } catch {}
}

