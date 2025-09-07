import { PrismaClient } from '../generated/prisma'

const globalForPrisma = global as unknown as { 
    prisma: PrismaClient
}

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * we define a global prisma client to avoid re-creating a new prisma client everytime a hot-reload happens
 */