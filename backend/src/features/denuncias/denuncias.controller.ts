import { Request, Response } from 'express';
import { tratarAssincrono } from '../../shared/utils/asyncHandler';
import denunciasService from './denuncias.service';
import { DenunciaCreateBody } from '../../shared/types/denuncia.types';
import { AppError } from '../../shared/utils/AppError';

type PostIdParams = { postId: string };

const criar = tratarAssincrono(async (req: Request<PostIdParams, any, DenunciaCreateBody>, res: Response) => {
  const perfilId = req.perfil_id;
  const postId = Number(req.params.postId);
  if (!perfilId) throw AppError.unauthorized('Acesso não autorizado.');
  if (isNaN(postId) || !Number.isSafeInteger(postId) || postId <= 0) {
    throw AppError.badRequest('ID inválido.');
  }
  const payload: any = 'motivo' in req.body ? { denuncia_tipo: 1, descricao: (req.body as any).motivo } : req.body;
  const created = await denunciasService.registrarDenuncia(perfilId, postId, payload, req.requestId);
  return res.status(201).json({ status: 'success', message: 'Denúncia registrado com sucesso.', data: created, meta: null });
});

export default { criar };
