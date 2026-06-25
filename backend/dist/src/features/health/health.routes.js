"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_controller_1 = __importDefault(require("./health.controller"));
const rateLimiter_1 = require("../../shared/middlewares/rateLimiter");
const healthRoutes = (0, express_1.Router)();
/**
 * Rota de Health Check
 * pública, mas protegida por Rate Limiter específico.
 */
healthRoutes.get('/', rateLimiter_1.limitadorSaude, health_controller_1.default.checkHealth);
//Endpoint bem leve para verificar se o processo está rodando.
// Não envolve banco ou serviços externos.
healthRoutes.get('/live', health_controller_1.default.checkLiveness);
// Esse endpoint serve para confirmar se o CORS e a rede estão OK sem interferência de auth.
healthRoutes.get('/ping', (req, res) => {
    res.status(200).json({ message: 'Conexão OK!' });
});
exports.default = healthRoutes;
