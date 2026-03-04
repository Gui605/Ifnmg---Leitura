"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = void 0;
/**
 * Dicionário Global de Códigos de Erro
 * Esse Enum é o "idioma único" entre o Backend e o Frontend.
 * Todas as mensagens de erro do sistema devem estar mapeadas aqui.
 */
var ErrorCodes;
(function (ErrorCodes) {
    // --- Autenticação ---
    ErrorCodes["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ErrorCodes["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ErrorCodes["TOKEN_INVALID"] = "TOKEN_INVALID";
    ErrorCodes["FORBIDDEN"] = "FORBIDDEN";
    ErrorCodes["UNAUTHENTICATED"] = "UNAUTHENTICATED";
    // --- Usuário e Cadastro ---
    ErrorCodes["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    ErrorCodes["EMAIL_ALREADY_EXISTS"] = "EMAIL_ALREADY_EXISTS";
    // --- Validação e Entrada ---
    ErrorCodes["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCodes["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorCodes["FIELD_VALIDATION"] = "FIELD_VALIDATION";
    ErrorCodes["INVALID_JSON_FORMAT"] = "INVALID_JSON_FORMAT";
    ErrorCodes["EMPTY_PAYLOAD"] = "EMPTY_PAYLOAD";
    ErrorCodes["INVALID_CONTENT_TYPE"] = "INVALID_CONTENT_TYPE";
    ErrorCodes["INVALID_JSON_STRUCTURE"] = "INVALID_JSON_STRUCTURE";
    // --- Infraestrutura e Sistema ---
    ErrorCodes["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ErrorCodes["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    ErrorCodes["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCodes["CLEANUP_JOB_FAILED"] = "CLEANUP_JOB_FAILED";
    // --- Serviços Externos ---
    ErrorCodes["EMAIL_SERVICE_UNAVAILABLE"] = "EMAIL_SERVICE_UNAVAILABLE";
    ErrorCodes["DATABASE_CONNECTION_FAILED"] = "DATABASE_CONNECTION_FAILED";
})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
