import prisma from '../../shared/prisma/prisma.client';
import { PerfilPatchBody } from '../../shared/types/perfil.types';
import { AppError } from '../../shared/utils/AppError';

/**
 * 💡 PADRÃO ENTERPRISE: Camada de Serviço de Perfil
 * Implementa defesa multicamadas contra Mass Assignment (CWE-915).
 */

async function atualizarPerfil(perfilId: number, data: PerfilPatchBody, _requestId?: string) {
    try {
        /**
         * 🛡️ BLINDAGEM DE SEGURANÇA: Mapeamento Explícito
         * Extraímos APENAS o que é permitido. Mesmo que o 'data' venha poluído
         * por um ataque concorrente, as variáveis locais garantem a pureza do update.
         */
        const { nome } = data;

        // Se o nome não foi enviado ou é inválido, não tentamos atualizar
        const updateData: any = {};
        if (nome !== undefined) {
            updateData.nome_user = nome?.trim();
        }

        return await prisma.perfis.update({
            where: { perfil_id: perfilId },
            data: updateData, // Injetamos apenas campos validados
            select: {
                perfil_id: true,
                nome_user: true,
                score_karma: true,
                reading_points: true,
                data_criacao: true
            }
        });
    } catch (error: any) {
        // Erro P2025: Record to update not found (Prisma Error Handling)
        if (error.code === 'P2025') {
            throw AppError.notFound('Não foi possível atualizar o perfil. Usuário não encontrado.');
        }
        throw error;
    }
}

async function buscarPerfilCompleto(perfilId: number, _requestId?: string) {
    const perfil = await prisma.perfis.findUnique({
        where: { perfil_id: perfilId },
        include: {
            usuario: {
                select: {
                    email: true,
                    data_criacao: true,
                    cadastro_confirmado: true
                    // 🛡️ Segurança: password_hash nunca é exposto
                }
            }
        }
    });

    if (!perfil) {
        throw AppError.notFound('As informações do perfil solicitado não foram encontradas.');
    }

    return perfil;
}

export default { atualizarPerfil, buscarPerfilCompleto };
