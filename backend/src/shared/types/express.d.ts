import * as express from 'express';
import { AuthUser } from './auth.types';

/**
 * 💡 EXTENSÃO DE TIPAGEM DO EXPRESS
 * Este arquivo permite que o TypeScript entenda os metadados injetados
 * pelo 'authMiddleware' no objeto de requisição (req).
 */

declare global {
  namespace Express {
    interface Request {
      /**
       * 🛡️ METADADOS DE AUTENTICAÇÃO (IFNMG)
       * O objeto 'user' é obrigatório em rotas protegidas pelo authMiddleware.
       */
      user: AuthUser;

      /**
       * 🔍 OBSERVABILIDADE
       * ID único para rastreamento de logs (Breadcrumbs).
       */
      requestId?: string;
    }
  }
}

// Exportação vazia necessária para tratar o arquivo como um módulo
export {};
