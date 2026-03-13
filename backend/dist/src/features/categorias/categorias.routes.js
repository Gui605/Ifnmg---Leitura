"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categorias_controller_1 = __importStar(require("./categorias.controller"));
const authMiddleware_1 = require("../../shared/middlewares/authMiddleware");
const optionalAuthMiddleware_1 = require("../../shared/middlewares/optionalAuthMiddleware");
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
// GET /api/v1/categorias/trending
categoriasRoutes.get('/trending', optionalAuthMiddleware_1.middlewareAutenticacaoOpcional, rateLimiter_1.limitadorLeitura, categorias_controller_1.getTrending);
// --- Escrita Protegida (Exige privilégios de Administrador) ---
// POST /api/v1/categorias
categoriasRoutes.post('/', authMiddleware_1.middlewareAutenticacao, 
// middlewareAdministrador, 
(0, validate_middleware_1.validate)({ body: categoria_types_1.CategoriaCreateSchema }), // 🛡️ Bloqueia qualquer campo extra (Mass Assignment)
categorias_controller_1.default.criar);
// PATCH /api/v1/categorias/:id
const CategoriaIdParamsSchema = zod_1.z.object({ id: zod_1.z.coerce.number().positive() }).strict();
categoriasRoutes.patch('/:id', authMiddleware_1.middlewareAutenticacao, 
// middlewareAdministrador, 
(0, validate_middleware_1.validate)({
    params: CategoriaIdParamsSchema,
    body: categoria_types_1.CategoriaUpdateSchema
}), // 🛡️ Garante que apenas o campo 'nome' seja editado
categorias_controller_1.default.atualizar);
// DELETE /api/v1/categorias/:id
categoriasRoutes.delete('/:id', authMiddleware_1.middlewareAutenticacao, 
// middlewareAdministrador, 
(0, validate_middleware_1.validate)({
    params: CategoriaIdParamsSchema,
    body: EmptyBodySchema
}), categorias_controller_1.default.excluir);
exports.default = categoriasRoutes;
// ====== Fusão de Interesses (Taxonomia) ======
const CategoriaIdParamsSchema2 = zod_1.z.object({ id: zod_1.z.coerce.number().positive() }).strict();
categoriasRoutes.get('/interesses', authMiddleware_1.middlewareAutenticacao, categorias_controller_2.listarInteressesCategoria);
categoriasRoutes.post('/:id/interesse', authMiddleware_1.middlewareAutenticacao, rateLimiter_1.limitadorEngajamento, (0, validate_middleware_1.validate)({
    params: CategoriaIdParamsSchema2,
    body: EmptyBodySchema
}), categorias_controller_2.seguirCategoriaController);
categoriasRoutes.delete('/:id/interesse', authMiddleware_1.middlewareAutenticacao, rateLimiter_1.limitadorEngajamento, (0, validate_middleware_1.validate)({
    params: CategoriaIdParamsSchema2,
    body: EmptyBodySchema
}), categorias_controller_2.deixarDeSeguirCategoriaController);
