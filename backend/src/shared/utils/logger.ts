import pino from 'pino';

const loggerInstance = pino({
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
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    //a extração do requestId para o ROOT do log (Facilita muito o monitoramento)
    const { requestId, ...rest } = context || {};
    loggerInstance.info({ requestId, context: rest }, message);
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    const { requestId, ...rest } = context || {};
    loggerInstance.warn({ requestId, context: rest }, message);
  },
  error: (message: string, context?: Record<string, unknown>) => {
    const { requestId, ...rest } = context || {};
    loggerInstance.error({ requestId, context: rest }, message);
  },
};
