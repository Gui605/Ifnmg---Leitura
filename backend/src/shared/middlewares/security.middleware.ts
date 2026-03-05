import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ErrorCodes } from '../../errors/ErrorCodes';

/**
 * Middleware de Segurança de Infraestrutura
 * Protege contra acessos não seguros ou hosts inválidos.
 */
export const enforceSecurity = (req: Request, _res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'production') {
        // 1. HTTPS Enforcer
        const proto = req.headers['x-forwarded-proto'];
        const isSecure = req.secure || (typeof proto === 'string' ? proto === 'https' : false);
        if (!isSecure) {
            return next(new AppError('Conexão segura (HTTPS) é obrigatória.', 403, ErrorCodes.FORBIDDEN));
        }

        // 2. Host Validation
        const apiUrl = process.env.API_URL;
        if (apiUrl) {
            try {
                const u = new URL(apiUrl);
                if ((req.headers.host || '') !== u.host) {
                    return next(new AppError('Host não autorizado.', 403, ErrorCodes.FORBIDDEN));
                }
            } catch {
                return next(new AppError('Configuração de API_URL inválida.', 500, ErrorCodes.INTERNAL_ERROR));
            }
        }
    }
    next();
};