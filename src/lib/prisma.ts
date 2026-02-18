import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/** Appends sslmode=require for Supabase/cloud Postgres to avoid "bad certificate format" TLS errors. Applied to both DATABASE_URL and DIRECT_URL. If the error persists, add sslmode=no-verify to both URLs in .env. */
function withSslMode(url: string): string {
  if (!url || url.includes('sslmode=')) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}sslmode=require`
}

const rawDbUrl = process.env.DATABASE_URL ?? ''
const rawDirectUrl = process.env.DIRECT_URL ?? ''
const databaseUrl = rawDbUrl ? withSslMode(rawDbUrl) : rawDbUrl
const directUrl = rawDirectUrl ? withSslMode(rawDirectUrl) : rawDirectUrl

// So Prisma engine uses SSL for both pooled and direct connections
if (databaseUrl && databaseUrl !== rawDbUrl) {
  process.env.DATABASE_URL = databaseUrl
}
if (directUrl && directUrl !== rawDirectUrl) {
  process.env.DIRECT_URL = directUrl
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    databaseUrl
      ? { datasources: { db: { url: databaseUrl } } }
      : undefined
  )

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
