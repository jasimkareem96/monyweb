import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateCSRF } from "@/lib/csrf"
import { withRateLimit } from "@/middleware/rate-limit"

export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      try {
        // Validate CSRF token
        const csrfValidation = await validateCSRF(request)
        if (!csrfValidation.valid) {
          const reason = csrfValidation.error || "unknown"
          return NextResponse.json(
            { error: `CSRF token غير صحيح (${reason})`, reason },
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
        const { offerId, amount } = body

        if (!offerId || !amount) {
          return NextResponse.json(
            { error: "المبلغ والعرض مطلوبان" },
            { status: 400 }
          )
        }

        // Validate amount type and value
        if (typeof amount !== 'number' || !isFinite(amount) || amount <= 0) {
          return NextResponse.json(
            { error: "المبلغ غير صحيح" },
            { status: 400 }
          )
        }

        // Validate offerId
        if (typeof offerId !== 'string' || offerId.trim().length === 0) {
          return NextResponse.json(
            { error: "معرف العرض غير صحيح" },
            { status: 400 }
          )
        }

    // Get offer
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        merchant: true,
      },
    })

    if (!offer || !offer.isActive) {
      return NextResponse.json(
        { error: "العرض غير موجود أو غير نشط" },
        { status: 400 }
      )
    }

    if (amount < offer.minAmount || amount > offer.maxAmount) {
      return NextResponse.json(
        { error: `المبلغ يجب أن يكون بين ${offer.minAmount} و ${offer.maxAmount}` },
        { status: 400 }
      )
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        offerId: offer.id,
        buyerId: session.user.id,
        merchantId: offer.merchant.userId,
        amount: amount,
        exchangeRate: offer.priceRate,
        totalAmount: amount * offer.priceRate,
        status: "PENDING_QUOTE",
      },
    })

        return NextResponse.json({
          success: true,
          order,
        })
      } catch (error: any) {
        console.error("Create order error:", error)
        return NextResponse.json(
          { error: error.message || "حدث خطأ أثناء إنشاء الطلب" },
          { status: 500 }
        )
      }
    },
    { limit: 10, window: 60000 } // 10 requests per minute
  )
}

