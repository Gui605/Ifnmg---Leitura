import { Router } from 'express';
import postsController from './posts.controller';
import { middlewareAutenticacao } from '../../shared/middlewares/authMiddleware'; 
import { middlewareAutenticacaoOpcional } from '../../shared/middlewares/optionalAuthMiddleware';
import { validate} from '../../shared/middlewares/validate.middleware';
import { PostCreateSchema, PostsQuerySchema, PostVoteSchema, PostCommentSchema, ReacaoSchema } from '../../shared/types/post.types';
import { z } from 'zod';
import { limitadorEngajamento, limitadorLeitura } from '../../shared/middlewares/rateLimiter';



const postsRoutes = Router();

//ROTAS DE LEITURA Acesso Público / Híbrido

// GET /api/v1/posts 
//Validação de Query: Garante que page/limit sejam números válidos.
postsRoutes.get(
    '/', 
    middlewareAutenticacaoOpcional, 
    limitadorLeitura,
    validate({
            query: PostsQuerySchema
        }), 
    postsController.listarPosts
);

//GET /api/v1/posts/pesquisa
//Busca unificada entre posts e obras
postsRoutes.get(
    '/pesquisa',
    middlewareAutenticacaoOpcional,
    postsController.pesquisar
);


//ROTAS DE ESCRITA Acesso Restrito

// POST /api/v1/posts 
//Validação que bloqueia autor_id manual e garante formato do conteúdo.
postsRoutes.post(
    '/', 
    middlewareAutenticacao, 
    limitadorEngajamento,
    validate({
            body: PostCreateSchema
        }),
    postsController.criarPost
);

// DELETE /api/v1/posts/:id 
//Valida se quem deleta é o dono do post.
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

//GET /posts/:id/comentarios
//Público/Opcional
postsRoutes.get('/:id/comentarios',
    middlewareAutenticacaoOpcional,
    validate({
        params: PostIdParamsSchema
    }),
    postsController.listarComentarios
);

//DELETE /posts/comentarios/:id
//Protegida - apenas autor ou admin
postsRoutes.delete('/comentarios/:id',
    middlewareAutenticacao,
    validate({
        params: PostIdParamsSchema
    }),
    postsController.deletarComentario
);

postsRoutes.post('/:id/reagir',
    middlewareAutenticacao,
    limitadorEngajamento,
    validate({
            params: PostIdParamsSchema,
            body: ReacaoSchema
        }),
    postsController.reagirPost
);

//GET /api/v1/posts/:id
//Híbrido: Acesso público, mas personaliza para logado
postsRoutes.get('/:id',
    middlewareAutenticacaoOpcional,
    limitadorLeitura,
    validate({
        params: PostIdParamsSchema
    }),
    postsController.getPostById
);

export default postsRoutes;
