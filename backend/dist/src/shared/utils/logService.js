"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrar = registrar;
const prisma_client_1 = __importDefault(require("../prisma/prisma.client"));
const logger_1 = require("./logger");
function registrar(perfilId, evento, detalhes, requestId) {
    // Chamada assíncrona, desanexada do fluxo principal
    prisma_client_1.default.logAtividade.create({
        data: {
            perfil_id: perfilId,
            evento,
            detalhes: detalhes ?? null
        }
    })
        .catch((e) => {
        // Logamos o erro de infraestrutura. Não tentamos retry manual.
        logger_1.logger.error('LOG_SERVICE_PERSIST_FAIL', {
            evento,
            perfil_id: perfilId,
            error: e?.message,
            requestId
        });
    });
}
