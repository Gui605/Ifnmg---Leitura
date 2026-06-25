"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//backend/src/features/auth/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("./auth.controller"));
const rateLimiter_1 = require("../../shared/middlewares/rateLimiter");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const authMiddleware_1 = require("../../shared/middlewares/authMiddleware");
const auth_types_1 = require("../../shared/types/auth.types");
const router = (0, express_1.Router)();
// Registro e Ativação
router.post('/registrar', rateLimiter_1.limitadorRegistro, (0, validate_middleware_1.validate)({ body: auth_types_1.RegistrarSchema }), auth_controller_1.default.registrar);
router.get('/confirmar', auth_controller_1.default.confirmarEmail);
// Autenticação
router.post('/logar', rateLimiter_1.limitadorLogin, (0, validate_middleware_1.validate)({ body: auth_types_1.LoginSchema }), auth_controller_1.default.logar);
// Recuperação de Senha
router.post('/solicitar-recuperacao', rateLimiter_1.limitadorRegistro, (0, validate_middleware_1.validate)({ body: auth_types_1.SolicitarRecuperacaoSchema }), auth_controller_1.default.solicitarRecuperacao);
router.post('/redefinir-senha', rateLimiter_1.limitadorRegistro, (0, validate_middleware_1.validate)({ body: auth_types_1.RedefinirSenhaSchema }), auth_controller_1.default.redefinirSenha);
// Logout Global - revoga todas as sessões ativas
router.post('/logout-all', authMiddleware_1.middlewareAutenticacao, auth_controller_1.default.logoutAll);
exports.default = router;
