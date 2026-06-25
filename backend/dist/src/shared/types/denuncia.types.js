"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DenunciaResponseSchema = exports.DenunciaCreateSchema = void 0;
//backend/src/shared/types/denuncia.types.ts
const zod_1 = require("zod");
exports.DenunciaCreateSchema = zod_1.z.object({
    denuncia_tipo: zod_1.z.number().int().positive(),
    descricao: zod_1.z.string().max(500).optional()
    // ficará desabilitado por enquando, implamartar, refatorar
    //conteudo_snapshot: z.string().min(1, "O snapshot do conteúdo é obrigatório")
}).strict();
/*
Schema de Resposta
  */
exports.DenunciaResponseSchema = zod_1.z.object({
    denuncia_id: zod_1.z.number(),
    post_id: zod_1.z.number().nullable(),
    perfil_id: zod_1.z.number().nullable(),
    denuncia_tipo: zod_1.z.number(),
    descricao: zod_1.z.string().nullable(),
    conteudo_snapshot: zod_1.z.string(),
    data_criacao: zod_1.z.date()
});
