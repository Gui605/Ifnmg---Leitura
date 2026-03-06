"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const denuncias_service_1 = __importDefault(require("./denuncias.service"));
const AppError_1 = require("../../shared/utils/AppError");
const criar = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const perfilId = req.perfil_id;
    const postId = Number(req.params.postId);
    if (!perfilId)
        throw AppError_1.AppError.unauthorized('Acesso não autorizado.');
    if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
        throw AppError_1.AppError.badRequest('ID inválido.');
    }
    const payload = 'motivo' in req.body ? { denuncia_tipo: 1, descricao: req.body.motivo } : req.body;
    const created = await denuncias_service_1.default.registrarDenuncia(perfilId, postId, payload, req.requestId);
    return res.status(201).json({ status: 'success', message: 'Denúncia registrado com sucesso.', data: created, meta: null });
});
exports.default = { criar };
