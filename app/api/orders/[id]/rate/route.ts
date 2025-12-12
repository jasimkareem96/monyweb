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

        const body = await request.json()
        const { rating, comment } = body

        // Validate rating
        if (typeof rating !== 'number' || !isFinite(rating) || rating < 1 || rating > 5) {
          return NextResponse.json(
            { error: "التقييم يجب أن يكون بين 1 و 5" },
            { status: 400 }
          )
        }

        // Validate comment length if provided
        if (comment !== undefined && comment !== null) {
          if (typeof comment !== 'string' || comment.length > 1000) {
            return NextResponse.json(
              { error: "التعليق يجب أن يكون أقل من 1000 حرف" },
              { status: 400 }
            )
          }
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

        if (order.status !== "COMPLETED") {
          return NextResponse.json(
            { error: "يمكن التقييم فقط للطلبات المكتملة" },
            { status: 400 }
          )
        }

        // Check if already rated
        const existingRating = await prisma.rating.findUnique({
          where: { orderId: id },
        })

        if (existingRating) {
          return NextResponse.json(
            { error: "تم التقييم بالفعل" },
            { status: 400 }
          )
        }

        // Create rating
        await prisma.rating.create({
          data: {
            orderId: id,
            raterId: session.user.id,
            ratedId: order.merchantId,
            rating: parseInt(rating.toString()),
            comment: comment || null,
          },
        })

        // Update merchant rating
        const merchantProfile = await prisma.merchantProfile.findUnique({
          where: { userId: order.merchantId },
        })

        if (merchantProfile) {
          const newTotalRating = merchantProfile.totalRating + parseInt(rating.toString())
          const newRatingCount = merchantProfile.ratingCount + 1
          const newAverageRating = newTotalRating / newRatingCount

          // Update tier based on average rating
          let newTier = merchantProfile.tier
          if (newAverageRating >= 4.5 && merchantProfile.completedOrders >= 50) {
            newTier = "GOLD"
          } else if (newAverageRating >= 4.0 && merchantProfile.completedOrders >= 20) {
            newTier = "SILVER"
          } else {
            newTier = "BRONZE"
          }

          await prisma.merchantProfile.update({
            where: { userId: order.merchantId },
            data: {
              totalRating: newTotalRating,
              ratingCount: newRatingCount,
              averageRating: newAverageRating,
              tier: newTier,
            },
          })
        }

        return NextResponse.json({
          success: true,
          message: "تم إضافة التقييم بنجاح",
        })
      } catch (error: any) {
        console.error("Rate order error:", error)
        return NextResponse.json(
          { error: error.message || "حدث خطأ أثناء إضافة التقييم" },
          { status: 500 }
        )
      }
    },
    { limit: 5, window: 60000 } // 5 requests per minute
  )
}

