import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

const handler = NextAuth(authOptions)

function guardProductionConfig(req: Request) {
  if (process.env.NODE_ENV !== "production") return null

  if (!process.env.NEXTAUTH_SECRET) {
    // Do not throw (would break build-time module evaluation on Vercel).
    return NextResponse.json(
      { error: "Server misconfigured: NEXTAUTH_SECRET is missing" },
      { status: 500 }
    )
  }

  const nextAuthUrl = process.env.NEXTAUTH_URL
  if (!nextAuthUrl) {
    return NextResponse.json(
      { error: "Server misconfigured: NEXTAUTH_URL is missing" },
      { status: 500 }
    )
  }

  // Validate NEXTAUTH_URL is a valid absolute URL (must include protocol)
  let configuredOrigin: string
  try {
    configuredOrigin = new URL(nextAuthUrl).origin
  } catch {
    return NextResponse.json(
      {
        error:
          "Server misconfigured: NEXTAUTH_URL is invalid. It must be a full URL like https://monyweb1.vercel.app",
      },
      { status: 500 }
    )
  }

  // Optional: help detect common misconfig (wrong domain)
  try {
    const reqOrigin = new URL(req.url).origin
    if (reqOrigin && configuredOrigin && reqOrigin !== configuredOrigin) {
      return NextResponse.json(
        {
          error:
            "Server misconfigured: NEXTAUTH_URL does not match the current deployment URL",
          details: { configuredOrigin, requestOrigin: reqOrigin },
        },
        { status: 500 }
      )
    }
  } catch {
    // ignore
  }

  return null
}

async function run(req: Request) {
  const guarded = guardProductionConfig(req)
  if (guarded) return guarded

  try {
    return await handler(req as any)
  } catch (error) {
    // Log server-side for Vercel function logs, but don't leak details to clients.
    console.error("[next-auth] handler error:", error)
    const err = error as any
    // Provide a minimal, non-sensitive hint to help debugging production misconfig.
    const message =
      typeof err?.message === "string" ? err.message.slice(0, 300) : undefined
    const name = typeof err?.name === "string" ? err.name : undefined
    const code = typeof err?.code === "string" ? err.code : undefined

    return NextResponse.json(
      {
        error: "Authentication configuration error",
        hint: "Check NEXTAUTH_SECRET, NEXTAUTH_URL, and database connectivity",
        ...(name ? { name } : {}),
        ...(code ? { code } : {}),
        ...(message ? { message } : {}),
      },
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
