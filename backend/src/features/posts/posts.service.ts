//backend/src/features/posts/posts.service.ts
import prisma from '../../shared/prisma/prisma.client';
import { AppError } from '../../shared/utils/AppError';
import { registrar as registrarLog } from '../../shared/utils/logService';
import { PostsQuery } from '../../shared/types/post.types';
import { ErrorCodes } from '../../errors/ErrorCodes';
import perfilService from '../perfil/perfil.service';

type CriarPostData = { titulo: string; conteudo: string; tags: string[] };

async function criarPost(perfilId: number, data: CriarPostData, requestId?: string) {
  // 🛡️ Denormalização: Busca o nome do autor e o campus antes de criar o post
  const perfil = await prisma.perfis.findUnique({
    where: { perfil_id: perfilId },
    select: { 
      nome_user: true,
      usuario: {
        select: { nome_campus: true }
      }
    }
  });

  if (!perfil) throw AppError.notFound('Perfil do autor não encontrado.');

  const post = await prisma.$transaction(async (tx) => {
    // 1. Converter tags (nomes) em IDs de categorias (cria se não existir)
    const categoriasIds: number[] = [];
    for (const tagName of data.tags) {
      const categoria = await tx.categorias.upsert({
        where: { nome: tagName },
        update: {},
        create: { nome: tagName }
      });
      categoriasIds.push(categoria.categoria_id);
    }

    // 2. Criar o post com snapshot de autoria
    const novo = await tx.posts.create({
      data: {
        titulo: data.titulo,
        conteudo: data.conteudo,
        autor_id: perfilId,
        autor_nome_user: perfil.nome_user, // Snapshot
        nome_campus: perfil.usuario?.nome_campus // Snapshot
      }
    });

    // 3. Vincular categorias
    if (categoriasIds.length > 0) {
      const links = categoriasIds.map((cid) => ({ post_id: novo.post_id, categoria_id: cid }));
      await tx.postsCategorias.createMany({ data: links, skipDuplicates: true });
    }

    return novo;
  });

  await registrarLog(perfilId, 'POST_CREATED', { post_id: post.post_id }, requestId);
  await perfilService.processarGanhoXP(perfilId, 'POST_PUBLICADO', requestId);
  return post;
}

async function listar(q: { page?: number; limit?: number; categoriaId?: number; ordenarPor?: string }) {
  const page = q.page ?? 1;
  const limit = q.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (q.categoriaId) {
    where.categorias = { some: { categoria_id: q.categoriaId } };
  }

  const orderBy: any = q.ordenarPor === 'score' 
    ? { total_upvotes: 'desc' } 
    : { data_criacao: 'desc' };

  const [total, posts] = await Promise.all([
    prisma.posts.count({ where }),
    prisma.posts.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        autor: {
          select: { nome_user: true }
        },
        categorias: {
          include: {
            categoria: {
              select: { nome: true }
            }
          }
        }
      }
    })
  ]);

  const data = posts.map(p => ({
    ...p,
    autor_nome_user: p.autor_nome_user ?? p.autor?.nome_user ?? "Usuário Desativado",
    tags: p.categorias.map(c => c.categoria.nome)
  }));

  return {
    posts: data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function deletarPost(postId: number, perfilId: number, requestId?: string) {
  const post = await prisma.posts.findUnique({ where: { post_id: postId }, select: { autor_id: true } });
  if (!post) throw AppError.notFound('Publicação não encontrada.');
  if (!post.autor_id || post.autor_id !== perfilId) throw new AppError('Você não tem permissão para excluir esta publicação.', 403, ErrorCodes.FORBIDDEN);
  await prisma.posts.delete({ where: { post_id: postId } });
  await registrarLog(perfilId, 'POST_DELETED', { post_id: postId }, requestId);
}

async function votarPost(perfilId: number, postId: number, tipo: 'UP' | 'DOWN', requestId?: string) {
  const post = await prisma.posts.findUnique({ where: { post_id: postId }, select: { post_id: true } });
  if (!post) throw AppError.notFound('Publicação não encontrada.');
  await prisma.$transaction(async (tx) => {
    const existente = await tx.votos.findUnique({
      where: { perfil_id_post_id: { perfil_id: perfilId, post_id: postId } },
      select: { tipo: true }
    });
    if (existente && existente.tipo === tipo) {
      throw AppError.badRequest('Voto já registrado para este post.');
    }
    try {
      await tx.votos.upsert({
        where: { perfil_id_post_id: { perfil_id: perfilId, post_id: postId } },
        update: { tipo },
        create: { perfil_id: perfilId, post_id: postId, tipo }
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        await tx.votos.update({
          where: { perfil_id_post_id: { perfil_id: perfilId, post_id: postId } },
          data: { tipo }
        });
      } else {
        throw e;
      }
    }
    const counts = await tx.votos.groupBy({
      by: ['post_id', 'tipo'],
      where: { post_id: postId },
      _count: { _all: true }
    });
    const up = counts.find((c) => c.tipo === 'UP')?._count._all ?? 0;
    const down = counts.find((c) => c.tipo === 'DOWN')?._count._all ?? 0;
    await tx.posts.update({
      where: { post_id: postId },
      data: { total_upvotes: up, total_downvotes: down }
    });
  });
  await registrarLog(perfilId, 'POST_VOTED', { post_id: postId, tipo }, requestId);
  const postAtualizado = await prisma.posts.findUnique({
    where: { post_id: postId },
    include: { autor: { select: { nome_user: true } } }
  });
  if (!postAtualizado) throw AppError.notFound('Publicação não encontrada após atualização.');
  return postAtualizado;
}

async function comentarPost(perfilId: number, postId: number, texto: string, requestId?: string) {
  const post = await prisma.posts.findUnique({ where: { post_id: postId }, select: { post_id: true } });
  if (!post) throw AppError.notFound('Publicação não encontrada.');

  const novoComentario = await prisma.$transaction(async (tx) => {
    const comentario = await tx.comentarios.create({
      data: { perfil_id: perfilId, post_id: postId, texto },
    });
    const total = await tx.comentarios.count({ where: { post_id: postId } });
    await tx.posts.update({ where: { post_id: postId }, data: { total_comentarios: total } });
    return comentario;
  });

  await registrarLog(perfilId, 'COMMENT_CREATED', { post_id: postId, comentario_id: novoComentario.comentario_id }, requestId);
  await perfilService.processarGanhoXP(perfilId, 'COMENTARIO', requestId);

  const postAtualizado = await prisma.posts.findUnique({
    where: { post_id: postId },
    include: { autor: { select: { nome_user: true } } }
  });
  if (!postAtualizado) throw AppError.notFound('Publicação não encontrada após atualização.');
  return postAtualizado;
}

export default { criarPost, deletarPost, listar, votarPost, comentarPost };
