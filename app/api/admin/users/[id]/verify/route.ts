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

    await prisma.user.update({
      where: { id },
      data: { isVerified: true },
    })

    return NextResponse.json({
      success: true,
      message: "تم توثيق المستخدم بنجاح",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "حدث خطأ أثناء توثيق المستخدم" },
      { status: 500 }
    )
  }
}

