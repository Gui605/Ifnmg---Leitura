"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.middlewareAutenticacaoOpcional = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const jwtUtils_1 = require("../utils/jwtUtils");
const prisma_client_1 = __importDefault(require("../prisma/prisma.client"));
/**
 * 💡 PADRÃO ENTERPRISE: Autenticação Opcional
 * Permite que rotas públicas identifiquem o usuário se o token existir,
 * mas não bloqueia a requisição caso o token seja inválido ou ausente.
 */
const middlewareAutenticacaoOpcional = (0, asyncHandler_1.tratarAssincrono)(async (req, _res, next) => {
    const authHeader = req.headers.authorization;
    // 🛡️ Se não houver token, define como undefined e segue (acesso público)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.usuario_id = undefined;
        req.perfil_id = undefined;
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, jwtUtils_1.verificarToken)(token);
        const usuario = await prisma_client_1.default.usuarios.findUnique({
            where: { usuario_id: decoded.usuario_id },
            select: { token_version: true }
        });
        if (!usuario || typeof decoded.token_version !== 'number' || usuario.token_version !== decoded.token_version) {
            req.usuario_id = undefined;
            req.perfil_id = undefined;
            req.is_admin = undefined;
        }
        else {
            req.usuario_id = decoded.usuario_id;
            req.perfil_id = decoded.perfil_id;
            req.is_admin = decoded.is_admin;
        }
    }
    catch (error) {
        // 🛡️ Em caso de erro (token expirado/inválido), apenas limpa os dados.
        // Diferente do authMiddleware, aqui não lançamos AppError.
        req.usuario_id = undefined;
        req.perfil_id = undefined;
        req.is_admin = undefined;
    }
    next();
});
exports.middlewareAutenticacaoOpcional = middlewareAutenticacaoOpcional;
