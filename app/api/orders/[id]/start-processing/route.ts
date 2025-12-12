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

    if (!session || session.user.role !== "MERCHANT") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!order || order.merchantId !== session.user.id) {
      return NextResponse.json(
        { error: "الطلب غير موجود أو غير مصرح" },
        { status: 404 }
      )
    }

    if (order.status !== "ESCROWED") {
      return NextResponse.json(
        { error: "حالة الطلب غير صحيحة" },
        { status: 400 }
      )
    }

    // Update order status
    await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "MERCHANT_PROCESSING",
      },
    })

        return NextResponse.json({
          success: true,
          message: "تم بدء معالجة الطلب",
        })
      } catch (error: any) {
        console.error("Start processing error:", error)
        return NextResponse.json(
          { error: error.message || "حدث خطأ أثناء بدء المعالجة" },
          { status: 500 }
        )
      }
    },
    { limit: 10, window: 60000 } // 10 requests per minute
  )
}

