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
          return NextResponse.json(
            { error: "غير مصرح" },
            { status: 401 }
          )
        }

        const body = await request.json()
        const { resolution, notes } = body

        if (!resolution || !notes) {
          return NextResponse.json(
            { error: "جميع الحقول مطلوبة" },
            { status: 400 }
          )
        }

        // Validate resolution
        if (resolution !== "BUYER" && resolution !== "MERCHANT") {
          return NextResponse.json(
            { error: "قرار الحل غير صحيح" },
            { status: 400 }
          )
        }

        // Validate notes length
        if (typeof notes !== 'string' || notes.trim().length === 0 || notes.length > 2000) {
          return NextResponse.json(
            { error: "الملاحظات يجب أن تكون بين 1 و 2000 حرف" },
            { status: 400 }
          )
        }

    // Get dispute
    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        order: true,
      },
    })

    if (!dispute) {
      return NextResponse.json(
        { error: "النزاع غير موجود" },
        { status: 404 }
      )
    }

    if (dispute.status !== "PENDING" && dispute.status !== "UNDER_REVIEW") {
      return NextResponse.json(
        { error: "النزاع تم حله بالفعل" },
        { status: 400 }
      )
    }

    const order = dispute.order

    if (resolution === "BUYER") {
      // Refund buyer (minus PayPal fees)
      // In a real implementation, you would process the refund through PayPal API
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      })

      await prisma.dispute.update({
        where: { id: params.id },
        data: {
          status: "RESOLVED_BUYER",
          adminNotes: notes,
          resolvedBy: session.user.id,
          resolvedAt: new Date(),
        },
      })

      // Create notifications
      await createNotifications([
        {
          userId: order.buyerId,
          type: "DISPUTE_RESOLVED" as const,
          title: "تم حل النزاع",
          message: `تم حل النزاع على الطلب #${order.id.slice(0, 8)} لصالحك. سيتم إرجاع المبلغ`,
          link: `/orders/${order.id}`,
        },
        {
          userId: order.merchantId,
          type: "DISPUTE_RESOLVED" as const,
          title: "تم حل النزاع",
          message: `تم حل النزاع على الطلب #${order.id.slice(0, 8)} لصالح المشتري`,
          link: `/orders/${order.id}`,
        },
      ])
    } else if (resolution === "MERCHANT") {
      // Release funds to merchant
      const grossIn = order.totalAmount
      const fees = calculateFees(grossIn)

      await prisma.order.update({
        where: { id: order.id },
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

      await prisma.dispute.update({
        where: { id: params.id },
        data: {
          status: "RESOLVED_MERCHANT",
          adminNotes: notes,
          resolvedBy: session.user.id,
          resolvedAt: new Date(),
        },
      })

      // Create notifications
      await createNotifications([
        {
          userId: order.buyerId,
          type: "DISPUTE_RESOLVED" as const,
          title: "تم حل النزاع",
          message: `تم حل النزاع على الطلب #${order.id.slice(0, 8)} لصالح التاجر`,
          link: `/orders/${order.id}`,
        },
        {
          userId: order.merchantId,
          type: "DISPUTE_RESOLVED" as const,
          title: "تم حل النزاع",
          message: `تم حل النزاع على الطلب #${order.id.slice(0, 8)} لصالحك. سيتم إطلاق الأموال`,
          link: `/orders/${order.id}`,
        },
      ])
    }

        return NextResponse.json({
          success: true,
          message: "تم حل النزاع بنجاح",
        })
      } catch (error: any) {
        console.error("Resolve dispute error:", error)
        return NextResponse.json(
          { error: error.message || "حدث خطأ أثناء حل النزاع" },
          { status: 500 }
        )
      }
    },
    { limit: 5, window: 60000 } // 5 requests per minute (stricter for admin actions)
  )
}

