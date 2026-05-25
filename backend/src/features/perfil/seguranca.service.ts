import prisma from '../../shared/prisma/prisma.client';
import { gerarHashSenha, compararSenha } from '../../shared/utils/hashing';
import { AppError } from '../../shared/utils/AppError';
import { logger } from '../../shared/utils/logger';

const SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


async function alterarSenha(usuarioId: number, senhaAntiga: string, novaSenha: string, requestId?: string): Promise<string> {
    const user = await prisma.usuarios.findUnique({ 
        where: { usuario_id: usuarioId } 
    });

    if (!user) throw AppError.notFound('Usuário não encontrado.');

    // Validar senha antiga
    const isPasswordValid = await compararSenha(senhaAntiga, user.password_hash);
    if (!isPasswordValid) { 
        logger.warn('Tentativa de alteração de senha com credenciais inválidas', { evento: 'USER_PASSWORD_CHANGE_FAILED', usuario_id: usuarioId, requestId });
        throw AppError.unauthorized('A senha atual informada está incorreta.'); 
    }

    // Checagem de complexidade
    if (!SENHA_FORTE.test(novaSenha)) {
        throw AppError.badRequest('A senha deve conter ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números.');
    }
    
    // Política de Não-Reutilização
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

/**
 * Refatorado para garantir que dados de auditoria permaneçam internamente
 * enquanto a identidade pública é totalmente removida.
 */
async function deletarConta(usuarioId: number, senhaAtual: string, requestId?: string): Promise<string> {
    const user = await prisma.usuarios.findUnique({ 
        where: { usuario_id: usuarioId },
        include: { perfil: true }
    });

    if (!user) throw AppError.notFound('Usuário não encontrado.');

    // Confirmação de Identidade
    const isPasswordValid = await compararSenha(senhaAtual, user.password_hash);
    if (!isPasswordValid) { 
        throw AppError.unauthorized('Senha incorreta. A exclusão da conta foi cancelada por segurança.'); 
    }

    // Bloqueio de Segurança para Admins
    if (user.is_admin) {
        throw AppError.forbidden('Administradores não podem excluir a própria conta. Remova seu cargo primeiro.');
    }

    // Transação de Anonimização (Padrão LGPD)
    await prisma.$transaction(async (tx) => {
        // Limpeza de Comunidades (Dono Solitário)
        const comunidadesSolo = await tx.comunidades.findMany({
            where: { criador_id: user.perfil_id },
            include: { _count: { select: { membros: true } } }
        });

        for (const com of comunidadesSolo) {
            if (com._count.membros <= 1) {
                await tx.comunidades.delete({ where: { comunidade_id: com.comunidade_id } });
            }
        }

        // Anonimização do Perfil (Identidade Pública)
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

        // Anonimização do Usuário (Identidade de Acesso)
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

        // Limpeza de Relações Voláteis
        await tx.seguidores.deleteMany({
            where: { OR: [{ seguidor_id: user.perfil_id }, { seguido_id: user.perfil_id }] }
        });
        await tx.notificacoes.deleteMany({ where: { perfil_id: user.perfil_id } });
    });

    logger.info('Conta anonimizada com sucesso', { evento: 'USER_ACCOUNT_ANONYMIZED', usuario_id: usuarioId, requestId });
    return 'Sua conta foi excluída e seus dados foram anonimizados conforme a LGPD.';
}

export default { alterarSenha, deletarConta };
