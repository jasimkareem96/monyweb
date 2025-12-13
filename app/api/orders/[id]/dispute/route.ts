import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

        const body = await request.json()
        const { reason, buyerStatement } = body

        if (!reason || !buyerStatement) {
          return NextResponse.json(
            { error: "جميع الحقول مطلوبة" },
            { status: 400 }
          )
        }

        // Validate input length
        if (typeof reason !== 'string' || reason.trim().length === 0 || reason.length > 500) {
          return NextResponse.json(
            { error: "سبب النزاع يجب أن يكون بين 1 و 500 حرف" },
            { status: 400 }
          )
        }

        if (typeof buyerStatement !== 'string' || buyerStatement.trim().length === 0 || buyerStatement.length > 2000) {
          return NextResponse.json(
            { error: "البيان يجب أن يكون بين 1 و 2000 حرف" },
            { status: 400 }
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

    // Check if dispute already exists
    const existingDispute = await prisma.dispute.findUnique({
      where: { orderId: id },
    })

    if (existingDispute) {
      return NextResponse.json(
        { error: "يوجد نزاع موجود بالفعل لهذا الطلب" },
        { status: 400 }
      )
    }

    // Create dispute
    await prisma.dispute.create({
      data: {
        orderId: id,
        buyerId: session.user.id,
        merchantId: order.merchantId,
        reason,
        buyerStatement,
        status: "PENDING",
      },
    })

    // Update order - buyer rejected
    await prisma.order.update({
      where: { id },
      data: {
        buyerConfirmedReceived: false,
        buyerRejectedReason: reason,
      },
    })

    // Get all admins for notification
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    })

    // Create notifications
    await createNotifications([
      {
        userId: order.merchantId,
        type: "DISPUTE_CREATED" as const,
        title: "تم رفع نزاع جديد",
        message: `تم رفع نزاع على الطلب #${order.id.slice(0, 8)} من قبل المشتري`,
        link: `/orders/${order.id}`,
      },
      ...admins.map((admin) => ({
        userId: admin.id,
        type: "DISPUTE_CREATED" as const,
        title: "نزاع جديد يحتاج للمراجعة",
        message: `تم رفع نزاع على الطلب #${order.id.slice(0, 8)}`,
          link: `/admin/disputes/${id}`,
      })),
    ])

        return NextResponse.json({
          success: true,
          message: "تم رفع النزاع بنجاح",
        })
      } catch (error: any) {
        console.error("Create dispute error:", error)
        return NextResponse.json(
          { error: error.message || "حدث خطأ أثناء رفع النزاع" },
          { status: 500 }
        )
      }
    },
    { limit: 5, window: 60000 } // 5 requests per minute (stricter for disputes)
  )
}

