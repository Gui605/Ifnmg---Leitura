"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.middlewareRequestId = middlewareRequestId;
const crypto_1 = require("crypto");
function middlewareRequestId(req, _res, next) {
    req.requestId = (0, crypto_1.randomUUID)();
    next();
}
