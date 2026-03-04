import { Request, Response } from 'express';
import prisma from '../../shared/prisma/prisma.client';
import { diagnosticarSMTP } from '../../shared/utils/serviceEmail';
import { logger } from '../../shared/utils/logger';
import { ErrorCodes } from '../../errors/ErrorCodes';

/**
 * 💡 PADRÃO ENTERPRISE: Health Check Controller
 * Centraliza diagnósticos profundos da infraestrutura.
 */

interface HealthStatus {
    status: 'UP' | 'DEGRADED' | 'DOWN';
    timestamp: string;
    uptime: string;
    requestId: string;
    services: {
        database: 'UP' | 'DOWN';
        email: 'UP' | 'DOWN' | 'DISABLED';
    };
}

function formatUptime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

export const checkHealth = async (req: Request, res: Response) => {
    const requestId = req.requestId || 'unknown';
    
    // 1. Diagnóstico do Banco de Dados (Deep Check)
    let dbStatus: 'UP' | 'DOWN' = 'UP';
    try {
        // Executa query leve para testar conexão real
        await prisma.$queryRaw`SELECT 1`;
    } catch (error: any) {
        dbStatus = 'DOWN';
        logger.error('Falha crítica no Health Check do Banco de Dados', { 
            evento: 'HEALTH_CHECK_DB_FAILED',
            requestId,
            errorCode: ErrorCodes.DATABASE_CONNECTION_FAILED,
            // O logger já blinda dados sensíveis, mas garantimos aqui que só passamos a msg
            error: error.message 
        });
    }

    // 2. Diagnóstico do Email
    const emailStatus = await diagnosticarSMTP();
    
    // 3. Consolidação do Status Geral
    let globalStatus: 'UP' | 'DEGRADED' | 'DOWN' = 'UP';
    
    if (dbStatus === 'DOWN') {
        globalStatus = 'DOWN'; // DB é crítico
    } else if (emailStatus === 'DOWN') {
        globalStatus = 'DEGRADED'; // Email é importante mas sistema roda sem ele
    }

    const response: HealthStatus = {
        status: globalStatus,
        timestamp: new Date().toISOString(),
        uptime: formatUptime(process.uptime()),
        requestId,
        services: {
            database: dbStatus,
            email: emailStatus
        }
    };

    const httpStatus = globalStatus === 'DOWN' ? 503 : 200;

    return res.status(httpStatus).json(response);
};

export const checkLiveness = async (req: Request, res: Response) => {
    return res.status(200).json({ status: 'ALIVE' });
};

export default { checkHealth, checkLiveness };
