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

/**
 * 💡 PADRÃO ENTERPRISE EVOLUÍDO:
 * A lógica de "Gatekeeper" contra Mass Assignment foi movida para o Zod (.strict()).
 * O Controller foca exclusivamente na orquestração dos serviços.
 */

const getPerfilInfo = tratarAssincrono(async (req: Request, res: Response) => {
    const perfilId = req.perfil_id;

    if (!perfilId) {
        throw AppError.unauthorized('Sessão inválida. Por favor, faça login novamente.');
    }

    const perfil = await perfilService.buscarPerfilCompleto(perfilId, req.requestId);

    return res.status(200).json({
        status: 'success',
        message: 'Perfil recuperado com sucesso.',
        data: perfil,
        meta: null
    });
});

const updatePerfil = tratarAssincrono(async (req: Request<{}, {}, PerfilPatchBody>, res: Response) => {
    const perfilId = req.perfil_id;
    // 🛡️ O Zod já garantiu que o body contém APENAS 'nome' e que ele é válido.
    const { nome } = req.body;
    
    if (!perfilId) {
        throw AppError.unauthorized('Sessão expirada. Identificação do perfil não encontrada.');
    }

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
    const usuarioId = req.usuario_id;
    // 🛡️ Validações de força de senha e "novaSenha === confirmarNovaSenha" 
    // agora ocorrem automaticamente no Zod Schema (.refine()).
    const { senhaAntiga, novaSenha } = req.body; 
    
    if (!usuarioId) {
        throw AppError.unauthorized('Sessão inválida. Identificação do usuário não encontrada.');
    }

    const message = await segurancaService.alterarSenha(usuarioId, senhaAntiga, novaSenha, req.requestId);
    
    return res.status(200).json({ status: 'success', message, data: null, meta: null });
});

const deletarPerfil = tratarAssincrono(async (req: Request<{}, {}, DeletarContaBody>, res: Response) => {
    const usuarioId = req.usuario_id;
    const { senhaAtual } = req.body;
    
    if (!usuarioId) {
        throw AppError.unauthorized('Não autorizado. Sessão de usuário não identificada.');
    }

    const message = await segurancaService.deletarConta(usuarioId, senhaAtual, req.requestId);
    
    return res.status(200).json({ status: 'success', message, data: null, meta: null });
});

export default { getPerfilInfo, updatePerfil, alterarSenha, deletarPerfil };
