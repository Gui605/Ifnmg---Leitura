// 1. Atualize o import
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { Request, Response, RequestHandler } from 'express'; // 2. Adicione Response aqui
import { AppError } from '../utils/AppError';
import { ErrorCodes } from '../../errors/ErrorCodes';

const createRateLimiter = (
    maxRequests: number, 
    windowMinutes: number, 
    customMessage: string,
    useIdentity: boolean = true
): RequestHandler => { 
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000, 
        max: maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        // 3. Atualize o keyGenerator para aceitar 'res' e usar o helper
        keyGenerator: (req: Request, res: Response) => {
            if (useIdentity && (req as any).perfil_id) {
                return String((req as any).perfil_id);
            }
            // O 'as any' resolve o conflito de tipos entre bibliotecas diferentes
            return ipKeyGenerator(req as any, res as any);
        },
        handler: (req, res, next) => {
            next(AppError.rateLimit(customMessage));
        },
    }); 
};

// --- Modelos de Limitadores Reutilizáveis ---

/**
 * 🛡️ 1. authActionLimiter: Proteção para Registro e Recuperação
 * Bloqueia ataques de inundação de e-mail e criação massiva de contas (5 tentativas por 15min).
 */
export const limitadorRegistro = createRateLimiter(
    20, 
    15,
    'Muitas tentativas de registro detectadas. Tente novamente mais tarde.',
    false
);

/**
 * 🛡️ 2. loginLimiter: Proteção contra Força Bruta (Brute Force)
 * Bloqueia tentativas sequenciais de adivinhação de senhas (10 tentativas por 5min).
 */
export const limitadorLogin = createRateLimiter(
    15, 
    5, 
    'Limite de tentativas de login excedido. Tente novamente em 5 minutos.',
    false
);

/**
 * 🛡️ 3. limitadorSaude: Proteção para Endpoint de Health Check
 * Permite monitoramento frequente (30 req/min) mas bloqueia abusos.
 */
export const limitadorSaude = createRateLimiter(
    30,
    1,
    'Muitas verificações de saúde. Reduza a frequência do monitoramento.',
    false
);

export const limitadorEngajamento = createRateLimiter(
    10,
    1,
    'Muitas ações de engajamento em curto intervalo. Aguarde um momento.',
    true
);

export const limitadorLeitura = createRateLimiter(
    200,
    1,
    'Muitas requisições de leitura em curto intervalo. Aguarde um momento.',
    true
);