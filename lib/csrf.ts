import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { randomBytes, createHash } from "crypto"

const CSRF_TOKEN_NAME = "csrf-token"
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || "csrf-secret-key"

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  const token = randomBytes(32).toString("hex")
  return token
}

/**
 * Create a CSRF token hash
 */
export function createCSRFTokenHash(token: string): string {
  return createHash("sha256")
    .update(token + CSRF_SECRET)
    .digest("hex")
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, hash: string): boolean {
  const expectedHash = createCSRFTokenHash(token)
  return hash === expectedHash
}

/**
 * Get CSRF token from cookies
 */
export async function getCSRFToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get(CSRF_TOKEN_NAME)?.value || null
  } catch (error) {
    // If cookies() fails, return null
    return null
  }
}

/**
 * Set CSRF token in cookies
 */
export async function setCSRFToken(token: string): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set(CSRF_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    })
  } catch (error) {
    console.error("Failed to set CSRF token:", error)
  }
}

/**
 * CSRF Protection Middleware
 */
export async function validateCSRF(
  request: NextRequest
): Promise<{ valid: boolean; error?: string }> {
  // Skip CSRF for GET, HEAD, OPTIONS
  const method = request.method
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return { valid: true }
  }

  // Extra hardening: verify Origin/Referer for state-changing requests in production.
  // This doesn't replace token validation, but reduces risk from cross-site requests.
  if (process.env.NODE_ENV === "production") {
    const deploymentOrigin = new URL(request.url).origin
    const allowedOrigins = (
      process.env.ALLOWED_ORIGINS ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000"
    )
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const originHeader = request.headers.get("origin")
    const refererHeader = request.headers.get("referer")

    const normalizeOrigin = (value: string) => {
      try {
        return new URL(value).origin
      } catch {
        return null
      }
    }

    const requestOrigin =
      (originHeader && normalizeOrigin(originHeader)) ||
      (refererHeader && normalizeOrigin(refererHeader))

    // Always allow same-origin requests for the current deployment, even if env vars are misconfigured.
    if (!requestOrigin || (requestOrigin !== deploymentOrigin && !allowedOrigins.includes(requestOrigin))) {
      return { valid: false, error: "Invalid request origin" }
    }
  }

  // Get token from header
  const tokenFromHeader = request.headers.get("X-CSRF-Token")
  
  // Get token from form data (for multipart/form-data)
  let tokenFromBody: string | null = null
  try {
    const contentType = request.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      const body = await request.clone().json()
      tokenFromBody = body._csrf || null
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.clone().formData()
      tokenFromBody = formData.get("_csrf") as string | null
    }
  } catch (error) {
    // Ignore parsing errors
  }

  const providedToken = tokenFromHeader || tokenFromBody

  if (!providedToken) {
    return {
      valid: false,
      error: "CSRF token missing",
    }
  }

  // Get stored token from cookies
  let storedToken: string | null = null
  try {
    const cookieStore = await cookies()
    storedToken = cookieStore.get(CSRF_TOKEN_NAME)?.value || null
  } catch (error) {
    console.error("Failed to get CSRF token from cookies:", error)
  }

  if (!storedToken) {
    return {
      valid: false,
      error: "CSRF token not found in session",
    }
  }

  // Verify token
  if (providedToken !== storedToken) {
    // Log CSRF violation
    try {
      const { logCSRFViolation } = await import("@/lib/security-logger")
      const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") ||
        "unknown"
      const userAgent = request.headers.get("user-agent") || "unknown"
      await logCSRFViolation(
        ipAddress,
        userAgent,
        new URL(request.url).pathname
      )
    } catch (error) {
      console.error("Failed to log CSRF violation:", error)
    }

    return {
      valid: false,
      error: "CSRF token mismatch",
    }
  }

  return { valid: true }
}

/**
 * Create CSRF protected response
 */
export async function createCSRFResponse(): Promise<NextResponse> {
  const token = generateCSRFToken()
  await setCSRFToken(token)

  return NextResponse.json({
    csrfToken: token,
  })
}
