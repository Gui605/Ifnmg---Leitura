import { Router } from 'express';
import authController from './auth.controller';
import { limitadorRegistro, limitadorLogin, limitadorSaude } from '../../shared/middlewares/rateLimiter';
import { validate } from '../../shared/middlewares/validate.middleware';
import { middlewareAutenticacao } from '../../shared/middlewares/authMiddleware';
import { RegistrarSchema, LoginSchema, SolicitarRecuperacaoSchema, RedefinirSenhaSchema } from '../../shared/types/auth.types';

/**
 * 💡 PADRÃO ENTERPRISE BLINDADO:
 * 1. Rate Limiting (Proteção de Infraestrutura)
 * 2. Schema Validation (Proteção de Contrato e Integridade)
 * 3. Controller (Lógica de Negócio)
 */

const router = Router();

// --- Registro e Ativação ---
// 🛡️ RegistrarSchema.strict() impede a injeção de campos como 'role' ou 'is_admin'
router.post(
    '/registrar', 
    limitadorRegistro,
    validate({ body: RegistrarSchema }),
    authController.registrar
);

router.get('/confirmar', authController.confirmarEmail); 

// --- Autenticação ---
// 🛡️ LoginSchema garante que o payload contenha apenas email e senha válidos
router.post(
    '/logar', 
    limitadorLogin,
    validate({ body: LoginSchema }),
    authController.logar
);

// --- Recuperação de Senha ---
router.post(
    '/solicitar-recuperacao', 
    limitadorRegistro,
    validate({ body: SolicitarRecuperacaoSchema }),
    authController.solicitarRecuperacao
);
router.post(
    '/redefinir-senha', 
    limitadorRegistro, 
    validate({ body: RedefinirSenhaSchema }),
    authController.redefinirSenha
);

// --- Logout Global (revoga todas as sessões ativas) ---
router.post(
    '/logout-all',
    middlewareAutenticacao,
    authController.logoutAll
);

export default router;
