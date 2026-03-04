import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { z } from 'zod';
import { api } from './axios';
import { AppError } from './appError';

type Selector<T> = (raw: any, resp: AxiosResponse) => T;

async function validate<T>(
  respPromise: Promise<AxiosResponse>,
  schema: z.ZodType<T>,
  select?: Selector<unknown>
): Promise<T> {
  const resp = await respPromise;
  const raw = resp.data;
  const target = select ? select(raw, resp) : raw;
  const parsed = schema.safeParse(target);
  if (!parsed.success) {
    throw AppError.internal('Falha na validação do contrato da API');
  }
  return parsed.data as T;
}

export const apiClient = {
  get<T>(url: string, schema: z.ZodType<T>, config?: AxiosRequestConfig, select?: Selector<unknown>) {
    return validate(api.get(url, config), schema, select);
  },
  post<T>(url: string, data: any, schema: z.ZodType<T>, config?: AxiosRequestConfig, select?: Selector<unknown>) {
    return validate(api.post(url, data, config), schema, select);
  },
  put<T>(url: string, data: any, schema: z.ZodType<T>, config?: AxiosRequestConfig, select?: Selector<unknown>) {
    return validate(api.put(url, data, config), schema, select);
  },
  delete<T>(url: string, schema: z.ZodType<T>, config?: AxiosRequestConfig, select?: Selector<unknown>) {
    return validate(api.delete(url, config), schema, select);
  },
};
