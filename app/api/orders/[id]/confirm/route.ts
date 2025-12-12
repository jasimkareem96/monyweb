import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateCSRF } from "@/lib/csrf"
import { withRateLimit } from "@/middleware/rate-limit"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    async () => {
      try {
        // Await params in Next.js 14 App Router
        const { id } = await params

        // Validate CSRF token
        const csrfValidation = await validateCSRF(request)
        if (!csrfValidation.valid) {
          return NextResponse.json(
            { error: "CSRF token غير صحيح" },
            { status: 403 }
          )
        }

        const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "BUYER") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order || order.buyerId !== session.user.id) {
      return NextResponse.json(
        { error: "الطلب غير موجود أو غير مصرح" },
        { status: 404 }
      )
    }

    if (order.status !== "PENDING_QUOTE") {
      return NextResponse.json(
        { error: "حالة الطلب غير صحيحة" },
        { status: 400 }
      )
    }

    // Update order status
    await prisma.order.update({
      where: { id },
      data: {
        status: "WAITING_PAYMENT",
      },
    })

        return NextResponse.json({
          success: true,
          message: "تم تأكيد الطلب بنجاح",
        })
      } catch (error: any) {
        console.error("Confirm order error:", error)
        return NextResponse.json(
          { error: error.message || "حدث خطأ أثناء تأكيد الطلب" },
          { status: 500 }
        )
      }
    },
    { limit: 10, window: 60000 } // 10 requests per minute
  )
}

