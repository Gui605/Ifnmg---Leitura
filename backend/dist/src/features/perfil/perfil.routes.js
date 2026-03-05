"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const perfil_controller_1 = __importDefault(require("./perfil.controller"));
const authMiddleware_1 = require("../../shared/middlewares/authMiddleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const perfil_types_1 = require("../../shared/types/perfil.types");
/**
 * 💡 PADRÃO ENTERPRISE EVOLUÍDO:
 * Substituímos listas manuais de strings por Schemas de Validação (Zod).
 * Isso garante que o contrato da API seja a "Única Fonte de Verdade".
 */
const perfilRoutes = (0, express_1.Router)();
// 🛡️ Camada 1: Identidade (Token JWT deve ser válido)
perfilRoutes.use(authMiddleware_1.middlewareAutenticacao);
// --- 👤 Gestão de Informações Pessoais ---
/** * GET /me -> Recupera dados do perfil logado
 */
perfilRoutes.get('/me', perfil_controller_1.default.getPerfilInfo);
/** * PATCH /me -> Atualização de dados básicos
 * 🛡️ Camada 2: Validação de Contrato (Apenas campos permitidos pelo Zod)
 */
perfilRoutes.patch('/me', (0, validate_middleware_1.validate)({ body: perfil_types_1.UpdatePerfilSchema }), perfil_controller_1.default.updatePerfil);
// --- 🔐 Operações de Segurança Crítica ---
/** * PATCH /seguranca/senha -> Troca de credenciais
 * 🛡️ Camada 2: O Zod valida força da senha e se a confirmação é idêntica.
 */
perfilRoutes.patch('/seguranca/senha', (0, validate_middleware_1.validate)({ body: perfil_types_1.SenhaPatchSchema }), perfil_controller_1.default.alterarSenha);
/** * DELETE /seguranca/conta -> Encerramento de conta
 * 🛡️ Camada 2: Exige apenas a senha atual para confirmação.
 */
perfilRoutes.delete('/seguranca/conta', (0, validate_middleware_1.validate)({ body: perfil_types_1.DeletarContaSchema }), perfil_controller_1.default.deletarPerfil);
exports.default = perfilRoutes;
