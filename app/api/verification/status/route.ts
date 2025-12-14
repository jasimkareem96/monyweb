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
    const message: string = String(error?.message || "")
    const codeFromProps =
      error?.code ||
      error?.errorCode ||
      error?.cause?.code ||
      error?.cause?.errorCode ||
      null
    const codeFromMessage = message.match(/\bP\d{4}\b/)?.[0] || null
    const code = codeFromProps || codeFromMessage

    const dbMessageSignals = [
      "Can't reach database server",
      "Authentication failed against database server",
      "the provided database credentials",
      "credentials for",
      "Timed out fetching a new connection from the pool",
      "Connection terminated unexpectedly",
      "server closed the connection unexpectedly",
      "ECONNREFUSED",
      "ETIMEDOUT",
      "ENOTFOUND",
      "EAI_AGAIN",
      "password authentication failed",
      "no pg_hba.conf entry",
      "SSL",
    ]

    const dbCodes = new Set([
      "P1000",
      "P1001",
      "P1002",
      "P1003",
      "P1008",
      "P1017",
      "P2024",
    ])

    const isDbDown =
      (code && dbCodes.has(code)) ||
      dbMessageSignals.some((s) => message.includes(s))
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
