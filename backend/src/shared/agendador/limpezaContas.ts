//backend/src/shared/agendador/limpezaContas.ts
import prisma from '../prisma/prisma.client';
import { logger } from '../utils/logger';
import { ErrorCodes } from '../../errors/ErrorCodes';

export async function limparContasExpiradas(): Promise<void> {
  const agora = new Date();

  const metrics = { total: 0, success: 0, failure: 0 };

  try {
    const usuariosExpirados = await prisma.usuarios.findMany({
      where: {
        cadastro_confirmado: false,
        expiracao_pendente: { lt: agora },
      },
      select: { usuario_id: true },
    });

    metrics.total = usuariosExpirados.length;

    for (const usuario of usuariosExpirados) {
      try {
        await prisma.usuarios.delete({
          where: { usuario_id: usuario.usuario_id },
        });
        metrics.success++;
      } catch (error: any) {
        metrics.failure++;
        logger.error('Falha ao deletar usuário', {
          evento: 'JOB_DELETE_USER_FAILED',
          requestId: 'job-limparContas',
          usuario_id: usuario.usuario_id,
          error: error.message,
          errorCode: ErrorCodes.CLEANUP_JOB_FAILED,
        });
      }
    }

    logger.info('Limpeza de contas expiradas concluída', {
      evento: 'JOB_CLEAN_EXPIRED_ACCOUNTS_DONE',
      requestId: 'job-limparContas',
      metrics,
    });
  } catch (error: any) {
    logger.error('Falha na rotina de limpeza de contas', {
      evento: 'JOB_CLEAN_EXPIRED_ACCOUNTS_FAILED',
      requestId: 'job-limparContas',
      error: error.message,
      errorCode: ErrorCodes.CLEANUP_JOB_FAILED,
    });
  }
}
