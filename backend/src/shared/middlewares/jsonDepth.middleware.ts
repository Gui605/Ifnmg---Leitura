import { RequestHandler } from 'express';
import { AppError } from '../utils/AppError';
import { ErrorCodes } from '../../errors/ErrorCodes';

/**
 * Calcula a profundidade máxima de um objeto recursivamente.
 * Utiliza um WeakSet para detectar referências circulares (prevenção de DoS).
 */
function calcularProfundidade(input: unknown, seen: WeakSet<object>): number {
    if (input === null || typeof input !== 'object') return 0;
    
    // Proteção contra loops infinitos (referências circulares)
    if (seen.has(input)) return 0;
    seen.add(input);

    let max = 0;
    // Pega todos os valores (seja Array ou Objeto simples)
    const values = Object.values(input);

    for (const val of values) {
        const d = calcularProfundidade(val, seen);
        if (d > max) max = d;
    }
    
    return 1 + max;
}

/**
 * Middleware de Segurança: Limite de Profundidade JSON
 * Protege o servidor contra ataques de "JSON Bomb" ( payloads profundamente aninhados 
 * que poderiam causar estouro de pilha ou exaustão de CPU).
 * * @param maxDepth Profundidade máxima permitida (Padrão: 7)
 */
export const jsonDepthMiddleware = (maxDepth: number = 7): RequestHandler => {
    return (req, _res, next) => {
        try {
            // Se não houver corpo, não há profundidade para checar
            if (!req.body) return next();

            const depth = calcularProfundidade(req.body, new WeakSet<object>());
            
            if (depth > maxDepth) {
                return next(new AppError(
                    'Estrutura de dados excessivamente complexa.', 
                    400, 
                    ErrorCodes.INVALID_JSON_STRUCTURE
                ));
            }
            
            return next();
        } catch (error) {
            // Fallback de segurança em caso de erro na análise
            return next(new AppError(
                'Falha ao validar estrutura do payload.', 
                400, 
                ErrorCodes.INVALID_JSON_FORMAT
            ));
        }
    };
};