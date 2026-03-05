"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limpezaDeEntrada = limpezaDeEntrada;
const AppError_1 = require("./AppError");
const ErrorCodes_1 = require("../../errors/ErrorCodes");
const logger_1 = require("./logger");
// Regex que remove caracteres de controle, mantendo TAB (9) e LF/Newline (10)
// Removemos caracteres de 00-08, 0B, 0C, 0E-1F e 7F
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
function containsNullByte(s) {
    return s.includes('\0');
}
function limpezaDeEntrada(dados, requestId) {
    // 1. Strings: Segurança de infraestrutura
    if (typeof dados === 'string') {
        if (containsNullByte(dados)) {
            logger_1.logger.warn('SECURITY_SANITIZE_ALERT: Null Byte detectado', {
                evento: 'SECURITY_ALERT',
                requestId
            });
            throw new AppError_1.AppError('Caractere inválido detectado', 400, ErrorCodes_1.ErrorCodes.BAD_REQUEST);
        }
        return dados.replace(CONTROL_CHARS_REGEX, '');
    }
    // 2. Arrays: Recursividade
    if (Array.isArray(dados)) {
        return dados.map((item) => limpezaDeEntrada(item, requestId));
    }
    // 3. Objetos: Recursividade (ignora instâncias como Date ou buffers)
    if (dados !== null && typeof dados === 'object' && !(dados instanceof Date)) {
        const novo = {};
        for (const key in dados) {
            if (Object.prototype.hasOwnProperty.call(dados, key)) {
                novo[key] = limpezaDeEntrada(dados[key], requestId);
            }
        }
        return novo;
    }
    // 4. Primitivos (números, booleanos, null): Retorna como está
    return dados;
}
