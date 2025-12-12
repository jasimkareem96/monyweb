import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 14 App Router
    const { id } = await params

    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const offer = await prisma.offer.findUnique({
      where: { id },
    })

    if (!offer) {
      return NextResponse.json({ error: "العرض غير موجود" }, { status: 404 })
    }

    await prisma.offer.update({
      where: { id },
      data: { isActive: !offer.isActive },
    })

    return NextResponse.json({
      success: true,
      message: offer.isActive ? "تم تعطيل العرض بنجاح" : "تم تفعيل العرض بنجاح",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث العرض" },
      { status: 500 }
    )
  }
}

