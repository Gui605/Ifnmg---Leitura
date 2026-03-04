"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validate = void 0;
const sanitize_1 = require("../utils/sanitize");
/**
 * 🛡️ MIDDLEWARE DE VALIDAÇÃO DE CONTRATO (ZOD)
 * Substitui o antigo securityContract manual.
 * * 1. Valida o formato e tipos dos dados.
 * 2. Remove campos extras (se usar .strip() - padrão).
 * 3. Bloqueia campos extras (se usar .strict() no schema).
 * 4. Sanitiza o input antes de chegar ao Controller.
 */
const validate = (schema) => {
    return async (req, _, next) => {
        try {
            req.body = (0, sanitize_1.limpezaDeEntrada)(req.body, req);
            req.params = (0, sanitize_1.limpezaDeEntrada)(req.params, req);
            req.query = (0, sanitize_1.limpezaDeEntrada)(req.query, req);
            if (req.method === 'GET') {
                req.query = await schema.parseAsync(req.query);
            }
            else {
                req.body = await schema.parseAsync(req.body);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validate = validate;
const validateParams = (schema) => {
    return async (req, _, next) => {
        try {
            req.params = (0, sanitize_1.limpezaDeEntrada)(req.params, req);
            req.params = await schema.parseAsync(req.params);
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateParams = validateParams;
