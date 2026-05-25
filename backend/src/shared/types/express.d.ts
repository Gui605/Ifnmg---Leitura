import * as express from 'express';
import { AuthUser } from './auth.types';

/*
 Este arquivo permite que o TypeScript entenda os metadados injetados
 pelo 'authMiddleware' no objeto de requisição (req).
 */

declare global {
  namespace Express {
    interface Request {
      //O objeto 'user' é obrigatório em rotas protegidas pelo authMiddleware.
      user: AuthUser;

      //ID único para rastreamento de logs (Breadcrumbs).
      requestId?: string;
    }
  }
}

export {};
