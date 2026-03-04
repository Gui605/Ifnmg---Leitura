import * as express from 'express';

/**
 * 💡 EXTENSÃO DE TIPAGEM DO EXPRESS
 * Este arquivo permite que o TypeScript entenda os metadados injetados
 * pelo 'authMiddleware' no objeto de requisição (req).
 */

declare global {
  namespace Express {
    interface Request {
      // ID do registro na tabela 'Usuarios'
      usuario_id?: number;
      
      // ID do registro na tabela 'Perfis'
      perfil_id?: number;

      // Flag opcional para verificar se é administrador
      is_admin?: boolean;

      // Correlacionador de requisição para observabilidade
      requestId?: string;
    }
  }
}

// Exportação vazia necessária para tratar o arquivo como um módulo
export {};
