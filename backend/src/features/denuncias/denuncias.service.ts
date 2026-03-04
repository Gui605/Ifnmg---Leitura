import prisma from '../../shared/prisma/prisma.client';
import { AppError } from '../../shared/utils/AppError';
import { registrar as registrarLog } from '../../shared/utils/logService';

type DadosDenuncia = { denuncia_tipo: number; descricao?: string };

async function registrarDenuncia(perfilId: number, postId: number, data: DadosDenuncia, requestId?: string) {
  const result = await prisma.$transaction(async (tx) => {
    const dup = await tx.denuncias.findFirst({
      where: { perfil_id: perfilId, post_id: postId, status: 'PENDENTE' }
    });
    if (dup) {
      throw AppError.badRequest('Você já registrou uma denúncia para este post.');
    }
    const post = await tx.posts.findUnique({
      where: { post_id: postId },
      select: { post_id: true, titulo: true, conteudo: true, autor_id: true, total_upvotes: true, total_downvotes: true, total_comentarios: true }
    });
    if (!post) throw AppError.notFound('Publicação não encontrada.');
    const snapshot = JSON.stringify({
      post_id: post.post_id,
      titulo: post.titulo,
      conteudo: post.conteudo,
      autor_id: post.autor_id,
      total_upvotes: post.total_upvotes,
      total_downvotes: post.total_downvotes,
      total_comentarios: post.total_comentarios
    });
    const created = await tx.denuncias.create({
      data: {
        denuncia_tipo: data.denuncia_tipo,
        descricao: data.descricao ?? null,
        conteudo_snapshot: snapshot,
        post_id: postId,
        perfil_id: perfilId
      }
    });
    return created;
  });
  await registrarLog(perfilId, 'REPORT_CREATED', { denuncia_id: result.denuncia_id, post_id: postId }, requestId);
  return result;
}

export default { registrarDenuncia };
