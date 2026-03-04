"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DenunciaCreateSchema = void 0;
const zod_1 = require("zod");
const SchemaNumerico = zod_1.z.object({
    denuncia_tipo: zod_1.z.number().int().positive(),
    descricao: zod_1.z.string().max(500).optional()
}).strict();
const SchemaMotivo = zod_1.z.object({
    motivo: zod_1.z.string().min(3).max(500)
}).strict();
exports.DenunciaCreateSchema = zod_1.z.union([SchemaNumerico, SchemaMotivo]);
