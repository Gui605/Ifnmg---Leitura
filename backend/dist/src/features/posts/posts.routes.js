"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const posts_controller_1 = __importDefault(require("./posts.controller"));
const authMiddleware_1 = require("../../shared/middlewares/authMiddleware");
const optionalAuthMiddleware_1 = require("../../shared/middlewares/optionalAuthMiddleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const post_types_1 = require("../../shared/types/post.types");
const zod_1 = require("zod");
const rateLimiter_1 = require("../../shared/middlewares/rateLimiter");
/**
 * 💡 PADRÃO ENTERPRISE EVOLUÍDO:
 * 1. Segurança de Contrato: Zod barra Mass Assignment e payloads gigantes.
 * 2. Normalização de Query: Zod converte "?page=1" de string para number.
 * 3. Defesa em Camadas: Auth -> Validation -> Controller.
 */
const postsRoutes = (0, express_1.Router)();
// --- ROTAS DE LEITURA (Acesso Público / Híbrido) ---
/** * GET /api/v1/posts
 * 🛡️ Validação de Query: Garante que page/limit sejam números válidos.
 */
postsRoutes.get('/', optionalAuthMiddleware_1.middlewareAutenticacaoOpcional, rateLimiter_1.limitadorLeitura, (0, validate_middleware_1.validate)(post_types_1.PostsQuerySchema), // Valida e limpa os parâmetros de busca
posts_controller_1.default.listarPosts);
// --- ROTAS DE ESCRITA (Acesso Restrito) ---
/** * POST /api/v1/posts
 * 🛡️ Validação de Body: Bloqueia autor_id manual e garante formato do conteúdo.
 */
postsRoutes.post('/', authMiddleware_1.middlewareAutenticacao, rateLimiter_1.limitadorEngajamento, (0, validate_middleware_1.validate)(post_types_1.PostCreateSchema), posts_controller_1.default.criarPost);
/** * DELETE /api/v1/posts/:id
 * 🛡️ Segurança: O Controller valida se quem deleta é o dono do post.
 */
const PostIdParamsSchema = zod_1.z.object({ id: zod_1.z.coerce.number().positive() });
const EmptyBodySchema = zod_1.z.object({}).strict();
postsRoutes.delete('/:id', authMiddleware_1.middlewareAutenticacao, (0, validate_middleware_1.validateParams)(PostIdParamsSchema), (0, validate_middleware_1.validate)(EmptyBodySchema), posts_controller_1.default.deletarPost);
postsRoutes.post('/:id/votar', authMiddleware_1.middlewareAutenticacao, rateLimiter_1.limitadorEngajamento, (0, validate_middleware_1.validateParams)(PostIdParamsSchema), (0, validate_middleware_1.validate)(post_types_1.PostVoteSchema), posts_controller_1.default.votarPost);
postsRoutes.post('/:id/comentarios', authMiddleware_1.middlewareAutenticacao, rateLimiter_1.limitadorEngajamento, (0, validate_middleware_1.validateParams)(PostIdParamsSchema), (0, validate_middleware_1.validate)(post_types_1.PostCommentSchema), posts_controller_1.default.comentarPost);
exports.default = postsRoutes;
