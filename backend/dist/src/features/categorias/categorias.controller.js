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
exports.deixarDeSeguirCategoriaController = exports.seguirCategoriaController = exports.listarInteressesCategoria = void 0;
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const categorias_service_1 = __importStar(require("./categorias.service"));
const categoria_types_1 = require("../../shared/types/categoria.types");
const AppError_1 = require("../../shared/utils/AppError");
const listar = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const data = await categorias_service_1.default.listar(req.requestId);
    res.status(200).json({
        status: 'success',
        message: "Categorias listadas com sucesso.",
        data,
        meta: null
    });
});
const criar = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    // 🛡️ Extração limpa: O Middleware Zod já garantiu que 'nome' existe e é válido.
    const { nome } = req.body;
    const nova = await categorias_service_1.default.criar({ nome }, req.requestId);
    res.status(201).json({
        status: 'success',
        message: "Categoria criada com sucesso.",
        data: nova,
        meta: null
    });
});
const atualizar = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const id = Number(req.params.id);
    const { nome } = req.body;
    // 🛡️ Proteção contra IDs malformados ou ataques de estouro de inteiro
    if (isNaN(id) || !Number.isSafeInteger(id) || id <= 0) {
        throw AppError_1.AppError.badRequest("ID de categoria inválido.");
    }
    const editada = await categorias_service_1.default.atualizar(id, { nome }, req.requestId);
    res.status(200).json({
        status: 'success',
        message: "Categoria atualizada com sucesso.",
        data: editada,
        meta: null
    });
});
const excluir = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id) || !Number.isSafeInteger(id) || id <= 0) {
        throw AppError_1.AppError.badRequest("ID de categoria inválido.");
    }
    await categorias_service_1.default.excluir(id, req.requestId);
    res.status(200).json({
        status: 'success',
        message: "Categoria excluída com sucesso.",
        data: null,
        meta: null
    });
});
exports.default = { listar, criar, atualizar, excluir };
// ====== Fusão de Interesses (Taxonomia) ======
exports.listarInteressesCategoria = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const perfilId = req.perfil_id;
    if (!perfilId || !Number.isSafeInteger(perfilId)) {
        throw AppError_1.AppError.unauthorized("Usuário não autenticado.");
    }
    const interesses = await (0, categorias_service_1.listarInteresses)(perfilId, req.requestId);
    return res.status(200).json({
        status: 'success',
        message: "Interesses listados com sucesso.",
        data: interesses,
        meta: null
    });
});
exports.seguirCategoriaController = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const perfilId = req.perfil_id;
    const categoriaId = Number(req.params.id);
    if (!perfilId || !Number.isSafeInteger(perfilId)) {
        throw AppError_1.AppError.unauthorized("Sessão inválida ou perfil não identificado.");
    }
    categoria_types_1.ToggleInteresseSchema.parse({ categoria_id: categoriaId });
    await (0, categorias_service_1.seguirCategoria)(perfilId, categoriaId, req.requestId);
    return res.status(201).json({ status: 'success', message: "Agora você segue esta categoria.", data: null, meta: null });
});
exports.deixarDeSeguirCategoriaController = (0, asyncHandler_1.tratarAssincrono)(async (req, res) => {
    const perfilId = req.perfil_id;
    const categoriaId = Number(req.params.id);
    if (!perfilId || !Number.isSafeInteger(perfilId)) {
        throw AppError_1.AppError.unauthorized("Sessão expirada. Faça login novamente.");
    }
    categoria_types_1.ToggleInteresseSchema.parse({ categoria_id: categoriaId });
    await (0, categorias_service_1.deixarDeSeguirCategoria)(perfilId, categoriaId, req.requestId);
    return res.status(200).json({ status: 'success', message: "Você deixou de seguir esta categoria.", data: null, meta: null });
});
