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

/**
 * 🧪 TESTE DE CONEXÃO (Diagnóstico Isolado):
 * Serve para confirmar se o CORS e a rede estão OK sem interferência de auth.
 */
healthRoutes.get('/ping', (req, res) => {
    res.status(200).json({ message: 'Conexão OK!' });
});

export default healthRoutes;
