import { AppError } from './AppError'; 
import { ErrorCodes } from '../../errors/ErrorCodes';
import { logger } from './logger';

// Regex que remove caracteres de controle, mantendo TAB (9) e LF/Newline (10)
// Removemos caracteres de 00-08, 0B, 0C, 0E-1F e 7F
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

function containsNullByte(s: string): boolean {
  return s.includes('\0');
}

export function limpezaDeEntrada(dados: unknown, requestId?: string): any {
  // 1. Strings: Segurança de infraestrutura
  if (typeof dados === 'string') {
    if (containsNullByte(dados)) {
      logger.warn('SECURITY_SANITIZE_ALERT: Null Byte detectado', { 
        evento: 'SECURITY_ALERT', 
        requestId 
      });
      throw new AppError('Caractere inválido detectado', 400, ErrorCodes.BAD_REQUEST);
    }
    return dados.replace(CONTROL_CHARS_REGEX, '');
  }

  // 2. Arrays: Recursividade
  if (Array.isArray(dados)) {
    return dados.map((item) => limpezaDeEntrada(item, requestId));
  }

  // 3. Objetos: Recursividade (ignora instâncias como Date ou buffers)
  if (dados !== null && typeof dados === 'object' && !(dados instanceof Date)) {
    const novo: any = {};
    for (const key in dados) {
      if (Object.prototype.hasOwnProperty.call(dados, key)) {
        novo[key] = limpezaDeEntrada((dados as any)[key], requestId);
      }
    }
    return novo;
  }

  // 4. Primitivos (números, booleanos, null): Retorna como está
  return dados;
}
