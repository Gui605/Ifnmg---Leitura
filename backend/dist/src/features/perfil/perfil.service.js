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
                    cadastro_confirmado: true,
                    nome_campus: true
                }
            },
            titulos: {
                include: {
                    titulo: true
                }
            }
        }
    });
    if (!perfil) {
        throw AppError_1.AppError.notFound('As informações do perfil solicitado não foram encontradas.');
    }
    // 🛡️ AGREGAÇÃO DE ESTATÍSTICAS
    const [totalPosts, totalCurtidas, totalSeguidores, totalSeguindo] = await Promise.all([
        prisma_client_1.default.posts.count({ where: { autor_id: perfilId } }),
        prisma_client_1.default.votos.count({ where: { post: { autor_id: perfilId }, tipo: 'UP' } }),
        prisma_client_1.default.seguidores.count({ where: { seguido_id: perfilId } }),
        prisma_client_1.default.seguidores.count({ where: { seguidor_id: perfilId } })
    ]);
    return {
        ...perfil,
        estatisticas: {
            pergaminhos: totalPosts,
            curtidas: totalCurtidas,
            seguidores: totalSeguidores,
            seguindo: totalSeguindo
        }
    };
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
const gamificacao_config_1 = require("../../shared/utils/gamificacao.config");
const logService_1 = require("../../shared/utils/logService");
// ... (código existente)
async function processarGanhoXP(perfilId, evento, requestId) {
    const xpGanho = gamificacao_config_1.REGRAS_XP[evento];
    if (!xpGanho)
        return;
    const perfil = await prisma_client_1.default.perfis.update({
        where: { perfil_id: perfilId },
        data: { xp: { increment: xpGanho } },
        select: { xp: true, level: true }
    });
    await (0, logService_1.registrar)(perfilId, evento, { xpGanho }, requestId);
    // Lógica de Level Up
    const novoLevel = Math.floor(perfil.xp / 1000); // Exemplo: 1000 XP por nível
    if (novoLevel > perfil.level) {
        await prisma_client_1.default.perfis.update({
            where: { perfil_id: perfilId },
            data: { level: novoLevel }
        });
        await (0, logService_1.registrar)(perfilId, 'LEVEL_UP', { novoLevel }, requestId);
        await verificarNovosTitulos(perfilId, requestId);
    }
}
function getPatentePorNivel(level) {
    let patente = gamificacao_config_1.PATENTES[0].nome;
    for (const p of gamificacao_config_1.PATENTES) {
        if (level >= p.nivel) {
            patente = p.nome;
        }
        else {
            break;
        }
    }
    return patente;
}
async function verificarNovosTitulos(perfilId, requestId) {
    const eventos = await prisma_client_1.default.logAtividade.groupBy({
        by: ['evento'],
        where: { perfil_id: perfilId },
        _count: {
            evento: true
        }
    });
    const titulosDisponiveis = await prisma_client_1.default.titulos.findMany();
    const titulosGanhos = await prisma_client_1.default.perfisTitulos.findMany({ where: { perfil_id: perfilId } });
    for (const titulo of titulosDisponiveis) {
        const jaPossui = titulosGanhos.some(t => t.titulo_id === titulo.titulo_id);
        if (jaPossui)
            continue;
        const contagemEvento = eventos.find(e => e.evento === titulo.categoria)?._count.evento || 0;
        if (contagemEvento >= titulo.requisito) {
            await prisma_client_1.default.perfisTitulos.create({
                data: {
                    perfil_id: perfilId,
                    titulo_id: titulo.titulo_id
                }
            });
            await (0, logService_1.registrar)(perfilId, 'TITULO_GANHO', { titulo: titulo.nome }, requestId);
        }
    }
}
exports.default = { atualizarPerfil, buscarPerfilCompleto, seguirPerfil, deixarDeSeguirPerfil, processarGanhoXP };
