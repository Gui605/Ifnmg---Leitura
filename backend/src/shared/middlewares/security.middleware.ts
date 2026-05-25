import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ErrorCodes } from '../../errors/ErrorCodes';

/*
Middleware de segurança de infraestrutura
Protege contra acessos não seguros ou hosts inválidos.
 */
export const enforceSecurity = (req: Request, _res: Response, next: NextFunction) => {
    
    // GUARD: Só aplica restrições estritas de infraestrutura em Produção.
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }

    /* Origatoriedade de HTTPS
    Verifica se a requisição é criptografada. Em ambientes com Proxy Reverso 
    ex: AWS ALB, Cloudflare, Nginx, o SSL é decodificado antes de chegar ao Node.
    */
    const proto = req.headers['x-forwarded-proto'];
    const isSecure = req.secure || (typeof proto === 'string' ? proto === 'https' : false);
    if (!isSecure) {
        return next(new AppError('Conexão segura (HTTPS) é obrigatória.', 403, ErrorCodes.FORBIDDEN));
    }

    /*
    Validação de Host
    Evita ataques de injeção de Host onde o atacante manipula o cabeçalho 'Host'.
    Garante que a API só responda se for chamada exatamente pelo domínio configurado.
     */
    const apiUrl = process.env.API_URL;
    if (apiUrl) {
        try {
            const u = new URL(apiUrl);
            if ((req.headers.host || '') !== u.host) {
                return next(new AppError('Host não autorizado.', 403, ErrorCodes.FORBIDDEN));
            }
        } catch {
            return next(AppError.config('Configuração de API_URL inválida.'));
        }
    }
    
    next();
};
