"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLiveness = exports.checkHealth = void 0;
const prisma_client_1 = __importDefault(require("../../shared/prisma/prisma.client"));
const serviceEmail_1 = require("../../shared/utils/serviceEmail");
const logger_1 = require("../../shared/utils/logger");
const ErrorCodes_1 = require("../../errors/ErrorCodes");
function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}
const checkHealth = async (req, res) => {
    const requestId = req.requestId || 'unknown';
    // 1. Diagnóstico do Banco de Dados (Deep Check)
    let dbStatus = 'UP';
    try {
        // Executa query leve para testar conexão real
        await prisma_client_1.default.$queryRaw `SELECT 1`;
    }
    catch (error) {
        dbStatus = 'DOWN';
        logger_1.logger.error('Falha crítica no Health Check do Banco de Dados', {
            evento: 'HEALTH_CHECK_DB_FAILED',
            requestId,
            errorCode: ErrorCodes_1.ErrorCodes.DATABASE_CONNECTION_FAILED,
            // O logger já blinda dados sensíveis, mas garantimos aqui que só passamos a msg
            error: error.message
        });
    }
    // 2. Diagnóstico do Email
    const emailStatus = await (0, serviceEmail_1.diagnosticarSMTP)();
    // 3. Consolidação do Status Geral
    let globalStatus = 'UP';
    if (dbStatus === 'DOWN') {
        globalStatus = 'DOWN'; // DB é crítico
    }
    else if (emailStatus === 'DOWN') {
        globalStatus = 'DEGRADED'; // Email é importante mas sistema roda sem ele
    }
    const response = {
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
exports.checkHealth = checkHealth;
const checkLiveness = async (req, res) => {
    return res.status(200).json({ status: 'ALIVE' });
};
exports.checkLiveness = checkLiveness;
exports.default = { checkHealth: exports.checkHealth, checkLiveness: exports.checkLiveness };
