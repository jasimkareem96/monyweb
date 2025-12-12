import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { markAllNotificationsAsRead } from "@/lib/notifications"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    await markAllNotificationsAsRead(session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark all notifications as read error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الإشعارات" },
      { status: 500 }
    )
  }
}

