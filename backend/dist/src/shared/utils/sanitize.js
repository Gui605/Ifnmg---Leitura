"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limpezaDeEntrada = limpezaDeEntrada;
const AppError_1 = require("./AppError");
const ErrorCodes_1 = require("../../errors/ErrorCodes");
const logger_1 = require("./logger");
function containsNullByte(s) {
    return s.includes('\0');
}
function stripControlChars(s) {
    let out = '';
    for (let i = 0; i < s.length; i++) {
        const code = s.charCodeAt(i);
        if (code === 9 || code === 10) {
            out += s[i];
            continue;
        }
        if (code >= 32 && code !== 127) {
            out += s[i];
        }
    }
    return out;
}
function escapeHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\//g, '&#x2F;');
}
function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
function sanitizeString(valor, req) {
    const dados = typeof valor === 'string' ? valor : String(valor);
    if (containsNullByte(dados)) {
        logger_1.logger.warn('Null Byte detectado na entrada', { evento: 'SECURITY_SANITIZE_ALERT', path: req?.originalUrl, ip: req?.ip, requestId: req?.requestId, errorCode: ErrorCodes_1.ErrorCodes.BAD_REQUEST });
        throw new AppError_1.AppError('Caractere inválido detectado', 400, ErrorCodes_1.ErrorCodes.BAD_REQUEST);
    }
    const semControle = stripControlChars(dados);
    return escapeHtml(semControle);
}
function sanitizeArray(dados, req) {
    return dados.map((item) => limpezaDeEntrada(item, req));
}
function sanitizeObject(dados, req) {
    const novoObjeto = {};
    for (const key in dados) {
        if (Object.prototype.hasOwnProperty.call(dados, key)) {
            novoObjeto[key] = limpezaDeEntrada(dados[key], req);
        }
    }
    return novoObjeto;
}
function limpezaDeEntrada(dados, req) {
    if (dados === null || dados === undefined)
        return null;
    if (dados instanceof Date)
        return dados;
    if (typeof dados === 'string') {
        return sanitizeString(dados, req);
    }
    if (typeof dados === 'number' || typeof dados === 'boolean') {
        return dados;
    }
    if (Array.isArray(dados)) {
        return sanitizeArray(dados, req);
    }
    if (isPlainObject(dados)) {
        return sanitizeObject(dados, req);
    }
    return sanitizeString(String(dados), req);
}
