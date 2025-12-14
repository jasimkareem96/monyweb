import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

const handler = NextAuth(authOptions)

function guardProductionSecrets() {
  if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET) {
    // Do not throw (would break build-time module evaluation on Vercel).
    return NextResponse.json(
      { error: "Server misconfigured: NEXTAUTH_SECRET is missing" },
      { status: 500 }
    )
  }
  if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_URL) {
    return NextResponse.json(
      { error: "Server misconfigured: NEXTAUTH_URL is missing" },
      { status: 500 }
    )
  }
  return null
}

async function run(req: Request) {
  const guarded = guardProductionSecrets()
  if (guarded) return guarded

  try {
    return await handler(req as any)
  } catch (error) {
    // Log server-side for Vercel function logs, but don't leak details to clients.
    console.error("[next-auth] handler error:", error)
    return NextResponse.json(
      { error: "Authentication configuration error" },
      { status: 500 }
    )
  }
}

// Export handlers for Next.js App Router (with runtime guard)
export async function GET(req: Request) {
  return run(req)
}

export async function POST(req: Request) {
  return run(req)
}
