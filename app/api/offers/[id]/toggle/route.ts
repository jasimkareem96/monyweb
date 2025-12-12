import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 14 App Router
    const { id: offerId } = await params

    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "MERCHANT") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    console.log("Toggle offer request:", { offerId, userId: session.user.id })

    if (!offerId) {
      return NextResponse.json(
        { error: "معرف العرض مطلوب" },
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

    console.log("Offer found:", { 
      offerExists: !!offer, 
      offerId: offer?.id, 
      isActive: offer?.isActive,
      merchantUserId: offer?.merchant?.userId,
      sessionUserId: session.user.id 
    })

    if (!offer) {
      return NextResponse.json(
        { error: "العرض غير موجود" },
        { status: 404 }
      )
    }

    if (offer.merchant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "غير مصرح - هذا العرض لا يخصك" },
        { status: 403 }
      )
    }

    // If deactivating, allow it without time restriction
    if (offer.isActive) {
      // Deactivating - allow it immediately
      const updatedOffer = await prisma.offer.update({
        where: { id: offerId },
        data: {
          isActive: false,
        },
      })

      return NextResponse.json({
        success: true,
        offer: updatedOffer,
        message: "تم إلغاء تفعيل العرض بنجاح. يمكنك الآن إنشاء أو تفعيل عرض جديد.",
      })
    } else {
      // Activating - check restrictions
      const merchantProfile = await prisma.merchantProfile.findUnique({
        where: { id: offer.merchantId },
        include: {
          offers: {
            where: { isActive: true },
          },
        },
      })

      console.log("Activating offer - checking restrictions:", {
        hasMerchantProfile: !!merchantProfile,
        activeOffersCount: merchantProfile?.offers.length || 0,
        lastOfferCreatedAt: merchantProfile?.lastOfferCreatedAt,
      })

      // Check if merchant already has active offer
      if (merchantProfile && merchantProfile.offers.length > 0) {
        console.log("Blocked: Merchant already has active offer")
        return NextResponse.json(
          { error: "لديك عرض نشط بالفعل. يمكنك إنشاء عرض واحد فقط في كل وقت. يجب إلغاء تفعيل العرض الحالي أولاً." },
          { status: 400 }
        )
      }

      // Check time restriction (only when activating, not when deactivating)
      if (merchantProfile?.lastOfferCreatedAt) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const lastOfferTime = new Date(merchantProfile.lastOfferCreatedAt)
        
        console.log("Time check:", {
          lastOfferTime: lastOfferTime.toISOString(),
          oneHourAgo: oneHourAgo.toISOString(),
          isBlocked: lastOfferTime > oneHourAgo,
        })
        
        if (lastOfferTime > oneHourAgo) {
          const minutesRemaining = Math.ceil((lastOfferTime.getTime() - oneHourAgo.getTime()) / (1000 * 60))
          console.log("Blocked: Time restriction", { minutesRemaining })
          return NextResponse.json(
            { error: `يجب الانتظار ${minutesRemaining} دقيقة قبل تفعيل عرض جديد. يمكنك إنشاء أو تفعيل عرض واحد كل ساعة.` },
            { status: 400 }
          )
        }
      }

      // Activate offer and update lastOfferCreatedAt
      const [updatedOffer] = await Promise.all([
        prisma.offer.update({
          where: { id: offerId },
          data: {
            isActive: true,
          },
        }),
        prisma.merchantProfile.update({
          where: { id: offer.merchantId },
          data: { lastOfferCreatedAt: new Date() },
        }),
      ])

      return NextResponse.json({
        success: true,
        offer: updatedOffer,
        message: "تم تفعيل العرض بنجاح",
      })
    }
  } catch (error: any) {
    console.error("Toggle offer error:", error)
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })
    return NextResponse.json(
      { 
        error: "حدث خطأ أثناء تحديث العرض",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

