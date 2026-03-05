"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const sanitize_1 = require("../utils/sanitize");
const validate = (schema) => {
    return async (req, _res, next) => {
        try {
            // 1. Extraímos o ID como string (com fallback para undefined se não existir)
            const requestId = req.headers['x-request-id'];
            // 2. Sanitização (Passando a string do requestId corretamente)
            if (req.body)
                req.body = (0, sanitize_1.limpezaDeEntrada)(req.body, requestId);
            if (req.query)
                req.query = (0, sanitize_1.limpezaDeEntrada)(req.query, requestId);
            if (req.params)
                req.params = (0, sanitize_1.limpezaDeEntrada)(req.params, requestId);
            // 3. Validação com Zod
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            if (schema.query) {
                // Cast para 'any' necessário devido à incompatibilidade de tipos do Express vs Zod
                req.query = await schema.query.parseAsync(req.query);
            }
            if (schema.params) {
                req.params = await schema.params.parseAsync(req.params);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validate = validate;
