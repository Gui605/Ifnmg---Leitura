//backend/src/features/perfil/perfil.service.ts
import prisma from '../../shared/prisma/prisma.client';
import { PerfilPatchBody } from '../../shared/types/perfil.types';
import { AppError } from '../../shared/utils/AppError';



async function atualizarPerfil(perfilId: number, data: PerfilPatchBody, _requestId?: string) {
    try {
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
        // Erro P2025: registra a ser atualizado não encontrado
        if (error.code === 'P2025') {
            throw AppError.notFound('Não foi possível atualizar o perfil. Usuário não encontrado.');
        }
        throw error;
    }
}

async function buscarPerfilCompleto(perfilId: number, visitanteId?: number, _requestId?: string) {
    const isOwner = visitanteId === perfilId;

    const perfil = await prisma.perfis.findUnique({
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
        throw AppError.notFound('As informações do perfil solicitado não foram encontradas.');
    }

    // AGREGAÇÃO DE ESTATÍSTICAS E RELAÇÕES (Execução em Paralelo via Promise.all)
    const [totalPosts, totalCurtidas, totalSeguidores, totalSeguindo, isFollowing] = await Promise.all([
        prisma.posts.count({ where: { autor_id: perfilId } }),
        prisma.votos.count({ where: { post: { autor_id: perfilId }, tipo: 'UP' } }),
        prisma.seguidores.count({ where: { seguido_id: perfilId } }),
        prisma.seguidores.count({ where: { seguidor_id: perfilId } }),
        !isOwner && visitanteId
            ? prisma.seguidores.findUnique({
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
        update: {}, // se já segue, não faz nada
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

import { 
  CATEGORIA_ESCRITA, 
  CATEGORIA_CURADORIA, 
  CATEGORIA_SOCIAL, 
  PATENTES_GLOBAIS as PATENTES, 
  calcularNivel,
  calcularXpComDecaimento,
  LIMITES_DIARIOS,
  TITULOS_ESPECIALIDADE
} from '../../shared/utils/gamificacao.config';
import { registrar as registrarLog } from '../../shared/utils/logService';

/**
 * Deve ter uma implementação dedicada na função processarGanhoXP
 *  MOTOR DE XP
 * Implementa decaimento temporal, limites diários e especialização por categoria.
 */

async function processarGanhoXP(
  perfilId: number, 
  evento: string, 
  requestId?: string, 
  dataCriacaoPost?: Date
) {
  // Identifica a categoria e o valor base
  let xpBase = 0;
  let categoria: 'xp_escrita' | 'xp_curadoria' | 'xp_social' = 'xp_social';

  if (evento in CATEGORIA_ESCRITA) {
    xpBase = CATEGORIA_ESCRITA[evento as keyof typeof CATEGORIA_ESCRITA];
    categoria = 'xp_escrita';
  } else if (evento in CATEGORIA_CURADORIA) {
    xpBase = CATEGORIA_CURADORIA[evento as keyof typeof CATEGORIA_CURADORIA];
    categoria = 'xp_curadoria';
  } else if (evento in CATEGORIA_SOCIAL) {
    xpBase = CATEGORIA_SOCIAL[evento as keyof typeof CATEGORIA_SOCIAL];
    categoria = 'xp_social';
  } else {
    return; // Evento não mapeado
  }

  // Aplica Decaimento Temporal (Apenas para Categoria Social/Karma)
  let xpFinal = xpBase;
  if (categoria === 'xp_social' && dataCriacaoPost) {
    xpFinal = calcularXpComDecaimento(xpBase, dataCriacaoPost);
  }

  // Verifica Limite Diário (Anti-Spam/Viral)
  const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);

  const logsHoje = await prisma.logAtividade.findMany({
    where: {
      perfil_id: perfilId,
      data: { gte: inicioDia }
    }
  });

  const xpHoje = logsHoje.reduce((acc, log) => {
    const detalhes = log.detalhes as any;
    return acc + (detalhes?.xpGanho || 0);
  }, 0);

  if (xpHoje >= LIMITES_DIARIOS.MAX_XP_POR_DIA) {
    await registrarLog(perfilId, 'XP_LIMIT_REACHED', { evento, xpTentativa: xpFinal }, requestId);
    return;
  }

  // Garante que o ganho não ultrapasse o limite diário restante
  const restoParaLimite = LIMITES_DIARIOS.MAX_XP_POR_DIA - xpHoje;
  xpFinal = Math.min(xpFinal, restoParaLimite);

  // Atualiza XP Total, XP por Categoria e Level
  const perfilAtualizado = await prisma.$transaction(async (tx) => {
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

    const novoLevel = calcularNivel(p.xp);

    let finalPerfil = p;
    if (novoLevel > p.level) {
      finalPerfil = await tx.perfis.update({
        where: { perfil_id: perfilId },
        data: { level: novoLevel },
        include: { titulos: { include: { titulo: true } } }
      }) as any;
    }

    return { ...finalPerfil, xpSocialAntigo: pAntigo?.xp_social || 0 };
  });

  //Registro e Verificação de Títulos (Otimizado)
  await registrarLog(perfilId, evento, { xpGanho: xpFinal, categoria }, requestId);
  console.log(`[GAMIFICACAO] Perfil ${perfilId} recebeu ${xpFinal} XP na categoria ${categoria} via evento ${evento}`);
  
  const cruzouFaixaSocial = Math.floor(perfilAtualizado.xpSocialAntigo / 100) < Math.floor(perfilAtualizado.xp_social / 100);
  
  const deveVerificarTitulos = 
    categoria === 'xp_escrita' || 
    (categoria === 'xp_social' && cruzouFaixaSocial);

  if (deveVerificarTitulos) {
    try {
      await atribuirTitulosPorMerito(perfilId, requestId);
    } catch (error) {
      console.error(`[GAMIFICACAO] Falha ao atribuir títulos para perfil ${perfilId}:`, error);
    }
  }

  return perfilAtualizado;
}

function getPatentePorNivel(level: number): string {
  let patente: string = PATENTES[0].nome;
  for (const p of PATENTES) {
    if (level >= p.nivel) {
      patente = p.nome;
    } else {
      break;
    }
  }
  return patente;
}

/*
 GERENCIADOR DE TÍTULOS 
 Busca o XP das categorias do perfil e compara com TITULOS_ESPECIALIDADE.
 */
async function atribuirTitulosPorMerito(perfilId: number, requestId?: string) {
  // Busca XP atual por categorias
  const perfil = await prisma.perfis.findUnique({
    where: { perfil_id: perfilId },
    select: { xp_escrita: true, xp_curadoria: true, xp_social: true }
  });

  if (!perfil) return;

  // Busca títulos que o usuário já possui
  const titulosGanhos = await prisma.perfisTitulos.findMany({ 
    where: { perfil_id: perfilId },
    select: { titulo: { select: { nome: true } } }
  });
  
  //Garantir que titulosGanhos e seus itens existam antes de mapear
  const nomesTitulosGanhos = (titulosGanhos || [])
    .filter(tg => tg && tg.titulo && tg.titulo.nome)
    .map(tg => tg.titulo.nome);

  //Itera sobre a configuração de títulos de especialidade
  for (const tConfig of TITULOS_ESPECIALIDADE) {
    if (nomesTitulosGanhos.includes(tConfig.nome)) continue;

    //Mapear a categoria da config para o campo do banco
    const campoXp = tConfig.categoria === 'ESCRITA' ? 'xp_escrita' : 
                    tConfig.categoria === 'CURADORIA' ? 'xp_curadoria' : 'xp_social';

    const xpNaCategoria = perfil[campoXp as keyof typeof perfil] || 0;

    if (xpNaCategoria >= tConfig.exigenciaXp) {
      //TRANSACAO: Garante integridade ao atribuir título
      try {
        await prisma.$transaction(async (tx) => {
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

        await registrarLog(perfilId, 'TITULO_ESPECIALIDADE_GANHO', { 
          titulo: tConfig.nome, 
          categoria: tConfig.categoria 
        }, requestId);
        
        console.log(`[MERITO] Perfil ${perfilId} conquistou o título: ${tConfig.nome}`);
      } catch (txError) {
        // Se falhar um título específico, logamos e continuamos para o próximo (ou ignoramos o erro)
        console.error(`[MERITO] Erro ao atribuir título ${tConfig.nome} para perfil ${perfilId}:`, txError);
      }
    }
  }
}

/*
 Verifica se o usuário possui impedimentos para deletar a conta.
 */
async function checkPendenciasExclusao(perfilId: number) {
    const usuario = await prisma.usuarios.findUnique({
        where: { perfil_id: perfilId },
        select: { is_admin: true, usuario_id: true }
    });

    if (!usuario) throw AppError.notFound('Usuário não encontrado.');

    //Verifica se é Dono de comunidades com outros membros
    const comunidadesComoDono = await prisma.comunidades.findMany({
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

export default { atualizarPerfil, buscarPerfilCompleto, seguirPerfil, deixarDeSeguirPerfil, processarGanhoXP, atribuirTitulosPorMerito, checkPendenciasExclusao };
