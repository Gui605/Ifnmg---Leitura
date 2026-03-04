"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.middlewareAdministrador = void 0;
const AppError_1 = require("../utils/AppError");
const ErrorCodes_1 = require("../../errors/ErrorCodes");
const middlewareAdministrador = (req, res, next) => {
    if (!req.is_admin) {
        throw new AppError_1.AppError('Acesso negado. Você não possui permissões administrativas para esta operação.', 403, ErrorCodes_1.ErrorCodes.FORBIDDEN);
    }
    next();
};
exports.middlewareAdministrador = middlewareAdministrador;
