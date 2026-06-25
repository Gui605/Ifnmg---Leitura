"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/shared/prisma/prisma.client.ts
const client_1 = require("@prisma/client");
const prisma = global.prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    transactionOptions: {
        maxWait: 5000, // Tempo máximo para esperar por uma transação 5s
        timeout: 10000 // Tempo máximo de execução de uma transação interativa 10s
    }
});
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
exports.default = prisma;
