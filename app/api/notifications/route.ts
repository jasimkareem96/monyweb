import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserNotifications, getUnreadNotificationCount } from "@/lib/notifications"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const revalidate = 0

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
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
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الإشعارات" },
      { status: 500 }
    )
  }
}

