import { Request, Response } from 'express';
import authService from './auth.service';
import recuperacaoService from './recuperacao.service';
import { LoginData, RedefinirSenhaBody, RegistrarData, SolicitarRecuperacaoBody } from '../../shared/types/auth.types'; 
import { tratarAssincrono } from '../../shared/utils/asyncHandler'; 
import { AppError } from '../../shared/utils/AppError';

type ConfirmarEmailQuery = { token?: unknown };

/**
 * 💡 PADRÃO ENTERPRISE EVOLUÍDO:
 * Com o uso de Zod + validateMiddleware, as validações de Regex e Presença
 * foram movidas para a camada de contrato (shared/types/auth.types.ts).
 */

const registrar = tratarAssincrono(async (req: Request<{}, {}, RegistrarData>, res: Response) => {
    const { email, senha, nome_completo, nome_campus, data_nascimento, nome_user } = req.body; 
    await authService.registrarUsuario({ email, senha, nome_completo, nome_campus, data_nascimento, nome_user }, req.requestId);
    return res.status(202).json({ 
        status: 'success',
        message: 'Recebemos sua solicitação. Se os dados informados forem válidos e a conta ainda não estiver ativa, um link de confirmação será enviado em instantes. Caso não receba, verifique sua caixa de spam ou tente realizar o processo novamente garantindo que o e-mail foi digitado corretamente.',
        data: null,
        meta: null
    });
});

const logar = tratarAssincrono(async (req: Request<{}, {}, LoginData>, res: Response) => {
    // 🛡️ Email já chega em lowercase e senha já é garantida como string.
    const { email, senha } = req.body;
    
    const token = await authService.logarUsuario(email, senha, req.requestId);

    return res.status(200).json({ 
        status: 'success',
        message: 'Login realizado com sucesso.', 
        data: { token },
        meta: null
    });
});

const confirmarEmail = tratarAssincrono(async (req: Request<{}, any, any, ConfirmarEmailQuery>, res: Response) => {
    const { token } = req.query;

    // Manter validação manual aqui apenas se não criar um schema para Query Params
    if (!token || typeof token !== 'string' || token.trim().length !== 64) {
        throw AppError.badRequest('Token de verificação inválido ou expirado.');
    }

    const message = await authService.verificarConta(token, req.requestId); 
    
    return res.status(200).json({ 
        status: 'success',
        message,
        data: null,
        meta: null
    });
});

const solicitarRecuperacao = tratarAssincrono(async (req: Request<{}, any, SolicitarRecuperacaoBody>, res: Response) => {
    const { email } = req.body;
    // O Zod no authRoutes cuidará de validar o email antes de chegar aqui.

    await recuperacaoService.solicitarRecuperacao(email, req.requestId);

    return res.status(200).json({
        status: 'success',
        message: 'Se este e-mail estiver cadastrado, um link de recuperação será enviado.',
        data: null,
        meta: null
    });
});

const redefinirSenha = tratarAssincrono(async (req: Request<{}, any, RedefinirSenhaBody>, res: Response) => {
    const { token, novaSenha } = req.body;
    // Validações de igualdade e força de senha agora ocorrem no Zod Schema.

    await recuperacaoService.redefinirSenha(token, novaSenha, req.requestId);

    return res.status(200).json({
        status: 'success',
        message: 'Senha alterada com sucesso! Você já pode fazer login.',
        data: null,
        meta: null
    });
});

const logoutAll = tratarAssincrono(async (req: Request, res: Response) => {
    const usuarioId = req.usuario_id!;
    const message = await authService.logoutAll(usuarioId, req.requestId);
    return res.status(200).json({
        status: 'success',
        message,
        data: null,
        meta: null
    });
});

export default { 
    registrar, 
    logar, 
    confirmarEmail, 
    solicitarRecuperacao, 
    redefinirSenha,
    logoutAll
};
