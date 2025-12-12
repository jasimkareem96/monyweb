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

    if (!session) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json(
        { error: "الطلب غير موجود" },
        { status: 404 }
      )
    }

    // Check access
    if (
      session.user.role !== "ADMIN" &&
      order.buyerId !== session.user.id &&
      order.merchantId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 403 }
      )
    }

    // Can only cancel if not completed
    if (["COMPLETED", "CANCELLED", "EXPIRED"].includes(order.status)) {
      return NextResponse.json(
        { error: "لا يمكن إلغاء الطلب في هذه الحالة" },
        { status: 400 }
      )
    }

    // Update order status
    await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    })

        return NextResponse.json({
          success: true,
          message: "تم إلغاء الطلب بنجاح",
        })
      } catch (error: any) {
        console.error("Cancel order error:", error)
        return NextResponse.json(
          { error: error.message || "حدث خطأ أثناء إلغاء الطلب" },
          { status: 500 }
        )
      }
    },
    { limit: 10, window: 60000 } // 10 requests per minute
  )
}

