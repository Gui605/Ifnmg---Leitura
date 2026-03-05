"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const loggerInstance = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || 'info',
    // Redação automática: mascara tudo que for sensível, globalmente
    redact: {
        paths: [
            'context.senha', 'context.password', 'context.token',
            'context.authorization', 'context.headers.*', '*.senha', '*.password'
        ],
        censor: '[MASKED]'
    },
    // Metadados úteis para ambientes distribuídos (Docker/K8s)
    formatters: {
        level: (label) => ({ level: label }),
        bindings: (bindings) => ({ pid: bindings.pid, host: bindings.hostname }),
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
});
exports.logger = {
    info: (message, context) => {
        //a extração do requestId para o ROOT do log (Facilita muito o monitoramento)
        const { requestId, ...rest } = context || {};
        loggerInstance.info({ requestId, context: rest }, message);
    },
    warn: (message, context) => {
        const { requestId, ...rest } = context || {};
        loggerInstance.warn({ requestId, context: rest }, message);
    },
    error: (message, context) => {
        const { requestId, ...rest } = context || {};
        loggerInstance.error({ requestId, context: rest }, message);
    },
};
