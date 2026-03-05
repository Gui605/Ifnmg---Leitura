import { Router } from 'express';
import postsController from './posts.controller';
import { middlewareAutenticacao } from '../../shared/middlewares/authMiddleware'; 
import { middlewareAutenticacaoOpcional } from '../../shared/middlewares/optionalAuthMiddleware';
import { validate} from '../../shared/middlewares/validate.middleware';
import { PostCreateSchema, PostsQuerySchema, PostVoteSchema, PostCommentSchema } from '../../shared/types/post.types';
import { z } from 'zod';
import { limitadorEngajamento, limitadorLeitura } from '../../shared/middlewares/rateLimiter';

/**
 * 💡 PADRÃO ENTERPRISE EVOLUÍDO:
 * 1. Segurança de Contrato: Zod barra Mass Assignment e payloads gigantes.
 * 2. Normalização de Query: Zod converte "?page=1" de string para number.
 * 3. Defesa em Camadas: Auth -> Validation -> Controller.
 */

const postsRoutes = Router();

// --- ROTAS DE LEITURA (Acesso Público / Híbrido) ---

/** * GET /api/v1/posts 
 * 🛡️ Validação de Query: Garante que page/limit sejam números válidos.
 */
postsRoutes.get(
    '/', 
    middlewareAutenticacaoOpcional, 
    limitadorLeitura,
    validate({
            body: PostsQuerySchema
        }), // Valida e limpa os parâmetros de busca
    postsController.listarPosts
);


// --- ROTAS DE ESCRITA (Acesso Restrito) ---

/** * POST /api/v1/posts 
 * 🛡️ Validação de Body: Bloqueia autor_id manual e garante formato do conteúdo.
 */
postsRoutes.post(
    '/', 
    middlewareAutenticacao, 
    limitadorEngajamento,
    validate({
            body: PostCreateSchema
        }),
    postsController.criarPost
);

/** * DELETE /api/v1/posts/:id 
 * 🛡️ Segurança: O Controller valida se quem deleta é o dono do post.
 */
const PostIdParamsSchema = z.object({ id: z.coerce.number().positive() });
const EmptyBodySchema = z.object({}).strict();

postsRoutes.delete('/:id',
     middlewareAutenticacao,
     validate({
            params: PostIdParamsSchema,
            body: EmptyBodySchema
        }),
    postsController.deletarPost);

postsRoutes.post('/:id/votar',
    middlewareAutenticacao,
    limitadorEngajamento,
    validate({
            params: PostIdParamsSchema,
            body: PostVoteSchema
        }),
    postsController.votarPost
);

postsRoutes.post('/:id/comentarios',
    middlewareAutenticacao,
    limitadorEngajamento,
    validate({
            params: PostIdParamsSchema,
            body: PostCommentSchema
        }),
    postsController.comentarPost
);

export default postsRoutes;
