"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const denuncias_controller_1 = __importDefault(require("./denuncias.controller"));
const authMiddleware_1 = require("../../shared/middlewares/authMiddleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const denuncia_types_1 = require("../../shared/types/denuncia.types");
const zod_1 = require("zod");
const rateLimiter_1 = require("../../shared/middlewares/rateLimiter");
const router = (0, express_1.Router)();
const ParamsSchema = zod_1.z.object({ postId: zod_1.z.coerce.number().positive() }).strict();
router.post('/:postId', authMiddleware_1.middlewareAutenticacao, rateLimiter_1.limitadorEngajamento, (0, validate_middleware_1.validateParams)(ParamsSchema), (0, validate_middleware_1.validate)(denuncia_types_1.DenunciaCreateSchema), denuncias_controller_1.default.criar);
exports.default = router;
