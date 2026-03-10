//backend/src/shared/middlewares/responseEnveloper.middleware.ts
import { Request, Response, NextFunction } from 'express';

/**
 * 🛡️ MIDDLEWARE DE ENVELOPAMENTO DE RESPOSTA
 * Sobrescreve o método res.json para garantir que todas as respostas
 * de sucesso sigam o contrato { status, message, data, meta }.
 */
export const responseEnveloper = (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (body: any) {
        // Se já for um envelope completo ou se for um erro (que já é envelopado pelo errorHandler), não mexe.
        // O errorHandler do backend envia timestamp, status, error, errorCode, etc.
        // O envelope de sucesso padrão é { status, message, data, meta }.
        
        const isAlreadyEnveloped = body && 
            typeof body === 'object' && 
            'status' in body && 
            ('data' in body || 'errorCode' in body);

        if (isAlreadyEnveloped) {
            return originalJson.call(this, body);
        }

        // Se for uma resposta de sucesso que não está envelopada, envolvemos.
        // Note: Se o body for nulo ou não for objeto, ele vira o 'data'.
        const envelopedBody = {
            status: 'success',
            message: 'Operação realizada com sucesso.',
            data: body !== undefined ? body : null,
            meta: null
        };

        // Garante que data e meta existam se o body for um objeto parcial
        if (body && typeof body === 'object') {
            if (body.message) envelopedBody.message = body.message;
            if (body.data !== undefined) envelopedBody.data = body.data;
            if (body.meta !== undefined) envelopedBody.meta = body.meta;
            
            // Se o objeto original tinha status, preservamos (ex: 'success')
            if (body.status) envelopedBody.status = body.status;
        }

        return originalJson.call(this, envelopedBody);
    };

    next();
};
