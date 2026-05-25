import { Router } from 'express';
import healthController from './health.controller';
import { limitadorSaude } from '../../shared/middlewares/rateLimiter';

const healthRoutes = Router();

/**
 * Rota de Health Check
 * pública, mas protegida por Rate Limiter específico.
 */

healthRoutes.get(
    '/', 
    limitadorSaude, 
    healthController.checkHealth
);

//Endpoint bem leve para verificar se o processo está rodando.
// Não envolve banco ou serviços externos.
healthRoutes.get('/live', healthController.checkLiveness);

// Esse endpoint serve para confirmar se o CORS e a rede estão OK sem interferência de auth.
healthRoutes.get('/ping', (req, res) => {
    res.status(200).json({ message: 'Conexão OK!' });
});

export default healthRoutes;
