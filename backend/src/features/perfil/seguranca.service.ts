import prisma from '../../shared/prisma/prisma.client';
import { gerarHashSenha, compararSenha } from '../../shared/utils/hashing';
import { AppError } from '../../shared/utils/AppError';
import { logger } from '../../shared/utils/logger';

const SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * 💡 PADRÃO ENTERPRISE: Camada de Operações Críticas de Segurança
 * Gerencia o ciclo de vida de credenciais e encerramento de contas.
 */

async function alterarSenha(usuarioId: number, senhaAntiga: string, novaSenha: string, requestId?: string): Promise<string> {
    const user = await prisma.usuarios.findUnique({ 
        where: { usuario_id: usuarioId } 
    });

    if (!user) throw AppError.notFound('Usuário não encontrado.');

    // 1. Validar senha antiga (Prova de Posse)
    const isPasswordValid = await compararSenha(senhaAntiga, user.password_hash);
    if (!isPasswordValid) { 
        logger.warn('Tentativa de alteração de senha com credenciais inválidas', { evento: 'USER_PASSWORD_CHANGE_FAILED', usuario_id: usuarioId, requestId });
        throw AppError.unauthorized('A senha atual informada está incorreta.'); 
    }

    // 2. Checagem de complexidade (Server-side defense)
    if (!SENHA_FORTE.test(novaSenha)) {
        throw AppError.badRequest('A senha deve conter ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números.');
    }
    
    // 3. Política de Não-Reutilização
    const isSameAsOld = await compararSenha(novaSenha, user.password_hash);
    if (isSameAsOld) {
        throw AppError.badRequest('A nova senha não pode ser igual à senha atual.');
    }

    const novoHash = await gerarHashSenha(novaSenha);
    
    await prisma.usuarios.update({
        where: { usuario_id: usuarioId },
        data: { password_hash: novoHash }
    });

    logger.info('Senha alterada com sucesso', { evento: 'USER_PASSWORD_CHANGE_SUCCEEDED', usuario_id: usuarioId, requestId });
    return 'Sua senha foi alterada com sucesso.';
}

async function deletarConta(usuarioId: number, senhaAtual: string, requestId?: string): Promise<string> {
    const user = await prisma.usuarios.findUnique({ 
        where: { usuario_id: usuarioId } 
    });

    if (!user) throw AppError.notFound('Usuário não encontrado.');

    // 1. Confirmação de Identidade para Operação Destrutiva
    const isPasswordValid = await compararSenha(senhaAtual, user.password_hash);
    if (!isPasswordValid) { 
        throw AppError.unauthorized('Senha incorreta. A exclusão da conta foi cancelada por segurança.'); 
    }

    // 🛡️ Preservação de Conteúdo com Anonimização por Reatribuição
    const anonProfile = await prisma.perfis.findFirst({
        where: { nome_user: 'Usuário Excluído' },
        select: { perfil_id: true }
    });

    let anonPerfilId = anonProfile?.perfil_id;

    // Se não existir (ambiente sem seed), cria dinamicamente
    if (!anonPerfilId) {
        const created = await prisma.perfis.create({
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
    await prisma.$transaction([
        prisma.posts.updateMany({
            where: { autor_id: user.perfil_id },
            data: { autor_id: anonPerfilId! }
        }),
        prisma.usuarios.delete({
            where: { usuario_id: usuarioId },
        })
    ]);

    logger.info('Conta excluída com sucesso', { evento: 'USER_ACCOUNT_DELETED', usuario_id: usuarioId, requestId });
    return 'Sua conta foi excluída com sucesso. Suas publicações foram preservadas de forma anônima.';
}

export default { alterarSenha, deletarConta };
