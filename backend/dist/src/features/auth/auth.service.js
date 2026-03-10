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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("../../shared/prisma/prisma.client"));
const hashing_1 = require("../../shared/utils/hashing");
const jwtUtils_1 = require("../../shared/utils/jwtUtils");
const serviceEmail_1 = require("../../shared/utils/serviceEmail");
const AppError_1 = require("../../shared/utils/AppError");
const ErrorCodes_1 = require("../../errors/ErrorCodes"); // Importação necessária para códigos manuais
const crypto = __importStar(require("crypto"));
const logService_1 = require("../../shared/utils/logService");
const logger_1 = require("../../shared/utils/logger");
/**
 * 🛡️ PADRÃO ENTERPRISE: Camada de Serviço de Autenticação
 * Sincronizado com ErrorCodes e Factory Methods.
 */
async function registrarUsuario(data, requestId) {
    const { email, senha, nome_completo, nome_campus, data_nascimento, nome_user } = data;
    const tokenVerificacao = crypto.randomBytes(32).toString('hex');
    const dataExpiracao = new Date(Date.now() + 1 * 60 * 60 * 1000);
    const senhaHashed = await (0, hashing_1.gerarHashSenha)(senha);
    let novoPerfilId;
    let novoUsuarioId;
    try {
        const emailNormalizado = email.toLowerCase().trim();
        // 🔍 NOVO: Verificação profunda do estado do usuário existente
        const existente = await prisma_client_1.default.usuarios.findUnique({
            where: { email: emailNormalizado },
            select: {
                usuario_id: true,
                cadastro_confirmado: true,
                expiracao_pendente: true
            }
        });
        const perfilExistente = await prisma_client_1.default.perfis.findUnique({
            where: { nome_user: nome_user.trim() }
        });
        if (perfilExistente) {
            throw AppError_1.AppError.conflict('Este nome de usuário já está em uso.');
        }
        if (existente) {
            // CASO A: Usuário já é ativo (Segurança: Lança 409 para evitar duplicação)
            if (existente.cadastro_confirmado) {
                logger_1.logger.warn('Tentativa de cadastro com e-mail já confirmado', { evento: 'AUTH_REGISTRATION_ATTEMPT_DUPLICATE', email: emailNormalizado, requestId });
                // Timing attack protection
                await (0, hashing_1.gerarHashSenha)(senha);
                await new Promise((r) => setTimeout(r, 300));
                throw AppError_1.AppError.conflict('Este e-mail já possui uma conta ativa.');
            }
            // CASO B: Cadastro Pendente e link ainda válido (UX: Orienta ir ao e-mail)
            const agora = new Date();
            if (existente.expiracao_pendente && existente.expiracao_pendente > agora) {
                logger_1.logger.info('Tentativa de cadastro com conta pendente válida', { evento: 'AUTH_REGISTRATION_PENDING_VALID', email: emailNormalizado, requestId });
                throw AppError_1.AppError.badRequest('Você já possui um cadastro pendente. Verifique seu e-mail.');
            }
            // CASO C: Link Expirado (Renovação automática e reenvio de e-mail)
            await prisma_client_1.default.usuarios.update({
                where: { usuario_id: existente.usuario_id },
                data: {
                    token_verificacao: tokenVerificacao,
                    expiracao_pendente: dataExpiracao
                }
            });
            setImmediate(() => {
                (0, serviceEmail_1.enviarEmailComToken)(emailNormalizado, tokenVerificacao, 'verificacao').catch(() => { });
            });
            logger_1.logger.info('Link de ativação expirado, reenviando e-mail', { evento: 'AUTH_REGISTRATION_LINK_RENEWED', email: emailNormalizado, requestId });
            throw AppError_1.AppError.gone('Vimos que seu link expirou. Enviamos uma nova chave de ativação.');
        }
        // 🛡️ LÓGICA ORIGINAL: Transação para novos registros
        await prisma_client_1.default.$transaction(async (tx) => {
            const novoPerfil = await tx.perfis.create({
                data: {
                    nome_user: nome_user.trim(),
                    score_karma: 0,
                    reading_points: 0
                }
            });
            novoPerfilId = novoPerfil.perfil_id;
            await tx.usuarios.create({
                data: {
                    email: emailNormalizado,
                    password_hash: senhaHashed,
                    perfil_id: novoPerfil.perfil_id,
                    token_verificacao: tokenVerificacao,
                    cadastro_confirmado: false,
                    expiracao_pendente: dataExpiracao,
                    nome_completo: nome_completo.trim(),
                    nome_campus: nome_campus.trim(),
                    data_nascimento: new Date(data_nascimento),
                },
            });
            const usuarioCriado = await tx.usuarios.findFirst({
                where: { perfil_id: novoPerfil.perfil_id },
                select: { usuario_id: true }
            });
            novoUsuarioId = usuarioCriado?.usuario_id;
        });
    }
    catch (error) {
        // Preserva o tratamento de erro original para restrições de banco (P2002)
        if (error.code === 'P2002') {
            logger_1.logger.warn('Tentativa de cadastro com dados duplicados (P2002)', { evento: 'AUTH_REGISTRATION_ATTEMPT_DUPLICATE_P2002', requestId });
            await (0, hashing_1.gerarHashSenha)(senha);
            await new Promise((r) => setTimeout(r, 300));
            throw AppError_1.AppError.conflict('Solicitação recebida.');
        }
        throw error;
    }
    // Disparo de e-mail para NOVOS cadastros (fora do bloco catch/if)
    setImmediate(() => { (0, serviceEmail_1.enviarEmailComToken)(email, tokenVerificacao, 'verificacao').catch(() => { }); });
    return `Cadastro realizado! Enviamos um link de ativação para ${email}.`;
}
async function logarUsuario(email, senha, requestId) {
    const user = await prisma_client_1.default.usuarios.findUnique({ where: { email } });
    // 🛡️ Segurança: Usamos Factory Method para 401
    if (!user) {
        throw AppError_1.AppError.unauthorized('E-mail ou senha incorretos.');
    }
    if (!user.cadastro_confirmado) {
        const agora = new Date();
        if (user.expiracao_pendente && user.expiracao_pendente < agora) {
            const novoToken = crypto.randomBytes(32).toString('hex');
            const novaExp = new Date(Date.now() + 1 * 60 * 60 * 1000);
            await prisma_client_1.default.usuarios.update({
                where: { usuario_id: user.usuario_id },
                data: { token_verificacao: novoToken, expiracao_pendente: novaExp },
            });
            setImmediate(() => { (0, serviceEmail_1.enviarEmailComToken)(user.email, novoToken, 'verificacao').catch(() => { }); });
            // 🛡️ 410 Gone: Lançamento manual para casos específicos de expiração
            throw new AppError_1.AppError(`Seu link de ativação expirou. Enviamos um novo para ${user.email}.`, 410, ErrorCodes_1.ErrorCodes.TOKEN_EXPIRED);
        }
        // 🛡️ 403 Forbidden: Conta inativa
        throw new AppError_1.AppError('Sua conta ainda não foi ativada. Verifique seu e-mail para confirmar o cadastro.', 403, ErrorCodes_1.ErrorCodes.FORBIDDEN);
    }
    const senhaValida = await (0, hashing_1.compararSenha)(senha, user.password_hash);
    if (!senhaValida) {
        throw AppError_1.AppError.unauthorized('E-mail ou senha incorretos.');
    }
    const rotated = await prisma_client_1.default.usuarios.update({
        where: { usuario_id: user.usuario_id },
        data: { token_version: { increment: 1 } },
        select: { usuario_id: true, perfil_id: true, is_admin: true, token_version: true }
    });
    const token = (0, jwtUtils_1.gerarToken)({
        usuario_id: rotated.usuario_id,
        perfil_id: rotated.perfil_id,
        is_admin: rotated.is_admin,
        token_version: rotated.token_version
    });
    try {
        await (0, logService_1.registrar)(rotated.perfil_id, 'USER_LOGIN', { usuario_id: rotated.usuario_id }, requestId);
    }
    catch { }
    return token;
}
async function verificarConta(token, requestId) {
    const user = await prisma_client_1.default.usuarios.findFirst({
        where: { token_verificacao: token }
    });
    if (!user) {
        throw AppError_1.AppError.badRequest('Link de ativação inválido ou já utilizado.');
    }
    if (user.expiracao_pendente && user.expiracao_pendente < new Date()) {
        throw new AppError_1.AppError('Este link expirou. Tente fazer login para receber um novo e-mail de ativação.', 410, ErrorCodes_1.ErrorCodes.TOKEN_EXPIRED);
    }
    await prisma_client_1.default.usuarios.update({
        where: { usuario_id: user.usuario_id },
        data: {
            cadastro_confirmado: true,
            token_verificacao: null,
            expiracao_pendente: null,
        },
    });
    return 'Conta ativada com sucesso! Você já pode fazer login.';
}
async function logoutAll(usuarioId, requestId) {
    const user = await prisma_client_1.default.usuarios.findUnique({ where: { usuario_id: usuarioId }, select: { perfil_id: true } });
    await prisma_client_1.default.usuarios.update({
        where: { usuario_id: usuarioId },
        data: { token_version: { increment: 1 } }
    });
    if (user?.perfil_id) {
        try {
            await (0, logService_1.registrar)(user.perfil_id, 'USER_LOGOUT_ALL', { usuario_id: usuarioId }, requestId);
        }
        catch { }
    }
    return 'Sessões revogadas com sucesso.';
}
exports.default = { registrarUsuario, logarUsuario, verificarConta, logoutAll };
