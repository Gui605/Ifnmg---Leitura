import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ErrorCodes } from '../../errors/ErrorCodes'; 
import { ZodError } from 'zod';
import { randomUUID } from 'crypto';
import http from 'http';
import { logger } from '../utils/logger';
import { ExpressErrorLike, ZodIssueExtended } from '../types/error.types';

function isExpressErrorLike(err: unknown): err is ExpressErrorLike {
  return typeof err === 'object' && err !== null;
}

/**
 * 🛡️ MIDDLEWARE GLOBAL DE TRATAMENTO DE ERROS
 * Centraliza a captura de falhas: Prisma, JWT, AppError e Erros de Sintaxe.
 */
export const tratadorDeErros = (
  err: unknown,
  req: Request,
  res: Response,
  _: NextFunction
) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const requestId = req.requestId || randomUUID();
  const timestamp = new Date().toISOString();

  let statusCode = 500;
  let errorCode = ErrorCodes.INTERNAL_ERROR;
  let message = 'Erro interno do servidor.';
  
  const baseError = isExpressErrorLike(err) ? err : null;

  if (baseError) {
    statusCode = baseError.statusCode || baseError.status || 500;
    errorCode = (baseError.errorCode as ErrorCodes) || ErrorCodes.INTERNAL_ERROR;
    message = statusCode >= 500 ? 'Erro interno do servidor.' : (baseError.message || 'Falha na requisição.');
  }

  const reason = http.STATUS_CODES[statusCode] || 'Error';

  // ✅ Fonte Única da Verdade para AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;

    if (statusCode >= 500) {
      logger.error('Erro interno do servidor', { evento: 'SERVER_ERROR', requestId, method: req.method, path: req.path, errorCode });
    } else if (statusCode === 401 || statusCode === 403) {
      logger.warn('Alerta de segurança', { evento: 'SECURITY_WARNING', requestId, method: req.method, path: req.path, ip: req.ip, errorCode });
    }

    const body = {
      timestamp,
      status: statusCode,
      error: http.STATUS_CODES[statusCode] || reason,
      errorCode,
      message,
      path: req.originalUrl,
      requestId
    };
    return res.status(statusCode).json(body);
  }

  // 🛡️ Blindagem DX: Erros de Parsing e Entrada
  if (err instanceof SyntaxError && baseError && 'body' in baseError) {
    if (baseError.statusCode === 400 || baseError.status === 400) {
      statusCode = 400;
      errorCode = ErrorCodes.INVALID_JSON_FORMAT;
      message = 'O corpo da requisição (JSON) está malformado. Verifique vírgulas extras, chaves ou aspas faltando.';
      logger.warn('Erro de Sintaxe JSON (DX)', { evento: 'DX_JSON_SYNTAX', requestId, path: req.path, ip: req.ip });
    }
  }

  if (baseError) {
    // Captura de Payload Vazio
    if (baseError.type === 'entity.verify.failed' || baseError.message?.includes('body is required')) {
      statusCode = 400;
      errorCode = ErrorCodes.EMPTY_PAYLOAD;
      message = 'O corpo da requisição não pode estar vazio.';
      logger.warn('Payload Vazio (DX)', { evento: 'DX_EMPTY_PAYLOAD', requestId, path: req.path });
    }

    // Content-Type Inválido
    if (baseError.statusCode === 415 || baseError.message?.includes('Content-Type') || baseError.type === 'charset.unsupported') {
      statusCode = 415;
      errorCode = ErrorCodes.INVALID_CONTENT_TYPE;
      message = 'O tipo de conteúdo enviado não é suportado. Certifique-se de usar o header "Content-Type: application/json".';
      logger.warn('Content-Type Inválido (DX)', { evento: 'DX_INVALID_CONTENT_TYPE', requestId, path: req.path });
    }
  }

  if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = ErrorCodes.FIELD_VALIDATION;
    message = 'Falha na validação dos campos fornecidos.';
    const sourceObj = req.method === 'GET' ? req.query : req.body;
    
    const getByPath = (obj: unknown, path: (string | number)[]): unknown => {
      try {
        if (obj === null || obj === undefined) return undefined;
        return path.reduce<unknown>((acc, key) => {
          if (typeof acc !== 'object' || acc === null) return undefined;
          return (acc as Record<string, unknown>)[String(key)];
        }, obj);
      } catch {
        return undefined;
      }
    };

    const details = err.issues.map((issue) => {
      const field = issue.path.join('.') || 'body';
      let rule = 'validation';
      let expected: unknown = undefined;
      let received: unknown = undefined;
      
      const extended = issue as ZodIssueExtended;
      const safePath = (extended.path || []).filter(
        (p): p is string | number => typeof p === 'string' || typeof p === 'number'
      );
      
      const raw = getByPath(sourceObj as Record<string, unknown>, safePath);
      
      switch (issue.code) {
        case 'invalid_type':
          rule = 'type';
          expected = extended.expected;
          received = extended.received;
          break;
        case 'too_small': {
          const t = extended.type;
          if (t === 'string') {
            rule = 'min_length';
            expected = extended.minimum;
            received = typeof raw === 'string' ? raw.length : undefined;
          } else if (t === 'array' || t === 'number') {
            rule = 'min';
            expected = extended.minimum;
            if (t === 'array') received = Array.isArray(raw) ? raw.length : undefined;
            if (t === 'number') {
              const n = Number(raw);
              received = isNaN(n) ? undefined : n;
            }
          }
          break;
        }
        case 'too_big': {
          const t = extended.type;
          if (t === 'string') {
            rule = 'max_length';
            expected = extended.maximum;
            received = typeof raw === 'string' ? raw.length : undefined;
          } else if (t === 'array' || t === 'number') {
            rule = 'max';
            expected = extended.maximum;
            if (t === 'array') received = Array.isArray(raw) ? raw.length : undefined;
            if (t === 'number') {
              const n = Number(raw);
              received = isNaN(n) ? undefined : n;
            }
          }
          break;
        }
        case 'custom':
          rule = 'refine';
          break;
        default:
          rule = issue.code;
      }
      return { field, rule, ...(expected !== undefined && { expected }), ...(received !== undefined && { received }) };
    });

    const body = {
      timestamp,
      status: statusCode,
      error: http.STATUS_CODES[statusCode] || 'Bad Request',
      errorCode,
      message,
      path: req.originalUrl,
      requestId,
      details
    };
    return res.status(statusCode).json(body);
  }

  if (baseError) {
    if (baseError.code === 'P2002') {
      statusCode = 409;
      errorCode = ErrorCodes.EMAIL_ALREADY_EXISTS;
    }

    if (baseError.code === 'P2025') {
      statusCode = 404;
      errorCode = ErrorCodes.RESOURCE_NOT_FOUND;
    }

    if (baseError.name === 'JsonWebTokenError') {
      statusCode = 401;
      errorCode = ErrorCodes.UNAUTHENTICATED;
    }

    if (baseError.name === 'TokenExpiredError') {
      statusCode = 401;
      errorCode = ErrorCodes.TOKEN_EXPIRED;
    }
  }

  if (statusCode >= 500) {
    logger.error('Erro interno do servidor', { evento: 'SERVER_ERROR', requestId, method: req.method, path: req.path, errorCode });
  } else if (statusCode === 401 || statusCode === 403) {
    logger.warn('Alerta de segurança', { evento: 'SECURITY_WARNING', requestId, method: req.method, path: req.path, ip: req.ip, errorCode });
  }

  if (statusCode === 401) {
    errorCode = ErrorCodes.UNAUTHENTICATED;
  }
  if (statusCode === 403) {
    errorCode = ErrorCodes.FORBIDDEN;
  }

  const body = {
    timestamp,
    status: statusCode,
    error: reason,
    errorCode,
    message,
    path: req.originalUrl,
    requestId
  };
  return res.status(statusCode).json(body);
};
