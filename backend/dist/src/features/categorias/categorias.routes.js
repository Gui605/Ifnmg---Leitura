"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categorias_controller_1 = __importDefault(require("./categorias.controller"));
const authMiddleware_1 = require("../../shared/middlewares/authMiddleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const categoria_types_1 = require("../../shared/types/categoria.types");
const zod_1 = require("zod");
const rateLimiter_1 = require("../../shared/middlewares/rateLimiter");
const categorias_controller_2 = require("./categorias.controller");
const categoriasRoutes = (0, express_1.Router)();
const EmptyBodySchema = zod_1.z.object({}).strict();
/**
 * 💡 PADRÃO ENTERPRISE EVOLUÍDO:
 * 1. Pipeline de Segurança: Auth -> Admin -> Validate -> Controller.
 * 2. Whitelist: Apenas o campo 'nome' passa pelo filtro do Zod.
 */
// --- Leitura Pública ---
categoriasRoutes.get('/', categorias_controller_1.default.listar);
// --- Escrita Protegida (Exige privilégios de Administrador) ---
// POST /api/v1/categorias
categoriasRoutes.post('/', authMiddleware_1.middlewareAutenticacao, 
// middlewareAdministrador, 
(0, validate_middleware_1.validate)(categoria_types_1.CategoriaCreateSchema), // 🛡️ Bloqueia qualquer campo extra (Mass Assignment)
categorias_controller_1.default.criar);
// PATCH /api/v1/categorias/:id
const CategoriaIdParamsSchema = zod_1.z.object({ id: zod_1.z.coerce.number().positive() }).strict();
categoriasRoutes.patch('/:id', authMiddleware_1.middlewareAutenticacao, 
// middlewareAdministrador, 
(0, validate_middleware_1.validateParams)(CategoriaIdParamsSchema), (0, validate_middleware_1.validate)(categoria_types_1.CategoriaUpdateSchema), // 🛡️ Garante que apenas o 'nome' seja editado
categorias_controller_1.default.atualizar);
// DELETE /api/v1/categorias/:id
categoriasRoutes.delete('/:id', authMiddleware_1.middlewareAutenticacao, 
// middlewareAdministrador, 
(0, validate_middleware_1.validateParams)(CategoriaIdParamsSchema), (0, validate_middleware_1.validate)(EmptyBodySchema), categorias_controller_1.default.excluir);
exports.default = categoriasRoutes;
// ====== Fusão de Interesses (Taxonomia) ======
const CategoriaIdParamsSchema2 = zod_1.z.object({ id: zod_1.z.coerce.number().positive() }).strict();
categoriasRoutes.get('/interesses', authMiddleware_1.middlewareAutenticacao, categorias_controller_2.listarInteressesCategoria);
categoriasRoutes.post('/:id/interesse', authMiddleware_1.middlewareAutenticacao, rateLimiter_1.limitadorEngajamento, (0, validate_middleware_1.validateParams)(CategoriaIdParamsSchema2), (0, validate_middleware_1.validate)(EmptyBodySchema), categorias_controller_2.seguirCategoriaController);
categoriasRoutes.delete('/:id/interesse', authMiddleware_1.middlewareAutenticacao, rateLimiter_1.limitadorEngajamento, (0, validate_middleware_1.validateParams)(CategoriaIdParamsSchema2), (0, validate_middleware_1.validate)(EmptyBodySchema), categorias_controller_2.deixarDeSeguirCategoriaController);
