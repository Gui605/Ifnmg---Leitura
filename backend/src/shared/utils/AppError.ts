// O caminho foi ajustado para subir um nível e entrar na pasta errors
import { ErrorCodes } from '../../errors/ErrorCodes';

/**
 * 💡 PADRÃO ENTERPRISE: Classe Global de Exceções
 * Centraliza a criação de erros operacionais, garantindo que o 
 * Frontend receba sempre um contrato previsível (Status + Código de Erro Localizado).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCodes;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCodes
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    // Garante que o stack trace (rastro do erro) aponte para onde o AppError foi instanciado
    Error.captureStackTrace(this, this.constructor);
  }

  // 🏎️ Factory methods: Atalhos que injetam automaticamente o código de erro em português

  /** 🔴 Erro 400: REQUISICAO_MALFORMADA */
  static badRequest(msg: string) {
    return new AppError(msg, 400, ErrorCodes.BAD_REQUEST);
  }

  /** 🔑 Erro 401: CREDENCIAIS_INVALIDAS */
  static unauthorized(msg: string) {
    return new AppError(msg, 401, ErrorCodes.UNAUTHENTICATED);
  }

  /** 🔍 Erro 404: RECURSO_NAO_ENCONTRADO */
  static notFound(msg: string) {
    return new AppError(msg, 404, ErrorCodes.RESOURCE_NOT_FOUND);
  }

  /** ⚔️ Erro 409: CONFLITO_DE_NEGOCIO */
  static conflict(msg: string) {
    return new AppError(msg, 409, ErrorCodes.CONFLICT);
  }

  /** 📝 Erro 422: ERRO_DE_VALIDACAO */
  static validation(msg: string) {
    return new AppError(msg, 422, ErrorCodes.VALIDATION_ERROR);
  }

  /** ⏳ Erro 429: LIMITE_DE_REQUISICOES_EXCEDIDO */
  static rateLimit(msg: string) {
    return new AppError(msg, 429, ErrorCodes.RATE_LIMIT_EXCEEDED);
  }

  /** 🛡️ Erro 403: ACESSO_NEGADO */
  static forbidden(msg: string) {
    return new AppError(msg, 403, ErrorCodes.FORBIDDEN);
  }

  /** 🕒 Erro 410: RECURSO_EXPIRADO (Gone) */
  static gone(msg: string) {
    return new AppError(msg, 410, ErrorCodes.TOKEN_EXPIRED);
  }

  /** 🛠️ Erro 503: SERVICO_INDISPONIVEL */
  static serviceUnavailable(msg: string) {
    return new AppError(msg, 503, ErrorCodes.SERVICE_UNAVAILABLE);
  }

  /** ⚙️ Erro 500: ERRO_DE_CONFIGURACAO */
  static config(msg: string) {
    return new AppError(msg, 500, ErrorCodes.CONFIG_ERROR);
  }
}
