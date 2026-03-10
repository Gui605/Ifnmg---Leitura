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


export const tratadorDeErros = (
  err: unknown,
  req: Request,
  res: Response,
  _: NextFunction
) => {

  const requestId = req.requestId || randomUUID();
  const timestamp = new Date().toISOString();

  let statusCode = 500;
  let errorCode = ErrorCodes.INTERNAL_ERROR;
  let message = 'Erro interno do servidor.';

  const setResponse = (status: number, code: ErrorCodes, msg: string) => {
    statusCode = status;
    errorCode = code;
    message = msg;
  };

  const baseError = isExpressErrorLike(err) ? err : null;

  if (baseError) {
    statusCode = baseError.statusCode || baseError.status || 500;
    errorCode = (baseError.errorCode as ErrorCodes) || ErrorCodes.INTERNAL_ERROR;

    if (statusCode < 500 && baseError.message) {
      message = baseError.message;
    }
  }

  const reason = http.STATUS_CODES[statusCode] || 'Error';

  /**
   * =================================
   * AppError (Fonte principal)
   * =================================
   */

  if (err instanceof AppError) {

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

      logger.warn('JSON malformado', {
        evento: 'DX_JSON_SYNTAX',
        requestId,
        path: req.path,
        ip: req.ip
      });

      return res.status(400).json({
        timestamp,
        status: 400,
        error: 'Bad Request',
        errorCode: ErrorCodes.INVALID_JSON_FORMAT,
        message:
          'O corpo da requisição está com JSON malformado. Verifique vírgulas extras, chaves ou aspas.',
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

    if (
      baseError.type === 'entity.verify.failed' ||
      baseError.message?.includes('body is required')
    ) {

      logger.warn('Payload vazio', {
        evento: 'DX_EMPTY_PAYLOAD',
        requestId,
        path: req.path
      });

      return res.status(400).json({
        timestamp,
        status: 400,
        error: 'Bad Request',
        errorCode: ErrorCodes.EMPTY_PAYLOAD,
        message: 'O corpo da requisição não pode estar vazio.',
        path: req.originalUrl,
        requestId
      });

    }

    /**
     * Content-Type inválido
     */

    if (
      baseError.statusCode === 415 ||
      baseError.message?.includes('Content-Type') ||
      baseError.type === 'charset.unsupported'
    ) {

      logger.warn('Content-Type inválido', {
        evento: 'DX_INVALID_CONTENT_TYPE',
        requestId,
        path: req.path
      });

      return res.status(415).json({
        timestamp,
        status: 415,
        error: 'Unsupported Media Type',
        errorCode: ErrorCodes.INVALID_CONTENT_TYPE,
        message:
          'Content-Type inválido. Utilize "application/json".',
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

  if (err instanceof ZodError) {

    const sourceObj = req.method === 'GET' ? req.query : req.body;

    const getByPath = (obj: unknown, path: (string | number)[]) => {

      try {

        if (!obj) return undefined;

        return path.reduce<unknown>((acc, key) => {

          if (typeof acc !== 'object' || acc === null) return undefined;

          return (acc as Record<string, unknown>)[String(key)];

        }, obj);

      } catch {
        return undefined;
      }

    };


    const details = err.issues.map((issue) => {

      const extended = issue as ZodIssueExtended;
      
      // FILTRO DE SEGURANÇA: Garante que o path seja apenas string ou number
      const safePath = issue.path.filter(
        (p): p is string | number => typeof p === 'string' || typeof p === 'number'
      );

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
      errorCode: ErrorCodes.VALIDATION_ERROR,
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
      setResponse(409, ErrorCodes.EMAIL_ALREADY_EXISTS, 'Este e-mail já está em uso.');
    }

    if (baseError.code === 'P2025') {
      setResponse(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Recurso não encontrado.');
    }

    /**
     * JWT
     */

    if (baseError.name === 'JsonWebTokenError') {
      setResponse(401, ErrorCodes.UNAUTHENTICATED, 'Token inválido.');
    }

    if (baseError.name === 'TokenExpiredError') {
      setResponse(401, ErrorCodes.TOKEN_EXPIRED, 'Token expirado.');
    }

  }

  logByStatus(statusCode, req, requestId, errorCode);

  if (statusCode >= 500) {
    message = 'Erro interno do servidor. Tente novamente mais tarde.';
  }

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

function logByStatus(
  statusCode: number,
  req: Request,
  requestId: string,
  errorCode: ErrorCodes
) {

  if (statusCode >= 500) {

    logger.error('Erro interno do servidor', {
      evento: 'SERVER_ERROR',
      requestId,
      method: req.method,
      path: req.path,
      errorCode
    });

  } else if (statusCode === 401 || statusCode === 403) {

    logger.warn('Alerta de segurança', {
      evento: 'SECURITY_WARNING',
      requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      errorCode
    });

  }

}