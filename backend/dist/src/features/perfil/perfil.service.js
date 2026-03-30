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
async function buscarPerfilCompleto(perfilId, visitanteId, _requestId) {
    const isOwner = visitanteId === perfilId;
    const perfil = await prisma_client_1.default.perfis.findUnique({
        where: { perfil_id: perfilId },
        include: {
            usuario: isOwner ? {
                select: {
                    email: true,
                    data_criacao: true,
                    cadastro_confirmado: true,
                    nome_campus: true
                }
            } : false,
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
    // 🛡️ AGREGAÇÃO DE ESTATÍSTICAS E RELAÇÕES (Execução em Paralelo via Promise.all)
    const [totalPosts, totalCurtidas, totalSeguidores, totalSeguindo, isFollowing] = await Promise.all([
        prisma_client_1.default.posts.count({ where: { autor_id: perfilId } }),
        prisma_client_1.default.votos.count({ where: { post: { autor_id: perfilId }, tipo: 'UP' } }),
        prisma_client_1.default.seguidores.count({ where: { seguido_id: perfilId } }),
        prisma_client_1.default.seguidores.count({ where: { seguidor_id: perfilId } }),
        !isOwner && visitanteId
            ? prisma_client_1.default.seguidores.findUnique({
                where: {
                    seguidor_id_seguido_id: {
                        seguidor_id: visitanteId,
                        seguido_id: perfilId
                    }
                }
            }).then(res => !!res)
            : Promise.resolve(false)
    ]);
    return {
        ...perfil,
        is_following: isFollowing,
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
/**
 * 🚀 MOTOR DE XP (Versão 2.0)
 * Implementa decaimento temporal, limites diários e especialização por categoria.
 */
async function processarGanhoXP(perfilId, evento, requestId, dataCriacaoPost) {
    // 1. Identifica a categoria e o valor base
    let xpBase = 0;
    let categoria = 'xp_social';
    if (evento in gamificacao_config_1.CATEGORIA_ESCRITA) {
        xpBase = gamificacao_config_1.CATEGORIA_ESCRITA[evento];
        categoria = 'xp_escrita';
    }
    else if (evento in gamificacao_config_1.CATEGORIA_CURADORIA) {
        xpBase = gamificacao_config_1.CATEGORIA_CURADORIA[evento];
        categoria = 'xp_curadoria';
    }
    else if (evento in gamificacao_config_1.CATEGORIA_SOCIAL) {
        xpBase = gamificacao_config_1.CATEGORIA_SOCIAL[evento];
        categoria = 'xp_social';
    }
    else {
        return; // Evento não mapeado
    }
    // 2. Aplica Decaimento Temporal (Apenas para Categoria Social/Karma)
    let xpFinal = xpBase;
    if (categoria === 'xp_social' && dataCriacaoPost) {
        xpFinal = (0, gamificacao_config_1.calcularXpComDecaimento)(xpBase, dataCriacaoPost);
    }
    // 3. Verifica Limite Diário (Anti-Spam/Viral)
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const logsHoje = await prisma_client_1.default.logAtividade.findMany({
        where: {
            perfil_id: perfilId,
            data: { gte: inicioDia }
        }
    });
    const xpHoje = logsHoje.reduce((acc, log) => {
        const detalhes = log.detalhes;
        return acc + (detalhes?.xpGanho || 0);
    }, 0);
    if (xpHoje >= gamificacao_config_1.LIMITES_DIARIOS.MAX_XP_POR_DIA) {
        await (0, logService_1.registrar)(perfilId, 'XP_LIMIT_REACHED', { evento, xpTentativa: xpFinal }, requestId);
        return;
    }
    // Garante que o ganho não ultrapasse o limite diário restante
    const restoParaLimite = gamificacao_config_1.LIMITES_DIARIOS.MAX_XP_POR_DIA - xpHoje;
    xpFinal = Math.min(xpFinal, restoParaLimite);
    // 4. ATOMICIDADE: Atualiza XP Total, XP por Categoria e Level
    const perfilAtualizado = await prisma_client_1.default.$transaction(async (tx) => {
        const pAntigo = await tx.perfis.findUnique({
            where: { perfil_id: perfilId },
            select: { xp_social: true }
        });
        const p = await tx.perfis.update({
            where: { perfil_id: perfilId },
            data: {
                xp: { increment: xpFinal },
                [categoria]: { increment: xpFinal }
            },
            select: { xp: true, level: true, xp_escrita: true, xp_curadoria: true, xp_social: true }
        });
        const novoLevel = (0, gamificacao_config_1.calcularNivel)(p.xp);
        let finalPerfil = p;
        if (novoLevel > p.level) {
            finalPerfil = await tx.perfis.update({
                where: { perfil_id: perfilId },
                data: { level: novoLevel },
                include: { titulos: { include: { titulo: true } } }
            });
        }
        return { ...finalPerfil, xpSocialAntigo: pAntigo?.xp_social || 0 };
    });
    // 5. Registro e Verificação de Títulos (Otimizado)
    await (0, logService_1.registrar)(perfilId, evento, { xpGanho: xpFinal, categoria }, requestId);
    console.log(`[GAMIFICACAO] Perfil ${perfilId} recebeu ${xpFinal} XP na categoria ${categoria} via evento ${evento}`);
    // 🚀 PERFORMANCE: Só verifica títulos se for categoria de ESCRITA ou se atingir marco de 100 em SOCIAL
    // Lógica de 'transição de faixa' para evitar pular marcos de títulos
    const cruzouFaixaSocial = Math.floor(perfilAtualizado.xpSocialAntigo / 100) < Math.floor(perfilAtualizado.xp_social / 100);
    const deveVerificarTitulos = categoria === 'xp_escrita' ||
        (categoria === 'xp_social' && cruzouFaixaSocial);
    if (deveVerificarTitulos) {
        // 🛡️ PROTEÇÃO CONTRA CRASH: Gamificação não deve quebrar a ação principal (ex: criar obra)
        try {
            await atribuirTitulosPorMerito(perfilId, requestId);
        }
        catch (error) {
            console.error(`[GAMIFICACAO] Falha ao atribuir títulos para perfil ${perfilId}:`, error);
            // Não re-throw: o usuário deve ganhar sua obra mesmo que o título falhe
        }
    }
    return perfilAtualizado;
}
function getPatentePorNivel(level) {
    let patente = gamificacao_config_1.PATENTES_GLOBAIS[0].nome;
    for (const p of gamificacao_config_1.PATENTES_GLOBAIS) {
        if (level >= p.nivel) {
            patente = p.nome;
        }
        else {
            break;
        }
    }
    return patente;
}
/**
 * 🏆 GERENCIADOR DE TÍTULOS (Meritocracia IFNMG)
 * Busca o XP das categorias do perfil e compara com TITULOS_ESPECIALIDADE.
 */
async function atribuirTitulosPorMerito(perfilId, requestId) {
    // 1. Busca XP atual por categorias
    const perfil = await prisma_client_1.default.perfis.findUnique({
        where: { perfil_id: perfilId },
        select: { xp_escrita: true, xp_curadoria: true, xp_social: true }
    });
    if (!perfil)
        return;
    // 2. Busca títulos que o usuário já possui
    const titulosGanhos = await prisma_client_1.default.perfisTitulos.findMany({
        where: { perfil_id: perfilId },
        select: { titulo: { select: { nome: true } } }
    });
    // 🛡️ NUL-SAFETY: Garante que titulosGanhos e seus itens existam antes de mapear
    const nomesTitulosGanhos = (titulosGanhos || [])
        .filter(tg => tg && tg.titulo && tg.titulo.nome)
        .map(tg => tg.titulo.nome);
    // 3. Itera sobre a configuração de títulos de especialidade
    for (const tConfig of gamificacao_config_1.TITULOS_ESPECIALIDADE) {
        if (nomesTitulosGanhos.includes(tConfig.nome))
            continue;
        // Mapeia a categoria da config para o campo do banco
        const campoXp = tConfig.categoria === 'ESCRITA' ? 'xp_escrita' :
            tConfig.categoria === 'CURADORIA' ? 'xp_curadoria' : 'xp_social';
        const xpNaCategoria = perfil[campoXp] || 0;
        if (xpNaCategoria >= tConfig.exigenciaXp) {
            // 🛡️ TRANSACAO: Garante integridade ao atribuir título
            try {
                await prisma_client_1.default.$transaction(async (tx) => {
                    // Busca ou cria o título no banco de dados
                    const tituloBanco = await tx.titulos.upsert({
                        where: { nome: tConfig.nome },
                        update: {},
                        create: {
                            nome: tConfig.nome,
                            categoria: tConfig.categoria,
                            requisito: tConfig.exigenciaXp,
                            descricao: `Título de Especialidade: ${tConfig.categoria}`
                        }
                    });
                    // Atribui o título ao perfil
                    await tx.perfisTitulos.create({
                        data: {
                            perfil_id: perfilId,
                            titulo_id: tituloBanco.titulo_id
                        }
                    });
                });
                await (0, logService_1.registrar)(perfilId, 'TITULO_ESPECIALIDADE_GANHO', {
                    titulo: tConfig.nome,
                    categoria: tConfig.categoria
                }, requestId);
                console.log(`[MERITO] Perfil ${perfilId} conquistou o título: ${tConfig.nome}`);
            }
            catch (txError) {
                // Se falhar um título específico, logamos e continuamos para o próximo (ou ignoramos o erro)
                console.error(`[MERITO] Erro ao atribuir título ${tConfig.nome} para perfil ${perfilId}:`, txError);
            }
        }
    }
}
/**
 * 🛡️ PRE-FLIGHT CHECK DE EXCLUSÃO (LGPD)
 * Verifica se o usuário possui impedimentos para deletar a conta.
 */
async function checkPendenciasExclusao(perfilId) {
    const usuario = await prisma_client_1.default.usuarios.findUnique({
        where: { perfil_id: perfilId },
        select: { is_admin: true, usuario_id: true }
    });
    if (!usuario)
        throw AppError_1.AppError.notFound('Usuário não encontrado.');
    // 1. Verifica se é Dono de comunidades com outros membros
    const comunidadesComoDono = await prisma_client_1.default.comunidades.findMany({
        where: { criador_id: perfilId },
        include: {
            _count: {
                select: { membros: true }
            }
        }
    });
    const comunidadesImpeditivas = comunidadesComoDono
        .filter(c => c._count.membros > 1)
        .map(c => ({
        id: c.comunidade_id,
        nome: c.nome,
        totalMembros: c._count.membros
    }));
    return {
        podeExcluir: comunidadesImpeditivas.length === 0 && !usuario.is_admin,
        comunidadesImpeditivas,
        isRootAdmin: usuario.is_admin
    };
}
exports.default = { atualizarPerfil, buscarPerfilCompleto, seguirPerfil, deixarDeSeguirPerfil, processarGanhoXP, atribuirTitulosPorMerito, checkPendenciasExclusao };
