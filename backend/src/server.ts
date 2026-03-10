import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as cron from 'node-cron';

// Middlewares
import { middlewareRequestId } from './shared/middlewares/requestId.middleware';
import { jsonDepthMiddleware } from './shared/middlewares/jsonDepth.middleware';
import { enforceSecurity } from './shared/middlewares/security.middleware';
import { responseEnveloper } from './shared/middlewares/responseEnveloper.middleware';
import { tratadorDeErros } from './shared/middlewares/errorHandler.middleware';

// Routes
import authRoutes from './features/auth/auth.routes';
import perfilRoutes from './features/perfil/perfil.routes';
import postsRoutes from './features/posts/posts.routes';
import categoriasRoutes from "./features/categorias/categorias.routes";
import healthRoutes from './features/health/health.routes';
import denunciasRoutes from './features/denuncias/denuncias.routes';

// Utils
import { logger } from './shared/utils/logger';
import { iniciarMonitoramentoSMTP } from './shared/utils/serviceEmail';
import { limparContasExpiradas } from './shared/agendador/limpezaContas';
import { AppError } from './shared/utils/AppError';

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. INFRAESTRUTURA ---
app.set('trust proxy', 1);

// --- 2. MIDDLEWARES DE SEGURANÇA E PARSING ---
// 1. Rastreamento deve ser o primeiro para logar tudo
app.use(middlewareRequestId);

// 2. CORS deve vir antes de qualquer middleware que possa bloquear a requisição (como Helmet ou Security)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 3. Tratamento explícito de Preflight para evitar 401/403 antes de chegar no CORS
app.options('*', cors());

// 4. Segurança e Parsers (Agora em ambiente seguro pois o CORS já passou)
app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
app.use(express.json({ limit: '100kb' }));
app.use(jsonDepthMiddleware(7));
app.use(enforceSecurity); // Proteção contra requisições maliciosas
app.use(responseEnveloper); 

// --- 3. VALIDAÇÃO DE SEGURANÇA DE PRODUÇÃO ---
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('CONFIGURAÇÃO FATAL: JWT_SECRET não configurado em produção.');
}

// --- 4. ROTAS ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/perfil', perfilRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/v1/categorias', categoriasRoutes);
app.use('/api/v1/saude', healthRoutes);
app.use('/api/v1/denuncias', denunciasRoutes);

// --- 5. FALLBACK E ERROS ---
app.all('*', (req, _res, next) => next(AppError.notFound(`Rota ${req.originalUrl} não existe.`)));
app.use(tratadorDeErros);

// --- 6. INICIALIZAÇÃO ---
const iniciarServidor = async () => {
    try {
        app.listen(Number(PORT), '0.0.0.0', () => {
            logger.info(`Servidor rodando na porta ${PORT}`, { evento: 'SERVER_STARTED' });
        });

        await iniciarMonitoramentoSMTP();
        
        cron.schedule('0 * * * *', () => {
            logger.info("Executando tarefa agendada: Limpeza de Contas Expiradas", { evento: 'JOB_CLEAN_EXPIRED_ACCOUNTS_STARTED' });
            limparContasExpiradas(); 
        }, { timezone: process.env.TZ || "America/Sao_Paulo" });
        
        logger.info("Agendador de tarefas iniciado", { evento: 'TASK_SCHEDULER_STARTED' });
        
    } catch (err) {
        logger.error("Falha fatal ao iniciar servidor", { error: err });
        process.exit(1);
    }
};

iniciarServidor();