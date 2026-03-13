import { Router } from 'express';
import categoriasController, { getTrending } from './categorias.controller';
import { middlewareAutenticacao } from '../../shared/middlewares/authMiddleware';
import { middlewareAutenticacaoOpcional } from '../../shared/middlewares/optionalAuthMiddleware';
import { middlewareAdministrador } from '../../shared/middlewares/adminMiddleware';
import { validate} from '../../shared/middlewares/validate.middleware';
import { CategoriaCreateSchema, CategoriaUpdateSchema } from '../../shared/types/categoria.types';
import { z } from 'zod';
import { limitadorEngajamento, limitadorLeitura } from '../../shared/middlewares/rateLimiter';
import { listarInteressesCategoria, seguirCategoriaController, deixarDeSeguirCategoriaController } from './categorias.controller';

const categoriasRoutes = Router();

const EmptyBodySchema = z.object({}).strict();

/**
 * 💡 PADRÃO ENTERPRISE EVOLUÍDO:
 * 1. Pipeline de Segurança: Auth -> Admin -> Validate -> Controller.
 * 2. Whitelist: Apenas o campo 'nome' passa pelo filtro do Zod.
 */

// --- Leitura Pública ---
categoriasRoutes.get('/', categoriasController.listar);

// GET /api/v1/categorias/trending
categoriasRoutes.get(
    '/trending', 
    middlewareAutenticacaoOpcional, 
    limitadorLeitura, 
    getTrending
);

// --- Escrita Protegida (Exige privilégios de Administrador) ---

// POST /api/v1/categorias
categoriasRoutes.post('/', 
    middlewareAutenticacao, 
    // middlewareAdministrador, 
    validate({ body: CategoriaCreateSchema }), // 🛡️ Bloqueia qualquer campo extra (Mass Assignment)
    categoriasController.criar
);

// PATCH /api/v1/categorias/:id
const CategoriaIdParamsSchema = z.object({ id: z.coerce.number().positive() }).strict();
categoriasRoutes.patch('/:id', 
    middlewareAutenticacao, 
    // middlewareAdministrador, 
    validate({
        params: CategoriaIdParamsSchema,
        body: CategoriaUpdateSchema
    }), // 🛡️ Garante que apenas o campo 'nome' seja editado
    categoriasController.atualizar
);

// DELETE /api/v1/categorias/:id
categoriasRoutes.delete('/:id', 
    middlewareAutenticacao, 
    // middlewareAdministrador, 
    validate({
        params: CategoriaIdParamsSchema,
        body: EmptyBodySchema
    }),
    categoriasController.excluir
);

export default categoriasRoutes;

// ====== Fusão de Interesses (Taxonomia) ======
const CategoriaIdParamsSchema2 = z.object({ id: z.coerce.number().positive() }).strict();

categoriasRoutes.get(
    '/interesses',
    middlewareAutenticacao,
    listarInteressesCategoria
);

categoriasRoutes.post(
    '/:id/interesse',
    middlewareAutenticacao,
    limitadorEngajamento,
    validate({
        params: CategoriaIdParamsSchema2,
        body: EmptyBodySchema
    }),
    seguirCategoriaController
);

categoriasRoutes.delete(
    '/:id/interesse',
    middlewareAutenticacao,
    limitadorEngajamento,
    validate({
        params: CategoriaIdParamsSchema2,
        body: EmptyBodySchema
    }),
    deixarDeSeguirCategoriaController
);
