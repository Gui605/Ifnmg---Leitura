"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tratadorDeErros = void 0;
const AppError_1 = require("../utils/AppError");
const ErrorCodes_1 = require("../../errors/ErrorCodes");
const zod_1 = require("zod");
const crypto_1 = require("crypto");
const http_1 = __importDefault(require("http"));
const logger_1 = require("../utils/logger");
function isExpressErrorLike(err) {
    return typeof err === 'object' && err !== null;
}
const tratadorDeErros = (err, req, res, _) => {
    const requestId = req.requestId || (0, crypto_1.randomUUID)();
    const timestamp = new Date().toISOString();
    let statusCode = 500;
    let errorCode = ErrorCodes_1.ErrorCodes.INTERNAL_ERROR;
    let message = 'Erro interno do servidor.';
    const baseError = isExpressErrorLike(err) ? err : null;
    if (baseError) {
        statusCode = baseError.statusCode || baseError.status || 500;
        errorCode = baseError.errorCode || ErrorCodes_1.ErrorCodes.INTERNAL_ERROR;
        if (statusCode < 500 && baseError.message) {
            message = baseError.message;
        }
    }
    const reason = http_1.default.STATUS_CODES[statusCode] || 'Error';
    /**
     * =================================
     * AppError (Fonte principal)
     * =================================
     */
    if (err instanceof AppError_1.AppError) {
        statusCode = err.statusCode;
        errorCode = err.errorCode;
        message = err.message;
        logByStatus(statusCode, req, requestId, errorCode);
        return res.status(statusCode).json({
            timestamp,
            status: statusCode,
            error: reason,
            errorCode,
            message,
            path: req.originalUrl,
            requestId
        });
    }
    /**
     * =================================
     * JSON Malformado
     * =================================
     */
    if (err instanceof SyntaxError && baseError && 'body' in baseError) {
        if (baseError.statusCode === 400 || baseError.status === 400) {
            logger_1.logger.warn('JSON malformado', {
                evento: 'DX_JSON_SYNTAX',
                requestId,
                path: req.path,
                ip: req.ip
            });
            return res.status(400).json({
                timestamp,
                status: 400,
                error: 'Bad Request',
                errorCode: ErrorCodes_1.ErrorCodes.INVALID_JSON_FORMAT,
                message: 'O corpo da requisição está com JSON malformado. Verifique vírgulas extras, chaves ou aspas.',
                path: req.originalUrl,
                requestId
            });
        }
    }
    /**
     * =================================
     * Payload vazio
     * =================================
     */
    if (baseError) {
        if (baseError.type === 'entity.verify.failed' ||
            baseError.message?.includes('body is required')) {
            logger_1.logger.warn('Payload vazio', {
                evento: 'DX_EMPTY_PAYLOAD',
                requestId,
                path: req.path
            });
            return res.status(400).json({
                timestamp,
                status: 400,
                error: 'Bad Request',
                errorCode: ErrorCodes_1.ErrorCodes.EMPTY_PAYLOAD,
                message: 'O corpo da requisição não pode estar vazio.',
                path: req.originalUrl,
                requestId
            });
        }
        /**
         * Content-Type inválido
         */
        if (baseError.statusCode === 415 ||
            baseError.message?.includes('Content-Type') ||
            baseError.type === 'charset.unsupported') {
            logger_1.logger.warn('Content-Type inválido', {
                evento: 'DX_INVALID_CONTENT_TYPE',
                requestId,
                path: req.path
            });
            return res.status(415).json({
                timestamp,
                status: 415,
                error: 'Unsupported Media Type',
                errorCode: ErrorCodes_1.ErrorCodes.INVALID_CONTENT_TYPE,
                message: 'Content-Type inválido. Utilize "application/json".',
                path: req.originalUrl,
                requestId
            });
        }
    }
    /**
     * =================================
     * Validação Zod
     * =================================
     */
    if (err instanceof zod_1.ZodError) {
        const sourceObj = req.method === 'GET' ? req.query : req.body;
        const getByPath = (obj, path) => {
            try {
                if (!obj)
                    return undefined;
                return path.reduce((acc, key) => {
                    if (typeof acc !== 'object' || acc === null)
                        return undefined;
                    return acc[String(key)];
                }, obj);
            }
            catch {
                return undefined;
            }
        };
        const details = err.issues.map((issue) => {
            const extended = issue;
            // FILTRO DE SEGURANÇA: Garante que o path seja apenas string ou number
            const safePath = issue.path.filter((p) => typeof p === 'string' || typeof p === 'number');
            const raw = getByPath(sourceObj, safePath);
            return {
                field: safePath.join('.') || 'body',
                rule: issue.code,
                expected: extended.expected,
                received: extended.received ?? raw
            };
        });
        return res.status(400).json({
            timestamp,
            status: 400,
            error: 'Bad Request',
            errorCode: ErrorCodes_1.ErrorCodes.FIELD_VALIDATION,
            message: 'Falha na validação dos campos.',
            path: req.originalUrl,
            requestId,
            details
        });
    }
    /**
     * =================================
     * Prisma
     * =================================
     */
    if (baseError) {
        if (baseError.code === 'P2002') {
            statusCode = 409;
            errorCode = ErrorCodes_1.ErrorCodes.EMAIL_ALREADY_EXISTS;
        }
        if (baseError.code === 'P2025') {
            statusCode = 404;
            errorCode = ErrorCodes_1.ErrorCodes.RESOURCE_NOT_FOUND;
        }
        /**
         * JWT
         */
        if (baseError.name === 'JsonWebTokenError') {
            statusCode = 401;
            errorCode = ErrorCodes_1.ErrorCodes.UNAUTHENTICATED;
        }
        if (baseError.name === 'TokenExpiredError') {
            statusCode = 401;
            errorCode = ErrorCodes_1.ErrorCodes.TOKEN_EXPIRED;
        }
    }
    logByStatus(statusCode, req, requestId, errorCode);
    return res.status(statusCode).json({
        timestamp,
        status: statusCode,
        error: reason,
        errorCode,
        message,
        path: req.originalUrl,
        requestId
    });
};
exports.tratadorDeErros = tratadorDeErros;
function logByStatus(statusCode, req, requestId, errorCode) {
    if (statusCode >= 500) {
        logger_1.logger.error('Erro interno do servidor', {
            evento: 'SERVER_ERROR',
            requestId,
            method: req.method,
            path: req.path,
            errorCode
        });
    }
    else if (statusCode === 401 || statusCode === 403) {
        logger_1.logger.warn('Alerta de segurança', {
            evento: 'SECURITY_WARNING',
            requestId,
            method: req.method,
            path: req.path,
            ip: req.ip,
            errorCode
        });
    }
}
