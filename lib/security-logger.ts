import { prisma } from "@/lib/prisma"

export enum SecurityEventType {
  LOGIN_ATTEMPT = "LOGIN_ATTEMPT",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGOUT = "LOGOUT",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  EMAIL_CHANGE = "EMAIL_CHANGE",
  VERIFICATION_SUBMITTED = "VERIFICATION_SUBMITTED",
  VERIFICATION_APPROVED = "VERIFICATION_APPROVED",
  VERIFICATION_REJECTED = "VERIFICATION_REJECTED",
  FILE_UPLOAD = "FILE_UPLOAD",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  CSRF_VIOLATION = "CSRF_VIOLATION",
}

export interface SecurityLogData {
  userId?: string
  email?: string
  ipAddress?: string
  userAgent?: string
  eventType: SecurityEventType
  details?: Record<string, any>
  severity?: "low" | "medium" | "high" | "critical"
}

/**
 * Log security events
 * In production, this should be sent to a logging service
 */
export async function logSecurityEvent(data: SecurityLogData) {
  try {
    const {
      userId,
      email,
      ipAddress,
      userAgent,
      eventType,
      details,
      severity = "medium",
    } = data

    // Determine severity based on event type
    const eventSeverity =
      severity ||
      (eventType === SecurityEventType.SUSPICIOUS_ACTIVITY ||
      eventType === SecurityEventType.CSRF_VIOLATION ||
      eventType === SecurityEventType.RATE_LIMIT_EXCEEDED
        ? "high"
        : eventType === SecurityEventType.LOGIN_FAILED
        ? "medium"
        : "low")

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[SECURITY LOG]", {
        timestamp: new Date().toISOString(),
        eventType,
        severity: eventSeverity,
        userId,
        email,
        ipAddress,
        details,
      })
    }

    // In production, you should:
    // 1. Send to logging service (Sentry, LogRocket, etc.)
    // 2. Store in database (optional, for audit trail)
    // 3. Send alerts for critical events

    // Store critical events in database
    if (eventSeverity === "critical" || eventSeverity === "high") {
      try {
        // Create security log entry (you might want to add a SecurityLog table)
        // For now, we'll use console and can extend to database later
        console.error("[CRITICAL SECURITY EVENT]", {
          timestamp: new Date().toISOString(),
          eventType,
          severity: eventSeverity,
          userId,
          email,
          ipAddress,
          userAgent,
          details: JSON.stringify(details),
        })

        // TODO: Add SecurityLog table to Prisma schema if needed
        // await prisma.securityLog.create({...})
      } catch (error) {
        console.error("Failed to log security event to database:", error)
      }
    }

    // Send alert for critical events
    if (eventSeverity === "critical") {
      // TODO: Implement alert system (email, Slack, etc.)
      console.error("[SECURITY ALERT]", {
        eventType,
        userId,
        email,
        ipAddress,
        details,
      })
    }
  } catch (error) {
    // Don't throw errors in logging - it shouldn't break the application
    console.error("Error logging security event:", error)
  }
}

/**
 * Log failed login attempt
 */
export async function logFailedLogin(
  email: string,
  ipAddress: string,
  userAgent: string,
  reason?: string
) {
  try {
    await logSecurityEvent({
      email,
      ipAddress,
      userAgent,
      eventType: SecurityEventType.LOGIN_FAILED,
      details: { reason },
      severity: "medium",
    })
  } catch (error) {
    // Don't throw - logging shouldn't break the app
    console.error("Failed to log failed login:", error)
  }
}

/**
 * Log successful login
 */
export async function logSuccessfulLogin(
  userId: string,
  email: string,
  ipAddress: string,
  userAgent: string
) {
  try {
    await logSecurityEvent({
      userId,
      email,
      ipAddress,
      userAgent,
      eventType: SecurityEventType.LOGIN_SUCCESS,
      severity: "low",
    })
  } catch (error) {
    // Don't throw - logging shouldn't break the app
    console.error("Failed to log successful login:", error)
  }
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  userId: string | undefined,
  email: string | undefined,
  ipAddress: string,
  userAgent: string,
  activity: string,
  details?: Record<string, any>
) {
  await logSecurityEvent({
    userId,
    email,
    ipAddress,
    userAgent,
    eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
    details: { activity, ...details },
    severity: "high",
  })
}

/**
 * Log CSRF violation
 */
export async function logCSRFViolation(
  ipAddress: string,
  userAgent: string,
  endpoint: string,
  userId?: string
) {
  await logSecurityEvent({
    userId,
    ipAddress,
    userAgent,
    eventType: SecurityEventType.CSRF_VIOLATION,
    details: { endpoint },
    severity: "high",
  })
}

/**
 * Log rate limit exceeded
 */
export async function logRateLimitExceeded(
  ipAddress: string,
  userAgent: string,
  endpoint: string,
  userId?: string
) {
  await logSecurityEvent({
    userId,
    ipAddress,
    userAgent,
    eventType: SecurityEventType.RATE_LIMIT_EXCEEDED,
    details: { endpoint },
    severity: "medium",
  })
}
