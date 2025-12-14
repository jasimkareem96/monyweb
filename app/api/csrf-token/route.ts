import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createCSRFResponse } from "@/lib/csrf"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const revalidate = 0

/**
 * Get CSRF token endpoint
 * Only authenticated users can get CSRF tokens
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "غير مصرح",
          build: {
            commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
            deploymentId: process.env.VERCEL_DEPLOYMENT_ID || null,
          },
        },
        { status: 401 }
      )
    }

    const response = await createCSRFResponse()
    response.headers.set("x-build-commit", process.env.VERCEL_GIT_COMMIT_SHA || "local")
    response.headers.set("x-build-deployment", process.env.VERCEL_DEPLOYMENT_ID || "local")
    return response
  } catch (error: any) {
    if (process.env.NODE_ENV !== "production") {
      console.error("CSRF token error:", error)
    }
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء CSRF token" },
      { status: 500 }
    )
  }
}
