"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tratarAssincrono = void 0;
const tratarAssincrono = (fn) => (req, res, next) => {
    // Resolvemos a função e, se houver erro, mandamos direto para o next()
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.tratarAssincrono = tratarAssincrono;
