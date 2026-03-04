"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
// O caminho foi ajustado para subir um nível e entrar na pasta errors
const ErrorCodes_1 = require("../../errors/ErrorCodes");
/**
 * 💡 PADRÃO ENTERPRISE: Classe Global de Exceções
 * Centraliza a criação de erros operacionais, garantindo que o
 * Frontend receba sempre um contrato previsível (Status + Código de Erro Localizado).
 */
class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        // Garante que o stack trace (rastro do erro) aponte para onde o AppError foi instanciado
        Error.captureStackTrace(this, this.constructor);
    }
    // 🏎️ Factory methods: Atalhos que injetam automaticamente o código de erro em português
    /** 🔴 Erro 400: REQUISICAO_MALFORMADA */
    static badRequest(msg) {
        return new AppError(msg, 400, ErrorCodes_1.ErrorCodes.BAD_REQUEST);
    }
    /** 🔑 Erro 401: CREDENCIAIS_INVALIDAS */
    static unauthorized(msg) {
        return new AppError(msg, 401, ErrorCodes_1.ErrorCodes.UNAUTHENTICATED);
    }
    /** 🔍 Erro 404: RECURSO_NAO_ENCONTRADO */
    static notFound(msg) {
        return new AppError(msg, 404, ErrorCodes_1.ErrorCodes.RESOURCE_NOT_FOUND);
    }
    /** ⚔️ Erro 409: EMAIL_JA_CADASTRADO (Conflito) */
    static conflict(msg) {
        return new AppError(msg, 409, ErrorCodes_1.ErrorCodes.EMAIL_ALREADY_EXISTS);
    }
    /** 📝 Erro 422: ERRO_DE_VALIDACAO */
    static validation(msg) {
        return new AppError(msg, 422, ErrorCodes_1.ErrorCodes.VALIDATION_ERROR);
    }
    /** ⏳ Erro 429: LIMITE_DE_REQUISICOES_EXCEDIDO */
    static rateLimit(msg) {
        return new AppError(msg, 429, ErrorCodes_1.ErrorCodes.RATE_LIMIT_EXCEEDED);
    }
}
exports.AppError = AppError;
