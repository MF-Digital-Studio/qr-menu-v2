import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { normalizeDatabaseUrl } from '@/lib/database-url'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

function createPrismaClient() {
    const rawConnectionString = process.env.DATABASE_URL
    if (!rawConnectionString) {
        throw new Error('DATABASE_URL is not set. Add it to .env.local')
    }

    const connectionString = normalizeDatabaseUrl(rawConnectionString)

    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma