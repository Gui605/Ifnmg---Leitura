import jwt from 'jsonwebtoken';
import { TokenPayload, TokenPayloadSchema } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '4h'; 

export function obterSegredoJwt(): string {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET não configurado.');
    }
    return JWT_SECRET;
}

/**
 * Gera um Token Web JSON (JWT) para o usuário autenticado.
 * Recebe o payload tipado conforme o contrato do sistema.
 */
export function gerarToken(payload: TokenPayload): string {
    // Removemos propriedades automáticas como 'iat' e 'exp' se existirem no objeto
    // para evitar conflitos com o novo token que será gerado.
    const { iat, exp, ...cleanPayload } = payload;

    return jwt.sign(cleanPayload, obterSegredoJwt(), { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica e decodifica o Token JWT.
 * O erro disparado aqui será capturado pelo authMiddleware ou optionalAuthMiddleware.
 */
export function verificarToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, obterSegredoJwt());
    const payload = TokenPayloadSchema.parse(decoded);
    return payload;
}
