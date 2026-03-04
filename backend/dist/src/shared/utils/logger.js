"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const WHITELIST = new Set([
    'id', '_id', 'uuid', 'requestid', 'requestId', 'correlationid', 'correlationId',
    'createdat', 'createdAt', 'updatedat', 'updatedAt', 'timestamp', 'data_criacao',
    'status', 'code', 'errorcode', 'errorCode', 'level', 'message', 'path', 'method', 'count', 'versao',
    'entidade', 'feature', 'contexto',
    'ms', 'slow', 'duration', 'tempo_execucao',
    'evento', 'acao', 'operacao',
    'total', 'passed', 'failed', 'sucesso', 'erro_count'
]);
function isWhitelistedKey(k) {
    const kl = k.toLowerCase();
    return WHITELIST.has(k) || WHITELIST.has(kl);
}
function isRecord(val) {
    return typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Error) && !(val instanceof Date);
}
function maskValue(value, seen) {
    if (value === null || value === undefined)
        return value;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
        return '[MASKED]';
    if (typeof value === 'function')
        return '[MASKED]';
    if (value instanceof Error) {
        const out = { name: value.name, message: value.message };
        if (process.env.NODE_ENV !== 'production')
            out.stack = value.stack;
        return out;
    }
    if (Array.isArray(value)) {
        return value.map((v) => maskValue(v, seen));
    }
    if (isRecord(value)) {
        if (seen.has(value))
            return '[CIRCULAR]';
        seen.add(value);
        const out = {};
        for (const key of Object.keys(value)) {
            const v = value[key];
            if (isWhitelistedKey(key)) {
                out[key] = preserveWhitelisted(v, seen);
            }
            else {
                out[key] = maskValue(v, seen);
            }
        }
        return out;
    }
    return '[MASKED]';
}
function preserveWhitelisted(value, seen) {
    if (value === null || value === undefined)
        return value;
    if (Array.isArray(value))
        return value.map((v) => preserveWhitelisted(v, seen));
    if (isRecord(value))
        return maskObject(value, seen);
    return value;
}
function maskObject(input, seen) {
    if (input === null || input === undefined)
        return input;
    if (Array.isArray(input))
        return input.map((v) => maskObject(v, seen));
    if (isRecord(input)) {
        if (seen.has(input))
            return '[CIRCULAR]';
        seen.add(input);
        const out = {};
        for (const key of Object.keys(input)) {
            const v = input[key];
            if (isWhitelistedKey(key)) {
                out[key] = preserveWhitelisted(v, seen);
            }
            else {
                out[key] = maskValue(v, seen);
            }
        }
        return out;
    }
    return maskValue(input, seen);
}
function maskSensitiveData(input) {
    const seen = new WeakSet();
    return maskObject(input, seen);
}
function write(level, message, context) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
    };
    if (isRecord(context)) {
        const { requestId, ...rest } = context;
        if (requestId)
            entry.requestId = requestId;
        const filtered = Object.fromEntries(Object.entries(rest).filter(([key]) => !['authorization', 'token', 'senha', 'password', 'headers'].includes(key.toLowerCase())));
        const masked = maskSensitiveData(filtered);
        if (isRecord(masked) && Object.keys(masked).length > 0)
            entry.context = masked;
    }
    const line = JSON.stringify(entry);
    if (level === 'info')
        console.log(line);
    else if (level === 'warn')
        console.warn(line);
    else
        console.error(line);
}
exports.logger = {
    info: (message, context) => write('info', message, context),
    warn: (message, context) => write('warn', message, context),
    error: (message, context) => write('error', message, context),
};
