import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { markNotificationAsRead } from "@/lib/notifications"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 14 App Router
    const { id } = await params

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    await markNotificationAsRead(id, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark notification as read error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الإشعار" },
      { status: 500 }
    )
  }
}

