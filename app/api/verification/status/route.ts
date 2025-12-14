import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    if (!session?.user) {
      return NextResponse.json(
        { error: "غير مصرح", build },
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
    const code = error?.code || error?.cause?.code || null
    const isDbDown =
      code === "P1001" ||
      (typeof error?.message === "string" && error.message.includes("Can't reach database server"))
    return NextResponse.json(
      {
        error: isDbDown
          ? "تعذر الاتصال بقاعدة البيانات حالياً. يرجى المحاولة لاحقاً."
          : "حدث خطأ أثناء جلب حالة التحقق",
        code,
        build,
      },
      { status: isDbDown ? 503 : 500 }
    )
  }
}
