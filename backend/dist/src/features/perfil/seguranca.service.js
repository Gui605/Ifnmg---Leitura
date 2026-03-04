"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("../../shared/prisma/prisma.client"));
const hashing_1 = require("../../shared/utils/hashing");
const AppError_1 = require("../../shared/utils/AppError");
const logger_1 = require("../../shared/utils/logger");
const SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
/**
 * 💡 PADRÃO ENTERPRISE: Camada de Operações Críticas de Segurança
 * Gerencia o ciclo de vida de credenciais e encerramento de contas.
 */
async function alterarSenha(usuarioId, senhaAntiga, novaSenha, requestId) {
    const user = await prisma_client_1.default.usuarios.findUnique({
        where: { usuario_id: usuarioId }
    });
    if (!user)
        throw AppError_1.AppError.notFound('Usuário não encontrado.');
    // 1. Validar senha antiga (Prova de Posse)
    const isPasswordValid = await (0, hashing_1.compararSenha)(senhaAntiga, user.password_hash);
    if (!isPasswordValid) {
        logger_1.logger.warn('Tentativa de alteração de senha com credenciais inválidas', { evento: 'USER_PASSWORD_CHANGE_FAILED', usuario_id: usuarioId, requestId });
        throw AppError_1.AppError.unauthorized('A senha atual informada está incorreta.');
    }
    // 2. Checagem de complexidade (Server-side defense)
    if (!SENHA_FORTE.test(novaSenha)) {
        throw AppError_1.AppError.badRequest('A senha deve conter ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números.');
    }
    // 3. Política de Não-Reutilização
    const isSameAsOld = await (0, hashing_1.compararSenha)(novaSenha, user.password_hash);
    if (isSameAsOld) {
        throw AppError_1.AppError.badRequest('A nova senha não pode ser igual à senha atual.');
    }
    const novoHash = await (0, hashing_1.gerarHashSenha)(novaSenha);
    await prisma_client_1.default.usuarios.update({
        where: { usuario_id: usuarioId },
        data: { password_hash: novoHash }
    });
    logger_1.logger.info('Senha alterada com sucesso', { evento: 'USER_PASSWORD_CHANGE_SUCCEEDED', usuario_id: usuarioId, requestId });
    return 'Sua senha foi alterada com sucesso.';
}
async function deletarConta(usuarioId, senhaAtual, requestId) {
    const user = await prisma_client_1.default.usuarios.findUnique({
        where: { usuario_id: usuarioId }
    });
    if (!user)
        throw AppError_1.AppError.notFound('Usuário não encontrado.');
    // 1. Confirmação de Identidade para Operação Destrutiva
    const isPasswordValid = await (0, hashing_1.compararSenha)(senhaAtual, user.password_hash);
    if (!isPasswordValid) {
        throw AppError_1.AppError.unauthorized('Senha incorreta. A exclusão da conta foi cancelada por segurança.');
    }
    // 🛡️ Preservação de Conteúdo com Anonimização por Reatribuição
    const anonProfile = await prisma_client_1.default.perfis.findFirst({
        where: { nome_user: 'Usuário Excluído' },
        select: { perfil_id: true }
    });
    let anonPerfilId = anonProfile?.perfil_id;
    // Se não existir (ambiente sem seed), cria dinamicamente
    if (!anonPerfilId) {
        const created = await prisma_client_1.default.perfis.create({
            data: {
                nome_user: 'Usuário Excluído',
                usuario: {
                    create: {
                        email: `excluido+${Date.now()}@system.local`,
                        password_hash: user.password_hash,
                        cadastro_confirmado: true,
                        is_admin: false
                    }
                }
            },
            select: { perfil_id: true }
        });
        anonPerfilId = created.perfil_id;
    }
    // Transação: reatribui posts e exclui usuário (perfil é removido via CASCADE)
    await prisma_client_1.default.$transaction([
        prisma_client_1.default.posts.updateMany({
            where: { autor_id: user.perfil_id },
            data: { autor_id: anonPerfilId }
        }),
        prisma_client_1.default.usuarios.delete({
            where: { usuario_id: usuarioId },
        })
    ]);
    logger_1.logger.info('Conta excluída com sucesso', { evento: 'USER_ACCOUNT_DELETED', usuario_id: usuarioId, requestId });
    return 'Sua conta foi excluída com sucesso. Suas publicações foram preservadas de forma anônima.';
}
exports.default = { alterarSenha, deletarConta };
