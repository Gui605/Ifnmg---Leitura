import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ErrorCodes } from '../../errors/ErrorCodes';

export const middlewareAdministrador = (req: Request, res: Response, next: NextFunction) => {
    if (!req.is_admin) {
        throw new AppError(
            'Acesso negado. Você não possui permissões administrativas para esta operação.',
            403,
            ErrorCodes.FORBIDDEN
        );
    }

    next();
};
