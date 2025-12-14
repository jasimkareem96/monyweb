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
    const code = anyErr?.code || anyErr?.cause?.code || null
    const isDbDown =
      code === "P1001" ||
      (typeof anyErr?.message === "string" && anyErr.message.includes("Can't reach database server"))

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

