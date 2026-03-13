"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//backend/src/features/perfil/perfil.service.ts
const prisma_client_1 = __importDefault(require("../../shared/prisma/prisma.client"));
const AppError_1 = require("../../shared/utils/AppError");
/**
 * 💡 PADRÃO ENTERPRISE: Camada de Serviço de Perfil
 * Implementa defesa multicamadas contra Mass Assignment (CWE-915).
 */
async function atualizarPerfil(perfilId, data, _requestId) {
    try {
        /**
         * 🛡️ BLINDAGEM DE SEGURANÇA: Mapeamento Explícito
         * Extraímos APENAS o que é permitido. Mesmo que o 'data' venha poluído
         * por um ataque concorrente, as variáveis locais garantem a pureza do update.
         */
        const { nome } = data;
        // Se o nome não foi enviado ou é inválido, não tentamos atualizar
        const updateData = {};
        if (nome !== undefined) {
            updateData.nome_user = nome?.trim();
        }
        return await prisma_client_1.default.perfis.update({
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
    }
    catch (error) {
        // Erro P2025: Record to update not found (Prisma Error Handling)
        if (error.code === 'P2025') {
            throw AppError_1.AppError.notFound('Não foi possível atualizar o perfil. Usuário não encontrado.');
        }
        throw error;
    }
}
async function buscarPerfilCompleto(perfilId, _requestId) {
    const perfil = await prisma_client_1.default.perfis.findUnique({
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
        throw AppError_1.AppError.notFound('As informações do perfil solicitado não foram encontradas.');
    }
    return perfil;
}
/**
 * 💡 FOLLOW SYSTEM: Lógica de Grafo Social
 * Implementa idempotência e validação de auto-seguimento.
 */
async function seguirPerfil(seguidorId, seguidoId, requestId) {
    if (seguidorId === seguidoId) {
        throw AppError_1.AppError.badRequest('Você não pode seguir a si mesmo.');
    }
    const seguidoExiste = await prisma_client_1.default.perfis.findUnique({
        where: { perfil_id: seguidoId },
        select: { perfil_id: true }
    });
    if (!seguidoExiste) {
        throw AppError_1.AppError.notFound('O perfil que você tenta seguir não existe.');
    }
    await prisma_client_1.default.seguidores.upsert({
        where: {
            seguidor_id_seguido_id: {
                seguidor_id: seguidorId,
                seguido_id: seguidoId
            }
        },
        update: {}, // Idempotência: se já segue, não faz nada
        create: {
            seguidor_id: seguidorId,
            seguido_id: seguidoId
        }
    });
}
async function deixarDeSeguirPerfil(seguidorId, seguidoId, requestId) {
    try {
        await prisma_client_1.default.seguidores.delete({
            where: {
                seguidor_id_seguido_id: {
                    seguidor_id: seguidorId,
                    seguido_id: seguidoId
                }
            }
        });
    }
    catch (error) {
        if (error.code === 'P2025') {
            throw AppError_1.AppError.notFound('Você não segue este perfil.');
        }
        throw error;
    }
}
exports.default = { atualizarPerfil, buscarPerfilCompleto, seguirPerfil, deixarDeSeguirPerfil };
