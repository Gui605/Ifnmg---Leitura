import prisma from '../../shared/prisma/prisma.client';
import { AppError } from '../../shared/utils/AppError';
import { registrar as registrarLog } from '../../shared/utils/logService';
import { PostsQuery } from '../../shared/types/post.types';
import { ErrorCodes } from '../../errors/ErrorCodes';

type CriarPostData = { titulo: string; conteudo: string; categoriasIds: number[] };
type ListarFiltro = PostsQuery & { ordenarPor?: 'score' | 'data'; categoria?: number };

async function criarPost(perfilId: number, data: CriarPostData, requestId?: string) {
  const post = await prisma.$transaction(async (tx) => {
    const novo = await tx.posts.create({
      data: {
        titulo: data.titulo,
        conteudo: data.conteudo,
        autor_id: perfilId
      }
    });
    if (data.categoriasIds?.length) {
      const links = data.categoriasIds.map((cid) => ({ post_id: novo.post_id, categoria_id: cid }));
      await tx.postsCategorias.createMany({ data: links, skipDuplicates: true });
    }
    return novo;
  });
  await registrarLog(perfilId, 'POST_CREATED', { post_id: post.post_id }, requestId);
  return post;
}

async function deletarPost(postId: number, perfilId: number, requestId?: string) {
  const post = await prisma.posts.findUnique({ where: { post_id: postId }, select: { autor_id: true } });
  if (!post) throw AppError.notFound('Publicação não encontrada.');
  if (!post.autor_id || post.autor_id !== perfilId) throw new AppError('Você não tem permissão para excluir esta publicação.', 403, ErrorCodes.FORBIDDEN);
  await prisma.posts.delete({ where: { post_id: postId } });
  await registrarLog(perfilId, 'POST_DELETED', { post_id: postId }, requestId);
}

async function listarPosts(q: PostsQuery, perfilId?: number, requestId?: string) {
  const page = q.page ?? 1;
  const limit = q.limit ?? 10;
  const skip = (page - 1) * limit;
  
  // Definição tipada do where (usando Prisma.PostsWhereInput se possível)
  const where: any = {}; 
  if (q.categoria) {
    where.categorias = { some: { categoria_id: q.categoria } };
  }

  const orderBy = q.ordenarPor === 'score'
    ? [{ total_upvotes: 'desc' as const }, { data_criacao: 'desc' as const }]
    : [{ data_criacao: 'desc' as const }];

  const [total, posts] = await Promise.all([
    prisma.posts.count({ where }),
    prisma.posts.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        autor: { select: { nome_user: true } }
      }
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  // Mantenha os contadores (stats) que o seu backend já calcula!
  // O Frontend precisa deles para exibir o contador na tela.
  const postsComDados = posts.map((p) => ({
    ...p, // Espalha os dados brutos (inclui stats)
    autor_nome_user: p.autor?.nome_user ?? 'Anônimo' // Fallback para não quebrar UI
  }));

  return { 
    data: postsComDados,
    meta: {
        total,
        page,
        limit,
        totalPages
    }
  };
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
  await prisma.$transaction(async (tx) => {
    await tx.comentarios.create({
      data: { perfil_id: perfilId, post_id: postId, texto }
    });
    const total = await tx.comentarios.count({ where: { post_id: postId } });
    await tx.posts.update({ where: { post_id: postId }, data: { total_comentarios: total } });
  });
  await registrarLog(perfilId, 'POST_COMMENTED', { post_id: postId }, requestId);
  const postAtualizado = await prisma.posts.findUnique({
    where: { post_id: postId },
    include: { autor: { select: { nome_user: true } } }
  });
  if (!postAtualizado) throw AppError.notFound('Publicação não encontrada após atualização.');
  return postAtualizado;
}

export default { criarPost, deletarPost, listarPosts, votarPost, comentarPost };
