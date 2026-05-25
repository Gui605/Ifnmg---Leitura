//backend/src/features/perfil/perfil.controller.ts
import { Request, Response } from 'express';
import { tratarAssincrono } from '../../shared/utils/asyncHandler'; 
import perfilService from './perfil.service'; 
import segurancaService from './seguranca.service'; 
import { AppError } from '../../shared/utils/AppError';
import { 
    PerfilPatchBody, 
    SenhaPatchBody, 
    DeletarContaBody 
} from '../../shared/types/perfil.types'; 



const getPerfilInfo = tratarAssincrono(async (req: Request, res: Response) => {
    const perfilId = req.user.perfil_id;

    const perfil = await perfilService.buscarPerfilCompleto(perfilId, perfilId, req.requestId);

    return res.status(200).json({
        status: 'success',
        message: 'Perfil recuperado com sucesso.',
        data: perfil,
        meta: null
    });
});

const getPerfilPublico = tratarAssincrono(async (req: Request<{ id: string }>, res: Response) => {
    const perfilId = Number(req.params.id);
    const visitanteId = req.user?.perfil_id;

    if (isNaN(perfilId) || perfilId <= 0) {
        throw AppError.badRequest('ID de perfil inválido.');
    }

    const perfil = await perfilService.buscarPerfilCompleto(perfilId, visitanteId, req.requestId);

    return res.status(200).json({
        status: 'success',
        message: 'Perfil público recuperado com sucesso.',
        data: perfil,
        meta: null
    });
});

const updatePerfil = tratarAssincrono(async (req: Request<{}, {}, PerfilPatchBody>, res: Response) => {
    const perfilId = req.user.perfil_id;
    // O Zod já garantiu que o body contém apenas 'nome' e que ele é válido.
    const { nome } = req.body;

    // O trim() também foi realizado automaticamente pelo Schema
    const perfilAtualizado = await perfilService.atualizarPerfil(perfilId, { nome }, req.requestId);

    return res.status(200).json({
        status: 'success',
        message: 'Perfil atualizado com sucesso.',
        data: perfilAtualizado,
        meta: null
    });
});

const alterarSenha = tratarAssincrono(async (req: Request<{}, any, SenhaPatchBody>, res: Response) => {
    const usuarioId = req.user.usuario_id;
    // Validações de força de senha e "novaSenha === confirmarNovaSenha" 
    // agora ocorrem automaticamente no Zod Schema (.refine()).
    const { senhaAntiga, novaSenha } = req.body; 
    
    const message = await segurancaService.alterarSenha(usuarioId, senhaAntiga, novaSenha, req.requestId);
    
    return res.status(200).json({ status: 'success', message, data: null, meta: null });
});

const deletarPerfil = tratarAssincrono(async (req: Request<{}, {}, DeletarContaBody>, res: Response) => {
    const usuarioId = req.user.usuario_id;
    const { senhaAtual } = req.body;
    
    const message = await segurancaService.deletarConta(usuarioId, senhaAtual, req.requestId);
    
    return res.status(200).json({ status: 'success', message, data: null, meta: null });
});

const toggleFollow = tratarAssincrono(async (req: Request<{ id: string }>, res: Response) => {
    const seguidorId = req.user.perfil_id;
    const seguidoId = Number(req.params.id);

    if (isNaN(seguidoId) || seguidoId <= 0) {
        throw AppError.badRequest('ID de perfil inválido.');
    }

    //  Tenta deletar primeiro, se falhar (não segue), tenta seguir.
    // Isso economiza uma query de 'find' e mantém a atomicidade.
    try {
        await perfilService.deixarDeSeguirPerfil(seguidorId, seguidoId, req.requestId);
        return res.status(200).json({
            status: 'success',
            message: 'Você deixou de seguir este perfil.',
            data: { seguindo: false },
            meta: null
        });
    } catch (error: any) {
        // Se o erro for que o registro não existe, então vamos seguir.
        if (error instanceof AppError && error.message === 'Você não segue este perfil.') {
            await perfilService.seguirPerfil(seguidorId, seguidoId, req.requestId);
            return res.status(201).json({
                status: 'success',
                message: 'Agora você segue este perfil.',
                data: { seguindo: true },
                meta: null
            });
        }
        throw error;
    }
});

const checkPendenciasExclusao = tratarAssincrono(async (req: Request, res: Response) => {
    const perfilId = req.user.perfil_id;
    const check = await perfilService.checkPendenciasExclusao(perfilId);

    return res.status(200).json({
        status: 'success',
        data: check
    });
});

export default { 
    getPerfilInfo, 
    getPerfilPublico, 
    updatePerfil, 
    alterarSenha, 
    deletarPerfil, 
    toggleFollow,
    checkPendenciasExclusao
};
