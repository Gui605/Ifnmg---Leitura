import dotenv from 'dotenv'; 
dotenv.config(); 
import express from 'express';
import cors from 'cors'; 
import helmet from 'helmet';
import * as cron from 'node-cron'; 
import { tratadorDeErros } from './shared/middlewares/errorHandler.middleware';
import { AppError } from './shared/utils/AppError';
import { middlewareRequestId } from './shared/middlewares/requestId.middleware';

// Importação das Rotas
import authRoutes from './features/auth/auth.routes'; 
import perfilRoutes from './features/perfil/perfil.routes';
import postsRoutes from './features/posts/posts.routes';
import categoriasRoutes from "./features/categorias/categorias.routes";
import healthRoutes from './features/health/health.routes';
import denunciasRoutes from './features/denuncias/denuncias.routes';

import { limparContasExpiradas } from './shared/agendador/limpezaContas';
import { verificarConexaoSMTP } from './shared/utils/serviceEmail'; 
import { logger } from './shared/utils/logger';
import { LimiteProfundidadeJson } from './shared/middlewares/rateLimiter';
import { ErrorCodes } from './errors/ErrorCodes';

const app = express();
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
            return next(new AppError('Conexão segura (HTTPS) é obrigatória em produção.', 403, ErrorCodes.FORBIDDEN));
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
                    return next(new AppError('Host não autorizado.', 403, ErrorCodes.FORBIDDEN));
                }
            } catch {}
        }
    }
    next();
});

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado.');
}

// --- 2. MIDDLEWARES GLOBAIS ---
app.use(middlewareRequestId);
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
}));

app.use(express.json({ limit: '100kb' }));
app.use(LimiteProfundidadeJson(7));

// --- 3. ROTAS DE APLICAÇÃO (API v1) ---
app.use('/api/v1/auth', authRoutes); 
app.use('/api/v1/perfil', perfilRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/v1/categorias', categoriasRoutes);
app.use('/api/v1/saude', healthRoutes);
app.use('/api/v1/denuncias', denunciasRoutes);

// --- 4. FALLBACK PARA ROTAS INEXISTENTES (404) ---
app.all('*', (req, _res, next) => {
    // Usando o Factory Method para manter o padrão
    next(AppError.notFound(`Não foi possível encontrar a rota ${req.originalUrl} neste servidor.`));
});

// --- 5. TRATAMENTO DE ERROS GLOBAL ---
// OBRIGATÓRIO: Deve ser o último middleware para interceptar todos os erros disparados
app.use(tratadorDeErros); 

// --- BACKGROUND SERVICES (CRON) ---
function iniciarAgendadorDeTarefas() {
    // Executa a cada hora cheia ('0 * * * *')
    cron.schedule('0 * * * *', () => {
        logger.info("Executando tarefa agendada: Limpeza de Contas Expiradas", { evento: 'JOB_CLEAN_EXPIRED_ACCOUNTS_STARTED' });
        limparContasExpiradas(); 
    }, {
        scheduled: true,
        timezone: process.env.TZ || "America/Sao_Paulo" 
    });
    logger.info("Agendador de Tarefas iniciado", { evento: 'TASK_SCHEDULER_STARTED' });
}

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(Number(PORT), '0.0.0.0', () => {
    logger.info(`Servidor rodando em http://localhost:${PORT}`, { evento: 'SERVER_STARTED' });
    
    // Diagnósticos de inicialização
    verificarConexaoSMTP(); 
    iniciarAgendadorDeTarefas(); 
});
