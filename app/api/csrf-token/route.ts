import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createCSRFResponse } from "@/lib/csrf"

/**
 * Get CSRF token endpoint
 * Only authenticated users can get CSRF tokens
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    return await createCSRFResponse()
  } catch (error: any) {
    console.error("CSRF token error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء CSRF token" },
      { status: 500 }
    )
  }
}
