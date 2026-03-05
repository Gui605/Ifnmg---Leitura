import { Router } from 'express';
import denunciasController from './denuncias.controller';
import { middlewareAutenticacao } from '../../shared/middlewares/authMiddleware';
import { validate} from '../../shared/middlewares/validate.middleware';
import { DenunciaCreateSchema } from '../../shared/types/denuncia.types';
import { z } from 'zod';
import { limitadorEngajamento } from '../../shared/middlewares/rateLimiter';

const router = Router();

const ParamsSchema = z.object({ postId: z.coerce.number().positive() }).strict();

router.post('/:postId',
  middlewareAutenticacao,
  limitadorEngajamento,
  validate({
          params: ParamsSchema,
          body: DenunciaCreateSchema
      }),
  denunciasController.criar
);

export default router;
