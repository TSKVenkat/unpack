import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Explicitly load environment variables from .env file
dotenv.config({ path: '.env' });

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Log the DATABASE_URL to verify it's loaded correctly (remove in production)
console.log('Database URL loaded:', process.env.DATABASE_URL ? 'Yes' : 'No');

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
