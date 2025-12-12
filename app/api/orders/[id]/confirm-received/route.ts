import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateFees } from "@/lib/utils"
import { createNotifications } from "@/lib/notifications"
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

    if (order.status !== "WAITING_BUYER_CONFIRM") {
      return NextResponse.json(
        { error: "حالة الطلب غير صحيحة" },
        { status: 400 }
      )
    }

    // Calculate fees
    const grossIn = order.totalAmount
    const fees = calculateFees(grossIn)

    // Update order to completed
    await prisma.order.update({
      where: { id },
      data: {
        status: "COMPLETED",
        buyerConfirmedReceived: true,
        completedAt: new Date(),
        grossIn: fees.paypalFeeIn + fees.netIn,
        paypalFeeIn: fees.paypalFeeIn,
        netIn: fees.netIn,
        platformFee: fees.platformFee,
        merchantReceivable: fees.merchantReceivable,
        paypalFeeOut: fees.paypalFeeOut,
        merchantNetFinal: fees.merchantNetFinal,
      },
    })

    // Update merchant stats
    const merchantProfile = await prisma.merchantProfile.findUnique({
      where: { userId: order.merchantId },
    })

    if (merchantProfile) {
      await prisma.merchantProfile.update({
        where: { userId: order.merchantId },
        data: {
          totalOrders: { increment: 1 },
          completedOrders: { increment: 1 },
        },
      })
    }

    // Create notifications
    await createNotifications([
      {
        userId: order.merchantId,
        type: "ORDER_COMPLETED" as const,
        title: "تم إكمال الطلب",
        message: `تم تأكيد استلام الطلب #${order.id.slice(0, 8)} من قبل المشتري`,
        link: `/orders/${order.id}`,
      },
      {
        userId: order.buyerId,
        type: "ORDER_COMPLETED" as const,
        title: "تم إكمال الطلب",
        message: `تم تأكيد استلام الطلب #${order.id.slice(0, 8)} بنجاح`,
        link: `/orders/${order.id}`,
      },
    ])

        return NextResponse.json({
          success: true,
          message: "تم تأكيد الاستلام بنجاح",
        })
      } catch (error: any) {
        console.error("Confirm received error:", error)
        return NextResponse.json(
          { error: error.message || "حدث خطأ أثناء تأكيد الاستلام" },
          { status: 500 }
        )
      }
    },
    { limit: 10, window: 60000 } // 10 requests per minute
  )
}

