//backend/src/features/auth/auth.routes.ts
import { Router } from 'express';
import authController from './auth.controller';
import { limitadorRegistro, limitadorLogin, limitadorSaude } from '../../shared/middlewares/rateLimiter';
import { validate } from '../../shared/middlewares/validate.middleware';
import { middlewareAutenticacao } from '../../shared/middlewares/authMiddleware';
import { RegistrarSchema, LoginSchema, SolicitarRecuperacaoSchema, RedefinirSenhaSchema } from '../../shared/types/auth.types';


const router = Router();

// Registro e Ativação
router.post(
    '/registrar', 
    limitadorRegistro,
    validate({ body: RegistrarSchema }),
    authController.registrar
);

router.get('/confirmar', authController.confirmarEmail); 

// Autenticação
router.post(
    '/logar', 
    limitadorLogin,
    validate({ body: LoginSchema }),
    authController.logar
);

// Recuperação de Senha
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

// Logout Global - revoga todas as sessões ativas
router.post(
    '/logout-all',
    middlewareAutenticacao,
    authController.logoutAll
);

export default router;
