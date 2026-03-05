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
// Middlewares
const requestId_middleware_1 = require("./shared/middlewares/requestId.middleware");
const jsonDepth_middleware_1 = require("./shared/middlewares/jsonDepth.middleware");
const security_middleware_1 = require("./shared/middlewares/security.middleware");
const errorHandler_middleware_1 = require("./shared/middlewares/errorHandler.middleware");
// Routes
const auth_routes_1 = __importDefault(require("./features/auth/auth.routes"));
const perfil_routes_1 = __importDefault(require("./features/perfil/perfil.routes"));
const posts_routes_1 = __importDefault(require("./features/posts/posts.routes"));
const categorias_routes_1 = __importDefault(require("./features/categorias/categorias.routes"));
const health_routes_1 = __importDefault(require("./features/health/health.routes"));
const denuncias_routes_1 = __importDefault(require("./features/denuncias/denuncias.routes"));
// Utils
const logger_1 = require("./shared/utils/logger");
const serviceEmail_1 = require("./shared/utils/serviceEmail");
const limpezaContas_1 = require("./shared/agendador/limpezaContas");
const AppError_1 = require("./shared/utils/AppError");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// --- 1. INFRAESTRUTURA ---
app.set('trust proxy', 1);
// --- 2. MIDDLEWARES DE SEGURANÇA E PARSING ---
app.use(requestId_middleware_1.middlewareRequestId);
app.use((0, helmet_1.default)());
app.use(helmet_1.default.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true })); // Restaurado
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '100kb' }));
app.use((0, jsonDepth_middleware_1.jsonDepthMiddleware)(7));
app.use(security_middleware_1.enforceSecurity); // Proteção HTTPS e Host
// --- 3. VALIDAÇÃO DE SEGURANÇA DE PRODUÇÃO ---
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('CONFIGURAÇÃO FATAL: JWT_SECRET não configurado em produção.');
}
// --- 4. ROTAS ---
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/perfil', perfil_routes_1.default);
app.use('/api/v1/posts', posts_routes_1.default);
app.use('/api/v1/categorias', categorias_routes_1.default);
app.use('/api/v1/saude', health_routes_1.default);
app.use('/api/v1/denuncias', denuncias_routes_1.default);
// --- 5. FALLBACK E ERROS ---
app.all('*', (req, _res, next) => next(AppError_1.AppError.notFound(`Rota ${req.originalUrl} não existe.`)));
app.use(errorHandler_middleware_1.tratadorDeErros);
// --- 6. INICIALIZAÇÃO ---
const iniciarServidor = async () => {
    try {
        app.listen(Number(PORT), '0.0.0.0', () => {
            logger_1.logger.info(`Servidor rodando na porta ${PORT}`, { evento: 'SERVER_STARTED' });
        });
        // Background Services
        (0, serviceEmail_1.verificarConexaoSMTP)();
        // Agendador com Log de Observabilidade
        cron.schedule('0 * * * *', () => {
            logger_1.logger.info("Executando tarefa agendada: Limpeza de Contas Expiradas", { evento: 'JOB_CLEAN_EXPIRED_ACCOUNTS_STARTED' });
            (0, limpezaContas_1.limparContasExpiradas)();
        }, { timezone: process.env.TZ || "America/Sao_Paulo" });
        logger_1.logger.info("Agendador de tarefas iniciado", { evento: 'TASK_SCHEDULER_STARTED' });
    }
    catch (err) {
        logger_1.logger.error("Falha fatal ao iniciar servidor", { error: err });
        process.exit(1);
    }
};
iniciarServidor();
