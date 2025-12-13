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
  return null
}

// Export handlers for Next.js App Router (with runtime guard)
export async function GET(req: Request) {
  const guarded = guardProductionSecrets()
  if (guarded) return guarded
  return handler(req as any)
}

export async function POST(req: Request) {
  const guarded = guardProductionSecrets()
  if (guarded) return guarded
  return handler(req as any)
}
