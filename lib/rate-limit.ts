import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// For development, use a simple in-memory rate limiter
// For production, configure Upstash Redis
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// In-memory rate limiter for development
class MemoryRateLimiter {
  private requests: Map<string, number[]> = new Map()

  async limit(identifier: string, limit: number, window: number): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: number
  }> {
    const now = Date.now()
    const key = identifier
    const requests = this.requests.get(key) || []

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < window)

    if (validRequests.length >= limit) {
      const oldestRequest = validRequests[0]
      const reset = oldestRequest + window
      return {
        success: false,
        limit,
        remaining: 0,
        reset,
      }
    }

    validRequests.push(now)
    this.requests.set(key, validRequests)

    return {
      success: true,
      limit,
      remaining: limit - validRequests.length,
      reset: now + window,
    }
  }
}

const memoryLimiter = new MemoryRateLimiter()

// Create rate limiters
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
      analytics: true,
    })
  : null

export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
      analytics: true,
    })
  : null

/**
 * Rate limit middleware
 */
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 10000 // 10 seconds
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (apiRateLimiter) {
    const result = await apiRateLimiter.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  }

  // Fallback to memory limiter
  return await memoryLimiter.limit(identifier, limit, window)
}

/**
 * Auth rate limit (stricter)
 */
export async function authRateLimit(
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (authRateLimiter) {
    const result = await authRateLimiter.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  }

  // Fallback to memory limiter with stricter limits
  return await memoryLimiter.limit(identifier, 5, 60000) // 5 requests per minute
}

