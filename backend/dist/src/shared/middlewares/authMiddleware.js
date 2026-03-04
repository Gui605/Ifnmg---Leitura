"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.middlewareAutenticacao = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const AppError_1 = require("../utils/AppError");
const ErrorCodes_1 = require("../../errors/ErrorCodes");
const jwtUtils_1 = require("../utils/jwtUtils");
const prisma_client_1 = __importDefault(require("../prisma/prisma.client"));
const middlewareAutenticacao = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(AppError_1.AppError.unauthorized('Acesso negado. Token não fornecido ou mal formatado.'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, jwtUtils_1.verificarToken)(token);
        const usuario = await prisma_client_1.default.usuarios.findUnique({
            where: { usuario_id: decoded.usuario_id },
            select: { token_version: true }
        });
        if (!usuario || typeof decoded.token_version !== 'number' || usuario.token_version !== decoded.token_version) {
            return next(AppError_1.AppError.unauthorized('Sessão revogada.'));
        }
        req.usuario_id = decoded.usuario_id;
        req.perfil_id = decoded.perfil_id;
        req.is_admin = decoded.is_admin;
        return next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            return next(new AppError_1.AppError('Sua sessão expirou. Por favor, faça login novamente.', 401, ErrorCodes_1.ErrorCodes.TOKEN_EXPIRED));
        }
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            return next(new AppError_1.AppError('Token de autenticação inválido ou corrompido.', 401, ErrorCodes_1.ErrorCodes.TOKEN_INVALID));
        }
        return next(AppError_1.AppError.unauthorized('Falha na autenticação. Tente realizar o login novamente.'));
    }
};
exports.middlewareAutenticacao = middlewareAutenticacao;
