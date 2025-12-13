import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: any = {}
    if (status) {
      where.status = status
    }

    const verifications = await prisma.verification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      verifications,
    })
  } catch (error: any) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Get verifications error:", error)
    }
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء جلب طلبات التحقق" },
      { status: 500 }
    )
  }
}
