import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserNotifications, getUnreadNotificationCount } from "@/lib/notifications"

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
    console.error("Get notifications error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الإشعارات" },
      { status: 500 }
    )
  }
}

