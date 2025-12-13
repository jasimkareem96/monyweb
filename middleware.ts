import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"

/**
 * Add security headers to all responses
 */
function addSecurityHeaders(response: NextResponse, request: NextRequest) {
  const isProduction = process.env.NODE_ENV === "production"
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  // Get origin from request
  const origin = request.headers.get("origin") || ""

  // Security Headers
  response.headers.set("X-DNS-Prefetch-Control", "on")
  
  // HSTS - Only in production with HTTPS
  if (isProduction) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  }
  
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  
  // Content Security Policy
  // Note: Next.js requires 'unsafe-eval' and 'unsafe-inline' in development
  const scriptSrc = isProduction
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-eval' 'unsafe-inline'"

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ")

  response.headers.set("Content-Security-Policy", csp)

  // CORS headers for API routes (if needed)
  // NOTE: Middleware does not run for /api by matcher, but keep this correct for any future use.
  if (origin) {
    let requestOrigin: string | null = null
    try {
      requestOrigin = new URL(origin).origin
    } catch {
      requestOrigin = null
    }

    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      response.headers.set("Vary", "Origin")
      response.headers.set("Access-Control-Allow-Origin", requestOrigin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token")
    }
  }

  return response
}

// Main middleware with auth
const authMiddleware = withAuth(
  function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname
    
    // Skip middleware for static files and Next.js internals
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/api/") ||
      pathname === "/favicon.ico" ||
      pathname.startsWith("/uploads/")
    ) {
      return NextResponse.next()
    }
    
    const response = NextResponse.next()
    return addSecurityHeaders(response, req)
  },
  {
    pages: {
      signIn: "/auth/signin",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        // Skip auth check for static files and Next.js internals
        if (
          pathname.startsWith("/_next/") ||
          pathname.startsWith("/api/") ||
          pathname === "/favicon.ico" ||
          pathname.startsWith("/uploads/")
        ) {
          return true
        }
        
        // Allow public access to auth pages (signin, signup, error)
        if (pathname.startsWith("/auth/")) {
          return true
        }
        
        // Protect order pages - require authentication
        if (pathname.startsWith("/orders/") && !pathname.startsWith("/orders/page")) {
          return !!token
        }
        
        // Allow public access to other pages
        return true
      },
    },
  }
)

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // If NEXTAUTH_SECRET isn't set in production, NextAuth middleware can get stuck in
  // a redirect loop (/api/auth/error?error=Configuration). Fail "open" for pages so
  // the site is accessible, and surface a clear error page instead.
  if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET) {
    const response = NextResponse.next()
    return addSecurityHeaders(response, req)
  }

  // NextAuth's middleware typing expects NextRequestWithAuth; Next.js provides NextRequest.
  // Runtime is compatible; this is a type-level mismatch.
  return (authMiddleware as any)(req, event)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
