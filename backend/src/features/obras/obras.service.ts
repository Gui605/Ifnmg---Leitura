// backend/src/features/obras/obras.service.ts
import prisma from '../../shared/prisma/prisma.client';
import { AppError } from '../../shared/utils/AppError';
import { registrar as registrarLog } from '../../shared/utils/logService';
import { ObraCreateBody, ObraUpdateBody } from '../../shared/types/obra.types';
import perfilService from '../perfil/perfil.service';


async function criarObra(perfilId: number, data: ObraCreateBody, requestId?: string) {
    const obra = await prisma.$transaction(async (tx) => {
        return await tx.obras.create({
            data: {
                titulo: data.titulo,
                descricao: data.descricao,
                imagem_capa: data.imagem_capa,
                idioma: data.idioma,
                status: data.status,
                autor_id: perfilId,
                categorias: {
                    create: data.categorias.map(catId => ({
                        categoria_id: catId
                    }))
                }
            },
            include: {
                categorias: {
                    include: {
                        categoria: true
                    }
                }
            }
        });
    });

    await registrarLog(perfilId, 'OBRA_CREATED', { obra_id: obra.obra_id }, requestId);
    return obra;
}

async function listarObras(perfilId?: number) {
    const where = perfilId ? { autor_id: perfilId } : {};
    return await prisma.obras.findMany({
        where,
        orderBy: { data_criacao: 'desc' },
        include: {
            autor: {
                select: { nome_user: true }
            },
            categorias: {
                include: {
                    categoria: true
                }
            },
            _count: {
                select: { capitulos: true }
            }
        }
    });
}

async function buscarObraPorId(obraId: number) {
    const obra = await prisma.obras.findUnique({
        where: { obra_id: obraId },
        include: {
            autor: {
                select: { nome_user: true, perfil_id: true }
            },
            categorias: {
                include: {
                    categoria: true
                }
            },
            capitulos: {
                orderBy: { ordem: 'asc' },
                include: {
                    autor: {
                        select: { nome_user: true }
                    }
                }
            }
        }
    });

    if (!obra) throw AppError.notFound('Obra não encontrada.');

    // Cálculo do total de visualizações (soma de todos os capítulos)
    const totalVisualizacoes = obra.capitulos.reduce((acc, cap) => acc + (cap.visualizacoes || 0), 0);

    // Normalização dos capítulos com snapshot de autoria, se o autor for desativado, mostra "Usuário Desativado" ou algo similar
    const capitulosNormalizados = obra.capitulos.map(c => ({
        ...c,
        autor_nome_user: c.autor_nome_user ?? c.autor?.nome_user ?? "Usuário Desativado"
    }));

    return {
        ...obra,
        total_visualizacoes: totalVisualizacoes,
        capitulos: capitulosNormalizados
    };
}

async function atualizarObra(obraId: number, perfilId: number, data: ObraUpdateBody, requestId?: string) {
    const obra = await prisma.obras.findUnique({ where: { obra_id: obraId }, select: { autor_id: true } });
    if (!obra) throw AppError.notFound('Obra não encontrada.');
    if (obra.autor_id !== perfilId) throw AppError.forbidden('Você não tem permissão para editar esta obra.');

    const atualizada = await prisma.$transaction(async (tx) => {
        // Se categorias foram enviadas, atualizamos a relação pivot
        if (data.categorias) {
            await tx.obrasCategorias.deleteMany({ where: { obra_id: obraId } });
            
            // Usamos loop pois createMany não retorna as relações no include 
            for (const catId of data.categorias) {
                await tx.obrasCategorias.create({
                    data: {
                        obra_id: obraId,
                        categoria_id: catId
                    }
                });
            }
        }

        return await tx.obras.update({
            where: { obra_id: obraId },
            data: {
                titulo: data.titulo,
                descricao: data.descricao,
                imagem_capa: data.imagem_capa,
                status: data.status
            },
            include: {
                categorias: {
                    include: {
                        categoria: true
                    }
                }
            }
        });
    });

    await registrarLog(perfilId, 'OBRA_UPDATED', { obra_id: obraId }, requestId);
    return atualizada;
}

async function deletarObra(obraId: number, perfilId: number, requestId?: string) {
    const obra = await prisma.obras.findUnique({ where: { obra_id: obraId }, select: { autor_id: true } });
    if (!obra) throw AppError.notFound('Obra não encontrada.');
    if (obra.autor_id !== perfilId) throw AppError.forbidden('Você não tem permissão para excluir esta obra.');

    // O Cascade delete definido no schema.prisma cuidará dos capítulos (Posts)
    await prisma.obras.delete({ where: { obra_id: obraId } });

    await registrarLog(perfilId, 'OBRA_DELETED', { obra_id: obraId }, requestId);
}

export default {
    criarObra,
    listarObras,
    buscarObraPorId,
    atualizarObra,
    deletarObra
};
