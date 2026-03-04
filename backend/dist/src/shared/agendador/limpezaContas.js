"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.limparContasExpiradas = limparContasExpiradas;
//backend/src/shared/agendador/limpezaContas.ts
const prisma_client_1 = __importDefault(require("../prisma/prisma.client"));
const logger_1 = require("../utils/logger");
const ErrorCodes_1 = require("../../errors/ErrorCodes");
async function limparContasExpiradas() {
    const agora = new Date();
    const metrics = { total: 0, success: 0, failure: 0 };
    try {
        const usuariosExpirados = await prisma_client_1.default.usuarios.findMany({
            where: {
                cadastro_confirmado: false,
                expiracao_pendente: { lt: agora },
            },
            select: { usuario_id: true },
        });
        metrics.total = usuariosExpirados.length;
        for (const usuario of usuariosExpirados) {
            try {
                await prisma_client_1.default.usuarios.delete({
                    where: { usuario_id: usuario.usuario_id },
                });
                metrics.success++;
            }
            catch (error) {
                metrics.failure++;
                logger_1.logger.error('Falha ao deletar usuário', {
                    evento: 'JOB_DELETE_USER_FAILED',
                    requestId: 'job-limparContas',
                    usuario_id: usuario.usuario_id,
                    error: error.message,
                    errorCode: ErrorCodes_1.ErrorCodes.CLEANUP_JOB_FAILED,
                });
            }
        }
        logger_1.logger.info('Limpeza de contas expiradas concluída', {
            evento: 'JOB_CLEAN_EXPIRED_ACCOUNTS_DONE',
            requestId: 'job-limparContas',
            metrics,
        });
    }
    catch (error) {
        logger_1.logger.error('Falha na rotina de limpeza de contas', {
            evento: 'JOB_CLEAN_EXPIRED_ACCOUNTS_FAILED',
            requestId: 'job-limparContas',
            error: error.message,
            errorCode: ErrorCodes_1.ErrorCodes.CLEANUP_JOB_FAILED,
        });
    }
}
