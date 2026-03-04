"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleInteresseSchema = exports.CategoriaUpdateSchema = exports.CategoriaCreateSchema = void 0;
const zod_1 = require("zod");
// backend/src/shared/types/categoria.types.ts
/**
 * 🛡️ SCHEMA DE CRIAÇÃO DE CATEGORIA
 * O .strict() impede que o usuário tente injetar IDs manuais.
 */
exports.CategoriaCreateSchema = zod_1.z.object({
    nome: zod_1.z.string()
        .min(2, "O nome da categoria deve ter pelo menos 2 caracteres")
        .max(50, "O nome da categoria é muito longo")
        .trim()
}).strict();
/**
 * 🛡️ SCHEMA DE ATUALIZAÇÃO DE CATEGORIA
 * No update, o campo nome também é obrigatório se a rota for chamada.
 */
exports.CategoriaUpdateSchema = exports.CategoriaCreateSchema;
// ====== Fusão de Interesses (Taxonomia) ======
exports.ToggleInteresseSchema = zod_1.z.object({
    categoria_id: zod_1.z.number().positive("ID da categoria inválido")
}).strict();
