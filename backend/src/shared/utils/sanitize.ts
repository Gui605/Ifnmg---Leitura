/**
 * Esta camada realiza sanitização de segurança (input validation).
 * O escape HTML contextual para exibição deve ocorrer obrigatoriamente na camada de apresentação (Frontend).
 */
import { Request } from 'express';
import { AppError } from './AppError';
import { ErrorCodes } from '../../errors/ErrorCodes';
import { logger } from './logger';
import { SanitizedValue } from '../types/utils.types';

function containsNullByte(s: string) {
  return s.includes('\0');
}

function stripControlChars(s: string) {
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

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function sanitizeString(valor: unknown, req?: Request): string {
  const dados = typeof valor === 'string' ? valor : String(valor);
  if (containsNullByte(dados)) {
    logger.warn('Null Byte detectado na entrada', { evento: 'SECURITY_SANITIZE_ALERT', path: req?.originalUrl, ip: req?.ip, requestId: req?.requestId, errorCode: ErrorCodes.BAD_REQUEST });
    throw new AppError('Caractere inválido detectado', 400, ErrorCodes.BAD_REQUEST);
  }
  const semControle = stripControlChars(dados);
  return escapeHtml(semControle);
}

function sanitizeArray(dados: unknown[], req?: Request): SanitizedValue[] {
  return dados.map((item) => limpezaDeEntrada(item, req));
}

function sanitizeObject(dados: Record<string, unknown>, req?: Request): Record<string, SanitizedValue> {
  const novoObjeto: Record<string, SanitizedValue> = {};
  for (const key in dados) {
    if (Object.prototype.hasOwnProperty.call(dados, key)) {
      novoObjeto[key] = limpezaDeEntrada(dados[key], req);
    }
  }
  return novoObjeto;
}

export function limpezaDeEntrada(dados: unknown, req?: Request): SanitizedValue {
  if (dados === null || dados === undefined) return null;

  if (dados instanceof Date) return dados;

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
    return sanitizeObject(dados as Record<string, unknown>, req);
  }

  return sanitizeString(String(dados), req);
}
