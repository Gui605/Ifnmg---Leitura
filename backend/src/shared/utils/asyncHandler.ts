// backend/src/shared/utils/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * 💡 EXPLICAÇÃO SÊNIOR:
 * Este wrapper elimina a necessidade de usar try/catch em todos os Controllers.
 * Se uma Promise falhar (rejeitar), o .catch() captura o erro e chama o next(error),
 * enviando-o automaticamente para o seu errorHandler.middleware.ts.
 */

type AsyncController = (
    req: Request<any, any, any, any>, 
    res: Response, 
    next: NextFunction
) => Promise<any>;

export const tratarAssincrono = (fn: AsyncController): RequestHandler => 
    (req, res, next) => {
        // Resolvemos a função e, se houver erro, mandamos direto para o next()
        Promise.resolve(fn(req, res, next)).catch(next);
    };
