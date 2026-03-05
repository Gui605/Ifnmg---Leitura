import prisma from '../prisma/prisma.client';
import { logger } from './logger';

export function registrar(perfilId: number, evento: string, detalhes?: any, requestId?: string) {
  // Chamada assíncrona, desanexada do fluxo principal
  prisma.logAtividade.create({
    data: {
      perfil_id: perfilId,
      evento,
      detalhes: detalhes ?? null
    }
  })
  .catch((e: any) => {
    // Logamos o erro de infraestrutura. Não tentamos retry manual.
    logger.error('LOG_SERVICE_PERSIST_FAIL', { 
      evento, 
      perfil_id: perfilId, 
      error: e?.message, 
      requestId 
    });
  });
}