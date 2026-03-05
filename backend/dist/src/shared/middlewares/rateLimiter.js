"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limitadorLeitura = exports.limitadorEngajamento = exports.limitadorSaude = exports.limitadorLogin = exports.limitadorRegistro = void 0;
// 1. Atualize o import
const express_rate_limit_1 = require("express-rate-limit");
const AppError_1 = require("../utils/AppError");
const createRateLimiter = (maxRequests, windowMinutes, customMessage, useIdentity = true) => {
    return (0, express_rate_limit_1.rateLimit)({
        windowMs: windowMinutes * 60 * 1000,
        max: maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        // 3. Atualize o keyGenerator para aceitar 'res' e usar o helper
        keyGenerator: (req, res) => {
            if (useIdentity && req.perfil_id) {
                return String(req.perfil_id);
            }
            // O 'as any' resolve o conflito de tipos entre bibliotecas diferentes
            return (0, express_rate_limit_1.ipKeyGenerator)(req, res);
        },
        handler: (req, res, next) => {
            next(AppError_1.AppError.rateLimit(customMessage));
        },
    });
};
// --- Modelos de Limitadores Reutilizáveis ---
/**
 * 🛡️ 1. authActionLimiter: Proteção para Registro e Recuperação
 * Bloqueia ataques de inundação de e-mail e criação massiva de contas (5 tentativas por 15min).
 */
exports.limitadorRegistro = createRateLimiter(20, 15, 'Muitas tentativas de registro detectadas. Tente novamente mais tarde.', false);
/**
 * 🛡️ 2. loginLimiter: Proteção contra Força Bruta (Brute Force)
 * Bloqueia tentativas sequenciais de adivinhação de senhas (10 tentativas por 5min).
 */
exports.limitadorLogin = createRateLimiter(15, 5, 'Limite de tentativas de login excedido. Tente novamente em 5 minutos.', false);
/**
 * 🛡️ 3. limitadorSaude: Proteção para Endpoint de Health Check
 * Permite monitoramento frequente (30 req/min) mas bloqueia abusos.
 */
exports.limitadorSaude = createRateLimiter(30, 1, 'Muitas verificações de saúde. Reduza a frequência do monitoramento.', false);
exports.limitadorEngajamento = createRateLimiter(10, 1, 'Muitas ações de engajamento em curto intervalo. Aguarde um momento.', true);
exports.limitadorLeitura = createRateLimiter(200, 1, 'Muitas requisições de leitura em curto intervalo. Aguarde um momento.', true);
