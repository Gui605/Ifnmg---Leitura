"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//backend/src/features/perfil/perfil.routes.ts
const express_1 = require("express");
const perfil_controller_1 = __importDefault(require("./perfil.controller"));
const authMiddleware_1 = require("../../shared/middlewares/authMiddleware");
const optionalAuthMiddleware_1 = require("../../shared/middlewares/optionalAuthMiddleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const perfil_types_1 = require("../../shared/types/perfil.types");
const perfilRoutes = (0, express_1.Router)();
// Identidade: O Token JWT deve ser válido
perfilRoutes.use(authMiddleware_1.middlewareAutenticacao);
// Gestão de Informações Pessoais
//GET /me -> Recupera dados do perfil logado
perfilRoutes.get('/me', perfil_controller_1.default.getPerfilInfo);
// PATCH /me -> Atualização de dados básicos
perfilRoutes.patch('/me', (0, validate_middleware_1.validate)({ body: perfil_types_1.PerfilPatchSchema }), perfil_controller_1.default.updatePerfil);
// Operações de Segurança Crítica
// PATCH /seguranca/senha -> Troca de credenciais
perfilRoutes.patch('/seguranca/senha', (0, validate_middleware_1.validate)({ body: perfil_types_1.SenhaPatchSchema }), perfil_controller_1.default.alterarSenha);
// DELETE /seguranca/conta -> Encerramento de conta
// Exige a senha atual para confirmação.
perfilRoutes.get('/seguranca/check-exclusao', perfil_controller_1.default.checkPendenciasExclusao);
perfilRoutes.delete('/seguranca/conta', (0, validate_middleware_1.validate)({ body: perfil_types_1.DeletarContaSchema }), perfil_controller_1.default.deletarPerfil);
// Sistema de Seguidores
// POST /:id/seguir
// Validação de Contrato (Apenas campo 'id' é permitido)
perfilRoutes.post('/:id/seguir', perfil_controller_1.default.toggleFollow);
// GET /sugestoes -> recomendações de perfis
perfilRoutes.get('/sugestoes', perfil_controller_1.default.getSugestoesMembros);
// GET /:id -> Busca perfil público de terceiros
// Validação de Contrato (Apenas campo 'id' é permitido)
perfilRoutes.get('/:id', optionalAuthMiddleware_1.middlewareAutenticacaoOpcional, perfil_controller_1.default.getPerfilPublico);
exports.default = perfilRoutes;
