import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserNotifications, getUnreadNotificationCount } from "@/lib/notifications"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const revalidate = 0

export async function GET() {
  const build = {
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || null,
  }

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "غير مصرح", build }, { status: 401 })
    }

    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(session.user.id),
      getUnreadNotificationCount(session.user.id),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Get notifications error:", error)
    }

    const anyErr = error as any
    const message: string = String(anyErr?.message || "")
    const codeFromProps =
      anyErr?.code ||
      anyErr?.errorCode ||
      anyErr?.cause?.code ||
      anyErr?.cause?.errorCode ||
      null
    const codeFromMessage = message.match(/\bP\d{4}\b/)?.[0] || null
    const code = codeFromProps || codeFromMessage

    const dbMessageSignals = [
      "Can't reach database server",
      "Timed out fetching a new connection from the pool",
      "Connection terminated unexpectedly",
      "server closed the connection unexpectedly",
      "ECONNREFUSED",
      "ETIMEDOUT",
      "ENOTFOUND",
      "EAI_AGAIN",
      "password authentication failed",
      "no pg_hba.conf entry",
      "SSL",
    ]

    const dbCodes = new Set([
      "P1000", // Authentication failed
      "P1001", // Can't reach DB server
      "P1002", // Connection timed out
      "P1003", // Database does not exist
      "P1008", // Operations timed out
      "P1017", // Server closed the connection
      "P2024", // Timed out fetching a new connection from the pool
    ])

    const isDbDown =
      (code && dbCodes.has(code)) ||
      dbMessageSignals.some((s) => message.includes(s))

    return NextResponse.json(
      {
        error: isDbDown
          ? "تعذر الاتصال بقاعدة البيانات حالياً. يرجى المحاولة لاحقاً."
          : "حدث خطأ أثناء جلب الإشعارات",
        code,
        build,
      },
      { status: isDbDown ? 503 : 500 }
    )
  }
}

