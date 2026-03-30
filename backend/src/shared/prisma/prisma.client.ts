// backend/src/shared/prisma/prisma.client.ts
import { PrismaClient } from '@prisma/client';

// Estende o objeto global do NodeJS para incluir o Prisma
// Isso elimina a necessidade de usar @ts-ignore
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  transactionOptions: {
    maxWait: 5000, // Tempo máximo para esperar por uma transação (5s)
    timeout: 10000 // Tempo máximo de execução de uma transação interativa (10s)
  }
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;