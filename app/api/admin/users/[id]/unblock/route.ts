import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateCSRF } from "@/lib/csrf"
import { withRateLimit } from "@/middleware/rate-limit"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRateLimit(
    request,
    async () => {
      try {
        // Validate CSRF token
        const csrfValidation = await validateCSRF(request)
        if (!csrfValidation.valid) {
          return NextResponse.json(
            { error: "CSRF token غير صحيح" },
            { status: 403 }
          )
        }

        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
          return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
        }

        // Validate user ID
        if (!params.id || typeof params.id !== 'string' || params.id.trim().length === 0) {
          return NextResponse.json(
            { error: "معرف المستخدم غير صحيح" },
            { status: 400 }
          )
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { id: params.id },
        })

        if (!user) {
          return NextResponse.json(
            { error: "المستخدم غير موجود" },
            { status: 404 }
          )
        }

        await prisma.user.update({
          where: { id: params.id },
          data: { isBlocked: false },
        })

        return NextResponse.json({
          success: true,
          message: "تم إلغاء حظر المستخدم بنجاح",
        })
      } catch (error: any) {
        console.error("Unblock user error:", error)
        return NextResponse.json(
          { error: error.message || "حدث خطأ أثناء إلغاء حظر المستخدم" },
          { status: 500 }
        )
      }
    },
    { limit: 10, window: 60000 } // 10 requests per minute
  )
}

