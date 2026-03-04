import axios, {AxiosHeaders} from 'axios';
import { ErrorCodes } from '../types/errors';
import { showToast } from './toast';
import { storageGet } from './storage';
import { broadcastUnauthorized } from './authContext';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  try {
    const token = storageGet<string>('auth-token');
    if (token) {
      config.headers = config.headers ? AxiosHeaders.from(config.headers) : new AxiosHeaders();
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch { /* noop */ }
  return config;
});

const ERROR_MESSAGES: Record<string, string> = {
  [ErrorCodes.INVALID_CREDENTIALS]: 'E-mail ou senha incorretos.',
  [ErrorCodes.TOKEN_EXPIRED]: 'Sua sessão expirou. Faça login novamente.',
  [ErrorCodes.TOKEN_INVALID]: 'Token inválido. Faça login novamente.',
  [ErrorCodes.FORBIDDEN]: 'Acesso negado.',
  [ErrorCodes.UNAUTHENTICATED]: 'Você precisa estar autenticado para acessar.',
  [ErrorCodes.EMAIL_ALREADY_EXISTS]: 'Este e-mail já está em uso.',
  [ErrorCodes.FIELD_VALIDATION]: 'Verifique os campos e tente novamente.',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Muitas tentativas. Aguarde alguns minutos.',
  [ErrorCodes.RESOURCE_NOT_FOUND]: 'Recurso não encontrado.',
  [ErrorCodes.EMAIL_SERVICE_UNAVAILABLE]: 'Serviço de e-mail indisponível no momento.',
  [ErrorCodes.DATABASE_CONNECTION_FAILED]: 'Falha ao conectar-se ao servidor.',
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data || {};
    const status = error?.response?.status;
    const code: string | undefined = data?.errorCode || data?.code;
    const message: string =
      (code && ERROR_MESSAGES[code]) ||
      data?.message ||
      'Erro inesperado. Tente novamente.';

    if (status === 401 || status === 403 || code === ErrorCodes.TOKEN_EXPIRED || code === ErrorCodes.UNAUTHENTICATED || code === ErrorCodes.FORBIDDEN || code === ErrorCodes.TOKEN_INVALID) {
      try { broadcastUnauthorized(); } catch {}
    } else {
      const level = status && status >= 500 ? 'error' : 'warning';
      showToast(level, message);
    }

    return Promise.reject(error);
  }
);
