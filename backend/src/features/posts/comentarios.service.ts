// backend/src/features/posts/comentarios.service.ts
import prisma from '../../shared/prisma/prisma.client';
import { AppError } from '../../shared/utils/AppError';
import { PostCommentBody } from '../../shared/types/post.types';

/**
 * 🛡️ SERVIÇO DE COMENTÁRIOS (IFNMG)
 * Centraliza a lógica de interação social com trava de profundidade.
 */
class ComentariosService {
    /**
     * 🛡️ CRIAR COMENTÁRIO
     * Implementa a trava "Anti-Inception" de 2 níveis e persistência de snapshot.
     */
    async criarComentario(perfilId: number, postId: number, data: PostCommentBody, requestId?: string) {
        // 1. Validar existência do post
        const postExistente = await prisma.posts.findUnique({
            where: { post_id: postId },
            select: { post_id: true }
        });
        if (!postExistente) throw AppError.notFound('Publicação não encontrada.');

        // 2. Trava de Profundidade (Máximo 2 níveis: Post -> Comentário -> Resposta)
        if (data.parent_id) {
            const pai = await prisma.comentarios.findUnique({
                where: { comentario_id: data.parent_id },
                select: { parent_id: true, post_id: true }
            });

            if (!pai) throw AppError.notFound('Comentário pai não encontrado.');
            if (pai.post_id !== postId) throw AppError.badRequest('O comentário pai não pertence a este post.');
            
            // Se o pai já tem um pai, então este novo seria o 3º nível (Proibido)
            if (pai.parent_id) {
                throw AppError.badRequest('Apenas dois níveis de profundidade permitidos (Resposta de resposta não autorizada).');
            }
        }

        // 3. Busca metadados do autor para Snapshot (Null-Safety futura)
        const autor = await prisma.perfis.findUnique({
            where: { perfil_id: perfilId },
            select: { 
                nome_user: true,
                usuario: { select: { nome_campus: true } }
            }
        });
        if (!autor) throw AppError.notFound('Perfil do autor não encontrado.');

        // 4. Persistência Atômica
        console.log(`[DEBUG] Criando comentário para post ${postId} por perfil ${perfilId}`, data);
        
        return await prisma.$transaction(async (tx) => {
            const novoComentario = await tx.comentarios.create({
                data: {
                    texto: data.texto,
                    post_id: postId,
                    perfil_id: perfilId,
                    parent_id: data.parent_id,
                    is_spoiler: data.is_spoiler || false,
                    // Snapshot de autoria se as colunas existirem no banco
                    // TODO: Se o schema.prisma for atualizado com autor_nome_user e nome_campus nos Comentarios, 
                    // descomentar as linhas abaixo para snapshot real.
                    // autor_nome_user: autor.nome_user,
                    // nome_campus: autor.usuario?.nome_campus || 'Campus desconhecido'
                },
                include: {
                    perfil: {
                        select: {
                            nome_user: true,
                            usuario: { select: { nome_campus: true } }
                        }
                    }
                }
            });

            console.log(`[DEBUG] Comentário ${novoComentario.comentario_id} criado com sucesso.`);

            // Incrementa contador no post
            await tx.posts.update({
                where: { post_id: postId },
                data: { total_comentarios: { increment: 1 } }
            });

            return this.formatarComentario(novoComentario);
        });
    }

    /**
     * 🛡️ LISTAR COMENTÁRIOS
     * Retorna a árvore de comentários (limitada a 2 níveis).
     */
    async listarPorPost(postId: number) {
        const comentarios = await prisma.comentarios.findMany({
            where: { post_id: postId, parent_id: null },
            include: {
                perfil: {
                    select: {
                        nome_user: true,
                        usuario: { select: { nome_campus: true } }
                    }
                },
                respostas: {
                    include: {
                        perfil: {
                            select: {
                                nome_user: true,
                                usuario: { select: { nome_campus: true } }
                            }
                        }
                    },
                    orderBy: { data_criacao: 'asc' }
                }
            },
            orderBy: { data_criacao: 'desc' }
        });

        return comentarios.map(c => ({
            ...this.formatarComentario(c),
            respostas: c.respostas.map(r => this.formatarComentario(r))
        }));
    }

    /**
     * 🛡️ DELETAR COMENTÁRIO
     * Apenas autor ou admin.
     */
    async deletarComentario(comentarioId: number, perfilId: number, isAdmin: boolean = false) {
        const comentario = await prisma.comentarios.findUnique({
            where: { comentario_id: comentarioId },
            select: { perfil_id: true, post_id: true }
        });

        if (!comentario) throw AppError.notFound('Comentário não encontrado.');

        if (!isAdmin && comentario.perfil_id !== perfilId) {
            throw AppError.forbidden('Você não tem permissão para deletar este comentário.');
        }

        await prisma.$transaction(async (tx) => {
            await tx.comentarios.delete({ where: { comentario_id: comentarioId } });
            
            // Decrementa contador no post
            await tx.posts.update({
                where: { post_id: comentario.post_id },
                data: { total_comentarios: { decrement: 1 } }
            });
        });

        return { message: 'Comentário removido com sucesso.' };
    }

    /**
     * 🛡️ FORMATADOR (Null-Safety)
     * Garante que se o perfil for null (deletado), usemos os dados de snapshot.
     */
    private formatarComentario(c: any) {
        return {
            comentario_id: c.comentario_id,
            texto: c.texto,
            data_criacao: c.data_criacao,
            parent_id: c.parent_id,
            autor_display: {
                nome: c.perfil?.nome_user ?? c.autor_nome_user ?? "Usuário Deletado",
                campus: c.perfil?.usuario?.nome_campus ?? c.nome_campus ?? "IFNMG",
                deletado: !c.perfil
            }
        };
    }
}

export default new ComentariosService();
