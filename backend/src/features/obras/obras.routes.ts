// backend/src/features/obras/obras.routes.ts
import { Router } from 'express';
import obrasController from './obras.controller';
import { middlewareAutenticacao } from '../../shared/middlewares/authMiddleware';
import { middlewareAutenticacaoOpcional } from '../../shared/middlewares/optionalAuthMiddleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { ObraCreateSchema, ObraUpdateSchema } from '../../shared/types/obra.types';
import { z } from 'zod';
import { limitadorEngajamento, limitadorLeitura } from '../../shared/middlewares/rateLimiter';

const obrasRoutes = Router();

const ObraIdParamsSchema = z.object({ id: z.coerce.number().positive() });

// ROTAS DE LEITURA (Acesso Público)

obrasRoutes.get(
    '/',
    middlewareAutenticacaoOpcional,
    limitadorLeitura,
    obrasController.listarObras
);

obrasRoutes.get(
    '/:id',
    middlewareAutenticacaoOpcional,
    limitadorLeitura,
    validate({ params: ObraIdParamsSchema }),
    obrasController.buscarObraPorId
);

// ROTAS DE ESCRITA (Acesso Restrito)

obrasRoutes.post(
    '/',
    middlewareAutenticacao,
    limitadorEngajamento,
    validate({ body: ObraCreateSchema }),
    obrasController.criarObra
);

obrasRoutes.patch(
    '/:id',
    middlewareAutenticacao,
    limitadorEngajamento,
    validate({ params: ObraIdParamsSchema, body: ObraUpdateSchema }),
    obrasController.atualizarObra
);

obrasRoutes.delete(
    '/:id',
    middlewareAutenticacao,
    validate({ params: ObraIdParamsSchema }),
    obrasController.deletarObra
);

export default obrasRoutes;
