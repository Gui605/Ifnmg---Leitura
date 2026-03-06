import axios, { AxiosRequestConfig, AxiosResponse, AxiosHeaders } from 'axios';

import { z } from 'zod';

import { ErrorCodes } from '../types/errors';

import { Notificacao } from './Notificacao';

import { storageGet, storageRemove } from './storage';

import { broadcastUnauthorized } from './authContext';

import { AppError } from './appError';



// 1. CONFIGURAÇÃO E TRANSPORTE

export const api = axios.create({

  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',

  headers: { 'Content-Type': 'application/json' }

});



// Interceptor de Request: Injeta Token

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



// Dicionário de Erros (UX)

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



// Interceptor de Response: Erros e Desembrulhamento

api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const data = error?.response?.data || {};

    const status = error?.response?.status;

    const code: string | undefined = data?.errorCode || data?.code;

    const message: string = (code && ERROR_MESSAGES[code]) || data?.message || 'Erro inesperado.';



    const isAuthError = [401, 403].includes(status) || 

    ([ErrorCodes.TOKEN_EXPIRED, ErrorCodes.TOKEN_INVALID, ErrorCodes.UNAUTHENTICATED, ErrorCodes.FORBIDDEN] as string[]).includes(code || '');



    const isLoginAttempt = error.config?.url?.includes('/auth/logar');



    if (isAuthError && !isLoginAttempt) {

      const friendly = code === ErrorCodes.FORBIDDEN ? 'Acesso negado.' : 'Sessão finalizada.';

      try { await Notificacao.modal.erro({ titulo: 'Sessão finalizada', texto: friendly }); } catch {}

      try { storageRemove('auth-token'); } catch {}

      try { broadcastUnauthorized(); } catch {}

      try { window.location.assign('/login'); } catch {}

    } else if (!isLoginAttempt) {

      Notificacao.toast.show(status && status >= 500 ? 'error' : 'warning', message);

    }

    return Promise.reject(new AppError(message, status));

  }

);



// 2. CAMADA DE CONTRATO (Wrapper de Validação)

type Selector<T> = (raw: any, resp: AxiosResponse) => T;



async function request<T>(

  method: 'get' | 'post' | 'put' | 'delete' | 'patch',

  url: string,

  schema: z.ZodType<T>,

  data?: any,

  config?: AxiosRequestConfig,

  select?: Selector<unknown>

): Promise<T> {

  const resp = await api[method](url, data, config);

  

  // AQUI A MÁGICA: O backend envia { status, message, data, meta }

  // Validamos o 'data' (payload de negócio)

  const payload = resp.data.data; 

  

  // Mantemos o seletor para casos especiais (ex: ler o meta)

  const target = select ? select(resp.data, resp) : payload;

  

  const parsed = schema.safeParse(target);

  if (!parsed.success) {

    throw AppError.internal('Falha na validação do contrato da API');

  }

  return parsed.data as T;

}



export const apiClient = {

  get: <T>(url: string, schema: z.ZodType<T>, config?: AxiosRequestConfig, select?: Selector<unknown>) => 

    request('get', url, schema, undefined, config, select),

  post: <T>(url: string, data: any, schema: z.ZodType<T>, config?: AxiosRequestConfig, select?: Selector<unknown>) => 

    request('post', url, schema, data, config, select),

  put: <T>(url: string, data: any, schema: z.ZodType<T>, config?: AxiosRequestConfig, select?: Selector<unknown>) => 

    request('put', url, schema, data, config, select),

  delete: <T>(url: string, schema: z.ZodType<T>, config?: AxiosRequestConfig, select?: Selector<unknown>) => 

    request('delete', url, schema, undefined, config, select),

  patch: <T>(url: string, data: any, schema: z.ZodType<T>, config?: AxiosRequestConfig, select?: Selector<unknown>) => 

    request('patch', url, schema, data, config, select),

};