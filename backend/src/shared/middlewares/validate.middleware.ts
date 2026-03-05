import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { limpezaDeEntrada } from '../utils/sanitize';

interface ValidationSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schema: ValidationSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // 1. Extraímos o ID como string (com fallback para undefined se não existir)
      const requestId = req.headers['x-request-id'] as string;

      // 2. Sanitização (Passando a string do requestId corretamente)
      if (req.body) req.body = limpezaDeEntrada(req.body, requestId);
      if (req.query) req.query = limpezaDeEntrada(req.query, requestId);
      if (req.params) req.params = limpezaDeEntrada(req.params, requestId);

      // 3. Validação com Zod
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      
      if (schema.query) {
        // Cast para 'any' necessário devido à incompatibilidade de tipos do Express vs Zod
        req.query = await schema.query.parseAsync(req.query) as any;
      }
      
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params) as any;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};