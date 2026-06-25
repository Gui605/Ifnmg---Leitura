// backend/src/features/obras/obras.controller.ts
import { Request, Response } from 'express';
import { tratarAssincrono } from '../../shared/utils/asyncHandler';
import obrasService from './obras.service';
import perfilService from '../perfil/perfil.service';
import { ObraCreateBody, ObraUpdateBody } from '../../shared/types/obra.types';
import { AppError } from '../../shared/utils/AppError';

//Tipagem de parâmetros da URL para evitar 'undefined'
type ObraIdParams = { id: string };

const criarObra = tratarAssincrono(async (req: Request<{}, any, ObraCreateBody>, res: Response) => {
    const perfilId = req.user.perfil_id;

    const novaObra = await obrasService.criarObra(perfilId, req.body, req.requestId);

    // Busca perfil atualizado após ganho de XP
    const perfilAtualizado = await perfilService.buscarPerfilCompleto(perfilId, perfilId, req.requestId);

    return res.status(201).json({
        status: 'success',
        message: 'Obra criada com sucesso.',
        data: novaObra,
        perfil_atualizado: perfilAtualizado,
        meta: null
    });
});

const listarObras = tratarAssincrono(async (req: Request, res: Response) => {
    // Se houver um autorId na query, usa ele (para perfis públicos), caso contrário, força o ID do usuário logado
    const autorId = req.query.autorId ? Number(req.query.autorId) : req.user?.perfil_id;
    const obras = await obrasService.listarObras(autorId);

    return res.status(200).json({
        status: 'success',
        message: 'Lista de obras recuperada.',
        data: obras,
        meta: null
    });
});

const buscarObraPorId = tratarAssincrono(async (req: Request<ObraIdParams>, res: Response) => {
    const obraId = Number(req.params.id);
    if (isNaN(obraId) || !Number.isSafeInteger(obraId) || obraId <= 0) {
        throw AppError.badRequest("ID da obra inválido.");
    }

    const obra = await obrasService.buscarObraPorId(obraId);

    return res.status(200).json({
        status: 'success',
        message: 'Obra encontrada.',
        data: obra,
        meta: null
    });
});

const atualizarObra = tratarAssincrono(async (req: Request<ObraIdParams, any, ObraUpdateBody>, res: Response) => {
    const obraId = Number(req.params.id);
    const perfilId = req.user.perfil_id;
    if (isNaN(obraId) || !Number.isSafeInteger(obraId) || obraId <= 0) {
        throw AppError.badRequest("ID da obra inválido.");
    }

    const atualizada = await obrasService.atualizarObra(obraId, perfilId, req.body, req.requestId);

    return res.status(200).json({
        status: 'success',
        message: 'Obra atualizada com sucesso.',
        data: atualizada,
        meta: null
    });
});

const deletarObra = tratarAssincrono(async (req: Request<ObraIdParams>, res: Response) => {
    const obraId = Number(req.params.id);
    const perfilId = req.user.perfil_id;
    if (isNaN(obraId) || !Number.isSafeInteger(obraId) || obraId <= 0) {
        throw AppError.badRequest("ID da obra inválido.");
    }

    await obrasService.deletarObra(obraId, perfilId, req.requestId);

    return res.status(200).json({
        status: 'success',
        message: 'Obra excluída com sucesso.',
        data: null,
        meta: null
    });
});

export default {
    criarObra,
    listarObras,
    buscarObraPorId,
    atualizarObra,
    deletarObra
};
