import { NextResponse } from "next/server"
import { rateLimit, authRateLimit } from "@/lib/rate-limit"

/**
 * Rate limit middleware for API routes
 */
export async function withRateLimit(
  request: Request,
  handler: () => Promise<NextResponse>,
  options?: { limit?: number; window?: number; useAuthLimit?: boolean }
) {
  try {
    // Get identifier (IP address or user ID)
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"

    // Use auth rate limiter for auth routes
    const result = options?.useAuthLimit
      ? await authRateLimit(ip)
      : await rateLimit(ip, options?.limit, options?.window)

    if (!result.success) {
      console.log("Rate limit exceeded:", { ip, limit: result.limit, remaining: result.remaining })
      
      // Log rate limit exceeded
      try {
        const { logRateLimitExceeded } = await import("@/lib/security-logger")
        const userAgent = request.headers.get("user-agent") || "unknown"
        await logRateLimitExceeded(
          ip,
          userAgent,
          new URL(request.url).pathname
        )
      } catch (error) {
        console.error("Failed to log rate limit event:", error)
      }

      return NextResponse.json(
        {
          error: "تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً",
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": result.limit.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.reset.toString(),
          },
        }
      )
    }

    // Call the handler
    const response = await handler()

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", result.limit.toString())
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
    response.headers.set("X-RateLimit-Reset", result.reset.toString())

    return response
  } catch (error) {
    console.error("Rate limit error:", error)
    // If rate limiting fails, allow the request (fail open)
    return handler()
  }
}

