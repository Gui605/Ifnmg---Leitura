"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("./auth.service"));
const recuperacao_service_1 = __importDefault(require("./recuperacao.service"));
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/utils/AppError");
/**
 * 💡 PADRÃO ENTERPRISE EVOLUÍDO:
 * Com o uso de Zod + validateMiddleware, as validações de Regex e Presença
 * foram movidas para a camada de contrato (shared/types/auth.types.ts).
 */
const registrar = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const { email, senha, nome_completo, nome_campus, data_nascimento, nome_user } = req.body;
    await auth_service_1.default.registrarUsuario({ email, senha, nome_completo, nome_campus, data_nascimento, nome_user }, req.requestId);
    return res.status(202).json({
        status: 'success',
        message: 'Recebemos sua solicitação. Se os dados informados forem válidos e a conta ainda não estiver ativa, um link de confirmação será enviado em instantes. Caso não receba, verifique sua caixa de spam ou tente realizar o processo novamente garantindo que o e-mail foi digitado corretamente.',
        meta: null
    });
});
const logar = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    // 🛡️ Email já chega em lowercase e senha já é garantida como string.
    const { email, senha } = req.body;
    const token = await auth_service_1.default.logarUsuario(email, senha, req.requestId);
    return res.status(200).json({
        status: 'success',
        message: 'Login realizado com sucesso.',
        data: { token },
        meta: null
    });
});
const confirmarEmail = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const { token } = req.query;
    // Manter validação manual aqui apenas se não criar um schema para Query Params
    if (!token || typeof token !== 'string' || token.trim().length !== 64) {
        throw AppError_1.AppError.badRequest('Token de verificação inválido ou expirado.');
    }
    const message = await auth_service_1.default.verificarConta(token, req.requestId);
    return res.status(200).json({
        status: 'success',
        message,
        data: null,
        meta: null
    });
});
const solicitarRecuperacao = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const { email } = req.body;
    // O Zod no authRoutes cuidará de validar o email antes de chegar aqui.
    await recuperacao_service_1.default.solicitarRecuperacao(email, req.requestId);
    return res.status(200).json({
        status: 'success',
        message: 'Se este e-mail estiver cadastrado, um link de recuperação será enviado.',
        data: null,
        meta: null
    });
});
const redefinirSenha = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const { token, novaSenha } = req.body;
    // Validações de igualdade e força de senha agora ocorrem no Zod Schema.
    await recuperacao_service_1.default.redefinirSenha(token, novaSenha, req.requestId);
    return res.status(200).json({
        status: 'success',
        message: 'Senha alterada com sucesso! Você já pode fazer login.',
        data: null,
        meta: null
    });
});
const logoutAll = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const usuarioId = req.usuario_id;
    const message = await auth_service_1.default.logoutAll(usuarioId, req.requestId);
    return res.status(200).json({
        status: 'success',
        message,
        data: null,
        meta: null
    });
});
exports.default = {
    registrar,
    logar,
    confirmarEmail,
    solicitarRecuperacao,
    redefinirSenha,
    logoutAll
};
