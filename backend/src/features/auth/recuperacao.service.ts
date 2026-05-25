// backend/src/features/auth/recuperacao.service.ts
import prisma from '../../shared/prisma/prisma.client';
import crypto from 'crypto';
import { gerarHashSenha } from '../../shared/utils/hashing';
import { enviarEmailComToken } from '../../shared/utils/serviceEmail';
import { AppError } from '../../shared/utils/AppError'; 
import { ErrorCodes } from '../../errors/ErrorCodes';
 


async function solicitarRecuperacao(email: string, requestId?: string): Promise<void> {
    const usuario = await prisma.usuarios.findUnique({ where: { email } });

    // Retornamos sucesso silencioso mesmo se o e-mail não existir.
    // Isso evita que hackers descubram quais e-mails estão no banco de dados
    if (!usuario) {
        return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiracao = new Date(Date.now() + 3600000); // 1 hora de validade

    await prisma.usuarios.update({
        where: { email },
        data: {
            token_recuperacao: token,
            expiracao_token_recuperacao: expiracao
        }
    });

    // Envio assíncrono do e-mail
    await enviarEmailComToken(email, token, 'recuperacao');
}

async function redefinirSenha(token: string, novaSenha: string, requestId?: string): Promise<void> {
    const usuario = await prisma.usuarios.findFirst({
        where: { token_recuperacao: token }
    });

    // Erro 400: O token nem sequer existe no banco de dados.
    if (!usuario || !usuario.expiracao_token_recuperacao) {
        throw new AppError('Link de recuperação inválido ou já utilizado.', 400, ErrorCodes.TOKEN_INVALID);
    }

    // Erro 410: O link existia, mas o tempo de validade acabou.
    if (usuario.expiracao_token_recuperacao < new Date()) {
        throw new AppError('Este link de recuperação expirou. Solicite um novo link.', 410, ErrorCodes.TOKEN_EXPIRED);
    }

    const novoHash = await gerarHashSenha(novaSenha);

    await prisma.usuarios.update({
        where: { usuario_id: usuario.usuario_id },
        data: {
            password_hash: novoHash,
            token_recuperacao: null, 
            expiracao_token_recuperacao: null
        }
    });
    
}

export default { solicitarRecuperacao, redefinirSenha };
