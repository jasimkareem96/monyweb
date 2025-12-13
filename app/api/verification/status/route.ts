import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const revalidate = 0

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    const verification = await prisma.verification.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json(verification || { status: null })
  } catch (error: any) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Verification status error:", error)
    }
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء جلب حالة التحقق" },
      { status: 500 }
    )
  }
}
