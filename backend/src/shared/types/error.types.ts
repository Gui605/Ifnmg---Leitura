import { ZodIssue } from 'zod';

/**
 * Representa um objeto semelhante a um erro do Express,
 * normalizando as diferentes formas como um erro pode chegar.
 */
export interface ExpressErrorLike {
  statusCode?: number;
  status?: number;
  errorCode?: string;
  message?: string;
  type?: string;
  code?: string;
  name?: string;
  body?: any;
  path?: string;
}

/**
 * Estende a issue padrão do Zod com campos adicionais
 * que podem ser usados para fornecer feedback de validação mais rico.
 */
export type ZodIssueExtended = ZodIssue & {
  path: (string | number)[];
  expected?: any;
  received?: any;
  type?: string;
  minimum?: number;
  maximum?: number;
};
