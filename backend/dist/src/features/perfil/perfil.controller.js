"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const perfil_service_1 = __importDefault(require("./perfil.service"));
const seguranca_service_1 = __importDefault(require("./seguranca.service"));
const AppError_1 = require("../../shared/utils/AppError");
/**
 * 💡 PADRÃO ENTERPRISE EVOLUÍDO:
 * A lógica de "Gatekeeper" contra Mass Assignment foi movida para o Zod (.strict()).
 * O Controller foca exclusivamente na orquestração dos serviços.
 */
const getPerfilInfo = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const perfilId = req.user.perfil_id;
    const perfil = await perfil_service_1.default.buscarPerfilCompleto(perfilId, perfilId, req.requestId);
    return res.status(200).json({
        status: 'success',
        message: 'Perfil recuperado com sucesso.',
        data: perfil,
        meta: null
    });
});
const getPerfilPublico = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const perfilId = Number(req.params.id);
    const visitanteId = req.user?.perfil_id;
    if (isNaN(perfilId) || perfilId <= 0) {
        throw AppError_1.AppError.badRequest('ID de perfil inválido.');
    }
    const perfil = await perfil_service_1.default.buscarPerfilCompleto(perfilId, visitanteId, req.requestId);
    return res.status(200).json({
        status: 'success',
        message: 'Perfil público recuperado com sucesso.',
        data: perfil,
        meta: null
    });
});
const updatePerfil = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const perfilId = req.user.perfil_id;
    // 🛡️ O Zod já garantiu que o body contém APENAS 'nome' e que ele é válido.
    const { nome } = req.body;
    // O trim() também foi realizado automaticamente pelo Schema
    const perfilAtualizado = await perfil_service_1.default.atualizarPerfil(perfilId, { nome }, req.requestId);
    return res.status(200).json({
        status: 'success',
        message: 'Perfil atualizado com sucesso.',
        data: perfilAtualizado,
        meta: null
    });
});
const alterarSenha = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const usuarioId = req.user.usuario_id;
    // 🛡️ Validações de força de senha e "novaSenha === confirmarNovaSenha" 
    // agora ocorrem automaticamente no Zod Schema (.refine()).
    const { senhaAntiga, novaSenha } = req.body;
    const message = await seguranca_service_1.default.alterarSenha(usuarioId, senhaAntiga, novaSenha, req.requestId);
    return res.status(200).json({ status: 'success', message, data: null, meta: null });
});
const deletarPerfil = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const usuarioId = req.user.usuario_id;
    const { senhaAtual } = req.body;
    const message = await seguranca_service_1.default.deletarConta(usuarioId, senhaAtual, req.requestId);
    return res.status(200).json({ status: 'success', message, data: null, meta: null });
});
const toggleFollow = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const seguidorId = req.user.perfil_id;
    const seguidoId = Number(req.params.id);
    if (isNaN(seguidoId) || seguidoId <= 0) {
        throw AppError_1.AppError.badRequest('ID de perfil inválido.');
    }
    // Lógica de Toggle: Tenta deletar primeiro, se falhar (não segue), tenta seguir.
    // Isso economiza uma query de 'find' e mantém a atomicidade.
    try {
        await perfil_service_1.default.deixarDeSeguirPerfil(seguidorId, seguidoId, req.requestId);
        return res.status(200).json({
            status: 'success',
            message: 'Você deixou de seguir este perfil.',
            data: { seguindo: false },
            meta: null
        });
    }
    catch (error) {
        // Se o erro for que o registro não existe, então vamos seguir.
        if (error instanceof AppError_1.AppError && error.message === 'Você não segue este perfil.') {
            await perfil_service_1.default.seguirPerfil(seguidorId, seguidoId, req.requestId);
            return res.status(201).json({
                status: 'success',
                message: 'Agora você segue este perfil.',
                data: { seguindo: true },
                meta: null
            });
        }
        throw error;
    }
});
const checkPendenciasExclusao = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const perfilId = req.user.perfil_id;
    const check = await perfil_service_1.default.checkPendenciasExclusao(perfilId);
    return res.status(200).json({
        status: 'success',
        data: check
    });
});
exports.default = {
    getPerfilInfo,
    getPerfilPublico,
    updatePerfil,
    alterarSenha,
    deletarPerfil,
    toggleFollow,
    checkPendenciasExclusao
};
