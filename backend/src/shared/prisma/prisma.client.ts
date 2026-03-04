// backend/src/shared/prisma/prisma.client.ts
import { PrismaClient } from '@prisma/client';

// Estende o objeto global do NodeJS para incluir o Prisma
// Isso elimina a necessidade de usar @ts-ignore
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;