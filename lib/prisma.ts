import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getClient(): PrismaClient {
  // Create lazily to avoid build-time crashes on Vercel when DATABASE_URL isn't set yet.
  // Next.js may import route modules during "collect page data".
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient()
  }
  return globalForPrisma.prisma
}

// Export a lazy proxy so imports don't instantiate PrismaClient at module load.
export const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      return (getClient() as any)[prop as any]
    },
  }
) as unknown as PrismaClient

// In development, keep the singleton on global to prevent hot-reload connection leaks.
if (process.env.NODE_ENV !== "production") {
  // Ensure initialization happens only when needed, but keep cache for subsequent uses.
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  globalForPrisma.prisma
}

