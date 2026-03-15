import { PrismaClient } from '@prisma/client';

// Save instance Prisma as object global
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Export instance prisma
export const prisma = globalForPrisma.prisma || new PrismaClient();

// if environment is not production, save that instance to global
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}