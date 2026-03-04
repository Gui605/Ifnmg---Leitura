"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterSegredoJwt = obterSegredoJwt;
exports.gerarToken = gerarToken;
exports.verificarToken = verificarToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_types_1 = require("../types/auth.types");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
function obterSegredoJwt() {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET não configurado.');
    }
    return JWT_SECRET;
}
/**
 * Gera um Token Web JSON (JWT) para o usuário autenticado.
 * Recebe o payload tipado conforme o contrato do sistema.
 */
function gerarToken(payload) {
    // Removemos propriedades automáticas como 'iat' e 'exp' se existirem no objeto
    // para evitar conflitos com o novo token que será gerado.
    const { iat, exp, ...cleanPayload } = payload;
    return jsonwebtoken_1.default.sign(cleanPayload, obterSegredoJwt(), { expiresIn: JWT_EXPIRES_IN });
}
/**
 * Verifica e decodifica o Token JWT.
 * O erro disparado aqui será capturado pelo authMiddleware ou optionalAuthMiddleware.
 */
function verificarToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, obterSegredoJwt());
    const payload = auth_types_1.TokenPayloadSchema.parse(decoded);
    return payload;
}
