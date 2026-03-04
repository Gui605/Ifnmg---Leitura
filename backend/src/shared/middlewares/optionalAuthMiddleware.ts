import { Request, Response, NextFunction } from 'express';
import { tratarAssincrono } from '../utils/asyncHandler';
import { verificarToken } from '../utils/jwtUtils';
import prisma from '../prisma/prisma.client';

/**
 * 💡 PADRÃO ENTERPRISE: Autenticação Opcional
 * Permite que rotas públicas identifiquem o usuário se o token existir, 
 * mas não bloqueia a requisição caso o token seja inválido ou ausente.
 */
const middlewareAutenticacaoOpcional = tratarAssincrono(async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // 🛡️ Se não houver token, define como undefined e segue (acesso público)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.usuario_id = undefined;
        req.perfil_id = undefined;
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verificarToken(token);
        const usuario = await prisma.usuarios.findUnique({
            where: { usuario_id: decoded.usuario_id },
            select: { token_version: true }
        });
        if (!usuario || typeof decoded.token_version !== 'number' || usuario.token_version !== decoded.token_version) {
            req.usuario_id = undefined;
            req.perfil_id = undefined;
            req.is_admin = undefined;
        } else {
            req.usuario_id = decoded.usuario_id;
            req.perfil_id = decoded.perfil_id;
            req.is_admin = decoded.is_admin;
        }
    } catch (error) {
        // 🛡️ Em caso de erro (token expirado/inválido), apenas limpa os dados.
        // Diferente do authMiddleware, aqui não lançamos AppError.
        req.usuario_id = undefined;
        req.perfil_id = undefined;
        req.is_admin = undefined;
    }
    
    next();
});

export { middlewareAutenticacaoOpcional };
