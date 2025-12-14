import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function safeParseUrl(value: string | undefined): URL | null {
  if (!value) return null
  try {
    return new URL(value)
  } catch {
    return null
  }
}

function selectPrismaUrl(): { url?: string; mode: "database" | "direct" | "none" } {
  const databaseUrl = process.env.DATABASE_URL
  const directUrl = process.env.DIRECT_DATABASE_URL

  if (!databaseUrl && directUrl) return { url: directUrl, mode: "direct" }
  if (!databaseUrl && !directUrl) return { url: undefined, mode: "none" }

  // Allow forcing direct DB at runtime (useful if pooler is blocked/unreachable).
  if (process.env.USE_DIRECT_DATABASE_URL === "true" && directUrl) {
    return { url: directUrl, mode: "direct" }
  }

  // Heuristic: Supabase pooler host with port 5432 is commonly misconfigured.
  // Prefer DIRECT_DATABASE_URL if available.
  const parsed = safeParseUrl(databaseUrl)
  const looksLikeSupabasePooler = !!parsed?.hostname?.includes("pooler.supabase.com")
  const is5432 = parsed?.port === "5432"
  if (looksLikeSupabasePooler && is5432 && directUrl) {
    return { url: directUrl, mode: "direct" }
  }

  return { url: databaseUrl, mode: "database" }
}

function getClient(): PrismaClient {
  // Create lazily to avoid build-time crashes on Vercel when DATABASE_URL isn't set yet.
  // Next.js may import route modules during "collect page data".
  if (!globalForPrisma.prisma) {
    const { url, mode } = selectPrismaUrl()
    globalForPrisma.prisma =
      url
        ? new PrismaClient({ datasources: { db: { url } } })
        : new PrismaClient()

    if (process.env.NODE_ENV !== "production") {
      // Helpful debug in local/dev
      // eslint-disable-next-line no-console
      console.log(`[prisma] client initialized (${mode})`)
    }
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

// In development, PrismaClient is cached on globalForPrisma by getClient().

