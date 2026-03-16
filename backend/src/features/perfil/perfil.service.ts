//backend/src/features/perfil/perfil.service.ts
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
        throw AppError.notFound('As informações do perfil solicitado não foram encontradas.');
    }

    // 🛡️ AGREGAÇÃO DE ESTATÍSTICAS
    const [totalPosts, totalCurtidas, totalSeguidores, totalSeguindo] = await Promise.all([
        prisma.posts.count({ where: { autor_id: perfilId } }),
        prisma.votos.count({ where: { post: { autor_id: perfilId }, tipo: 'UP' } }),
        prisma.seguidores.count({ where: { seguido_id: perfilId } }),
        prisma.seguidores.count({ where: { seguidor_id: perfilId } })
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
async function seguirPerfil(seguidorId: number, seguidoId: number, requestId?: string) {
    if (seguidorId === seguidoId) {
        throw AppError.badRequest('Você não pode seguir a si mesmo.');
    }

    const seguidoExiste = await prisma.perfis.findUnique({
        where: { perfil_id: seguidoId },
        select: { perfil_id: true }
    });

    if (!seguidoExiste) {
        throw AppError.notFound('O perfil que você tenta seguir não existe.');
    }

    await prisma.seguidores.upsert({
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

async function deixarDeSeguirPerfil(seguidorId: number, seguidoId: number, requestId?: string) {
    try {
        await prisma.seguidores.delete({
            where: {
                seguidor_id_seguido_id: {
                    seguidor_id: seguidorId,
                    seguido_id: seguidoId
                }
            }
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            throw AppError.notFound('Você não segue este perfil.');
        }
        throw error;
    }
}

import { REGRAS_XP, PATENTES } from '../../shared/utils/gamificacao.config';
import { registrar as registrarLog } from '../../shared/utils/logService';

// ... (código existente)

async function processarGanhoXP(perfilId: number, evento: keyof typeof REGRAS_XP, requestId?: string) {
  const xpGanho = REGRAS_XP[evento];
  if (!xpGanho) return;

  const perfil = await prisma.perfis.update({
    where: { perfil_id: perfilId },
    data: { xp: { increment: xpGanho } },
    select: { xp: true, level: true }
  });

  await registrarLog(perfilId, evento, { xpGanho }, requestId);

  // Lógica de Level Up
  const novoLevel = Math.floor(perfil.xp / 1000); // Exemplo: 1000 XP por nível
  if (novoLevel > perfil.level) {
    await prisma.perfis.update({
      where: { perfil_id: perfilId },
      data: { level: novoLevel }
    });
    await registrarLog(perfilId, 'LEVEL_UP', { novoLevel }, requestId);
    await verificarNovosTitulos(perfilId, requestId);
  }
}

function getPatentePorNivel(level: number): string {
  let patente = PATENTES[0].nome;
  for (const p of PATENTES) {
    if (level >= p.nivel) {
      patente = p.nome;
    } else {
      break;
    }
  }
  return patente;
}

async function verificarNovosTitulos(perfilId: number, requestId?: string) {
  const eventos = await prisma.logAtividade.groupBy({
    by: ['evento'],
    where: { perfil_id: perfilId },
    _count: {
      evento: true
    }
  });

  const titulosDisponiveis = await prisma.titulos.findMany();
  const titulosGanhos = await prisma.perfisTitulos.findMany({ where: { perfil_id: perfilId } });

  for (const titulo of titulosDisponiveis) {
    const jaPossui = titulosGanhos.some(t => t.titulo_id === titulo.titulo_id);
    if (jaPossui) continue;

    const contagemEvento = eventos.find(e => e.evento === titulo.categoria)?._count.evento || 0;

    if (contagemEvento >= titulo.requisito) {
      await prisma.perfisTitulos.create({
        data: {
          perfil_id: perfilId,
          titulo_id: titulo.titulo_id
        }
      });
      await registrarLog(perfilId, 'TITULO_GANHO', { titulo: titulo.nome }, requestId);
    }
  }
}

export default { atualizarPerfil, buscarPerfilCompleto, seguirPerfil, deixarDeSeguirPerfil, processarGanhoXP };
