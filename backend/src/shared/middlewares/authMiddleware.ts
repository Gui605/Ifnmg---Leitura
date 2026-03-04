import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../utils/AppError'; 
import { ErrorCodes } from '../../errors/ErrorCodes';
import { verificarToken } from '../utils/jwtUtils';
import prisma from '../prisma/prisma.client';

export const middlewareAutenticacao = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(AppError.unauthorized('Acesso negado. Token não fornecido ou mal formatado.'));
    }

    const token = authHeader.split(' ')[1]; 

    try {
        const decoded = verificarToken(token);
        const usuario = await prisma.usuarios.findUnique({
            where: { usuario_id: decoded.usuario_id },
            select: { token_version: true }
        });
        if (!usuario || typeof decoded.token_version !== 'number' || usuario.token_version !== decoded.token_version) {
            return next(AppError.unauthorized('Sessão revogada.'));
        }
        req.usuario_id = decoded.usuario_id;
        req.perfil_id = decoded.perfil_id;
        req.is_admin = decoded.is_admin;
        return next();
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return next(new AppError('Sua sessão expirou. Por favor, faça login novamente.', 401, ErrorCodes.TOKEN_EXPIRED));
        }
        if (error instanceof JsonWebTokenError) {
            return next(new AppError('Token de autenticação inválido ou corrompido.', 401, ErrorCodes.TOKEN_INVALID));
        }
        return next(AppError.unauthorized('Falha na autenticação. Tente realizar o login novamente.'));
    }
};
