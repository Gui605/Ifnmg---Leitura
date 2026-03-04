import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { limpezaDeEntrada } from '../utils/sanitize';

/**
 * 🛡️ MIDDLEWARE DE VALIDAÇÃO DE CONTRATO (ZOD)
 * Substitui o antigo securityContract manual.
 * * 1. Valida o formato e tipos dos dados.
 * 2. Remove campos extras (se usar .strip() - padrão).
 * 3. Bloqueia campos extras (se usar .strict() no schema).
 * 4. Sanitiza o input antes de chegar ao Controller.
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      req.body = limpezaDeEntrada(req.body, req) as any;
      req.params = limpezaDeEntrada(req.params, req) as any;
      req.query = limpezaDeEntrada(req.query, req) as any;
      if (req.method === 'GET') {
        req.query = await schema.parseAsync(req.query) as any;
      } else {
        req.body = await schema.parseAsync(req.body) as any;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      req.params = limpezaDeEntrada(req.params, req) as any;
      req.params = await schema.parseAsync(req.params) as any;
      next();
    } catch (error) {
      next(error);
    }
  };
};
