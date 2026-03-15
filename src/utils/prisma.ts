import { PrismaClient } from '@prisma/client';
import { configuration } from '../config/config.ts';

// Save instance Prisma as object global
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Export instance prisma
export const prisma = globalForPrisma.prisma || new PrismaClient();

// if environment is not production, save that instance to global
if (configuration.environment !== 'production') {
  globalForPrisma.prisma = prisma;
}