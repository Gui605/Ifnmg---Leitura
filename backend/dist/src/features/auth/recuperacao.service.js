"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/features/auth/recuperacao.service.ts
const prisma_client_1 = __importDefault(require("../../shared/prisma/prisma.client"));
const crypto_1 = __importDefault(require("crypto"));
const hashing_1 = require("../../shared/utils/hashing");
const serviceEmail_1 = require("../../shared/utils/serviceEmail");
const AppError_1 = require("../../shared/utils/AppError"); // 👈 Importando a nova classe
const ErrorCodes_1 = require("../../errors/ErrorCodes");
/**
 * 💡 PADRÃO ENTERPRISE:
 * 1. Uso de AppError para controle fino de status HTTP.
 * 2. Manutenção da segurança amígua (não revelar se o e-mail existe).
 * 3. Invalidação imediata do token após o uso bem-sucedido.
 */
async function solicitarRecuperacao(email, requestId) {
    const usuario = await prisma_client_1.default.usuarios.findUnique({ where: { email } });
    // 🛡️ Segurança: Retornamos sucesso silencioso mesmo se o e-mail não existir.
    // Isso evita que hackers descubram quais e-mails estão na sua base.
    if (!usuario) {
        return;
    }
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const expiracao = new Date(Date.now() + 3600000); // 1 hora de validade
    await prisma_client_1.default.usuarios.update({
        where: { email },
        data: {
            token_recuperacao: token,
            expiracao_token_recuperacao: expiracao
        }
    });
    // Envio assíncrono do e-mail
    await (0, serviceEmail_1.enviarEmailComToken)(email, token, 'recuperacao');
}
async function redefinirSenha(token, novaSenha, requestId) {
    const usuario = await prisma_client_1.default.usuarios.findFirst({
        where: { token_recuperacao: token }
    });
    // 🛡️ Erro 400: O token nem sequer existe no banco de dados.
    if (!usuario || !usuario.expiracao_token_recuperacao) {
        throw new AppError_1.AppError('Link de recuperação inválido ou já utilizado.', 400, ErrorCodes_1.ErrorCodes.TOKEN_INVALID);
    }
    // 🛡️ Erro 410 (Gone): O link existia, mas o tempo de validade acabou.
    if (usuario.expiracao_token_recuperacao < new Date()) {
        throw new AppError_1.AppError('Este link de recuperação expirou. Solicite um novo link.', 410, ErrorCodes_1.ErrorCodes.TOKEN_EXPIRED);
    }
    const novoHash = await (0, hashing_1.gerarHashSenha)(novaSenha);
    await prisma_client_1.default.usuarios.update({
        where: { usuario_id: usuario.usuario_id },
        data: {
            password_hash: novoHash,
            token_recuperacao: null,
            expiracao_token_recuperacao: null
        }
    });
}
exports.default = { solicitarRecuperacao, redefinirSenha };
