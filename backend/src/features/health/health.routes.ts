import { Router } from 'express';
import healthController from './health.controller';
import { limitadorSaude } from '../../shared/middlewares/rateLimiter';

const healthRoutes = Router();

/**
 * 💡 PADRÃO ENTERPRISE: Rota de Health Check
 * Pública, mas protegida por Rate Limiter específico.
 */

healthRoutes.get(
    '/', 
    limitadorSaude, 
    healthController.checkHealth
);

/**
 * 💡 LIVENESS PROBE:
 * Endpoint ultra-leve para Kubernetes/Load Balancers verificarem se o processo está rodando.
 * Não toca em banco ou serviços externos.
 */
healthRoutes.get('/live', healthController.checkLiveness);

export default healthRoutes;
