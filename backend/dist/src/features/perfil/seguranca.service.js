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
/**
 * 🛡️ DIREITO AO ESQUECIMENTO (LGPD) - ANONIMIZAÇÃO ATÔMICA
 * Refatorado para garantir que dados de auditoria permaneçam internamente
 * enquanto a identidade pública é totalmente removida.
 */
async function deletarConta(usuarioId, senhaAtual, requestId) {
    const user = await prisma_client_1.default.usuarios.findUnique({
        where: { usuario_id: usuarioId },
        include: { perfil: true }
    });
    if (!user)
        throw AppError_1.AppError.notFound('Usuário não encontrado.');
    // 1. Confirmação de Identidade
    const isPasswordValid = await (0, hashing_1.compararSenha)(senhaAtual, user.password_hash);
    if (!isPasswordValid) {
        throw AppError_1.AppError.unauthorized('Senha incorreta. A exclusão da conta foi cancelada por segurança.');
    }
    // 2. Bloqueio de Segurança para Admins
    if (user.is_admin) {
        throw AppError_1.AppError.forbidden('Administradores não podem excluir a própria conta. Remova seu cargo primeiro.');
    }
    // 3. Transação de Anonimização (Padrão LGPD)
    await prisma_client_1.default.$transaction(async (tx) => {
        // A. Limpeza de Comunidades (Dono Solitário)
        const comunidadesSolo = await tx.comunidades.findMany({
            where: { criador_id: user.perfil_id },
            include: { _count: { select: { membros: true } } }
        });
        for (const com of comunidadesSolo) {
            if (com._count.membros <= 1) {
                await tx.comunidades.delete({ where: { comunidade_id: com.comunidade_id } });
            }
        }
        // B. Anonimização do Perfil (Identidade Pública)
        await tx.perfis.update({
            where: { perfil_id: user.perfil_id },
            data: {
                nome_user: `Membro Deletado #${user.perfil_id}`,
                bio: null,
                curso: null,
                titulo_ativo: null,
                streak_dias: 0,
                xp: 0,
                xp_escrita: 0,
                xp_curadoria: 0,
                xp_social: 0
            }
        });
        // C. Anonimização do Usuário (Identidade de Acesso)
        // Preservamos usuario_id, nome_completo e data_nascimento para auditoria interna.
        await tx.usuarios.update({
            where: { usuario_id: usuarioId },
            data: {
                email: `deletado_${usuarioId}@portal.local`,
                password_hash: `DELETED_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                token_version: { increment: 1 },
                cadastro_confirmado: false,
                token_verificacao: null,
                token_recuperacao: null
            }
        });
        // D. Limpeza de Relações Voláteis
        await tx.seguidores.deleteMany({
            where: { OR: [{ seguidor_id: user.perfil_id }, { seguido_id: user.perfil_id }] }
        });
        await tx.notificacoes.deleteMany({ where: { perfil_id: user.perfil_id } });
    });
    logger_1.logger.info('Conta anonimizada com sucesso', { evento: 'USER_ACCOUNT_ANONYMIZED', usuario_id: usuarioId, requestId });
    return 'Sua conta foi excluída e seus dados foram anonimizados conforme a LGPD.';
}
exports.default = { alterarSenha, deletarConta };
