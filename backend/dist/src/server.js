"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cron = __importStar(require("node-cron"));
const errorHandler_middleware_1 = require("./shared/middlewares/errorHandler.middleware");
const AppError_1 = require("./shared/utils/AppError");
const requestId_middleware_1 = require("./shared/middlewares/requestId.middleware");
// Importação das Rotas
const auth_routes_1 = __importDefault(require("./features/auth/auth.routes"));
const perfil_routes_1 = __importDefault(require("./features/perfil/perfil.routes"));
const posts_routes_1 = __importDefault(require("./features/posts/posts.routes"));
const categorias_routes_1 = __importDefault(require("./features/categorias/categorias.routes"));
const health_routes_1 = __importDefault(require("./features/health/health.routes"));
const denuncias_routes_1 = __importDefault(require("./features/denuncias/denuncias.routes"));
const limpezaContas_1 = require("./shared/agendador/limpezaContas");
const serviceEmail_1 = require("./shared/utils/serviceEmail");
const logger_1 = require("./shared/utils/logger");
const rateLimiter_1 = require("./shared/middlewares/rateLimiter");
const ErrorCodes_1 = require("./errors/ErrorCodes");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
/**
 * 💡 PADRÃO ENTERPRISE: Inicialização do Servidor
 * Organizado por camadas de precedência.
 */
// --- 1. CONFIGURAÇÕES DE INFRAESTRUTURA ---
// Essencial para que middlewares de Rate Limit capturem o IP real atrás de proxies (Heroku, AWS, Nginx)
app.set('trust proxy', 1);
app.use((req, _res, next) => {
    if (process.env.NODE_ENV === 'production') {
        const proto = req.headers['x-forwarded-proto'];
        const isSecure = req.secure || (typeof proto === 'string' ? proto === 'https' : Array.isArray(proto) ? proto.includes('https') : false);
        if (!isSecure) {
            return next(new AppError_1.AppError('Conexão segura (HTTPS) é obrigatória em produção.', 403, ErrorCodes_1.ErrorCodes.FORBIDDEN));
        }
    }
    next();
});
app.use((req, _res, next) => {
    if (process.env.NODE_ENV === 'production') {
        const apiUrl = process.env.API_URL;
        if (apiUrl) {
            try {
                const u = new URL(apiUrl);
                if ((req.headers.host || '') !== u.host) {
                    return next(new AppError_1.AppError('Host não autorizado.', 403, ErrorCodes_1.ErrorCodes.FORBIDDEN));
                }
            }
            catch { }
        }
    }
    next();
});
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado.');
}
// --- 2. MIDDLEWARES GLOBAIS ---
app.use(requestId_middleware_1.middlewareRequestId);
app.use(helmet_1.default.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '100kb' }));
app.use((0, rateLimiter_1.LimiteProfundidadeJson)(7));
// --- 3. ROTAS DE APLICAÇÃO (API v1) ---
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/perfil', perfil_routes_1.default);
app.use('/api/v1/posts', posts_routes_1.default);
app.use('/api/v1/categorias', categorias_routes_1.default);
app.use('/api/v1/saude', health_routes_1.default);
app.use('/api/v1/denuncias', denuncias_routes_1.default);
// --- 4. FALLBACK PARA ROTAS INEXISTENTES (404) ---
app.all('*', (req, _res, next) => {
    // Usando o Factory Method para manter o padrão
    next(AppError_1.AppError.notFound(`Não foi possível encontrar a rota ${req.originalUrl} neste servidor.`));
});
// --- 5. TRATAMENTO DE ERROS GLOBAL ---
// OBRIGATÓRIO: Deve ser o último middleware para interceptar todos os erros disparados
app.use(errorHandler_middleware_1.tratadorDeErros);
// --- BACKGROUND SERVICES (CRON) ---
function iniciarAgendadorDeTarefas() {
    // Executa a cada hora cheia ('0 * * * *')
    cron.schedule('0 * * * *', () => {
        logger_1.logger.info("Executando tarefa agendada: Limpeza de Contas Expiradas", { evento: 'JOB_CLEAN_EXPIRED_ACCOUNTS_STARTED' });
        (0, limpezaContas_1.limparContasExpiradas)();
    }, {
        scheduled: true,
        timezone: process.env.TZ || "America/Sao_Paulo"
    });
    logger_1.logger.info("Agendador de Tarefas iniciado", { evento: 'TASK_SCHEDULER_STARTED' });
}
// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(Number(PORT), '0.0.0.0', () => {
    logger_1.logger.info(`Servidor rodando em http://localhost:${PORT}`, { evento: 'SERVER_STARTED' });
    // Diagnósticos de inicialização
    (0, serviceEmail_1.verificarConexaoSMTP)();
    iniciarAgendadorDeTarefas();
});
