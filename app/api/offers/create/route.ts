import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "MERCHANT") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { merchantId, offerType, priceRate, minAmount, maxAmount, speed, description } = body

    if (!merchantId || !offerType || !priceRate || !minAmount || !maxAmount || !speed) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      )
    }

    // Verify merchant
    const merchantProfile = await prisma.merchantProfile.findUnique({
      where: { id: merchantId },
      include: {
        offers: {
          where: { isActive: true },
        },
      },
    })

    if (!merchantProfile || merchantProfile.userId !== session.user.id) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 403 }
      )
    }

    // Check if merchant already has an active offer
    if (merchantProfile.offers.length > 0) {
      return NextResponse.json(
        { error: "لديك عرض نشط بالفعل. يجب إلغاء تفعيل العرض الحالي أولاً قبل إنشاء عرض جديد." },
        { status: 400 }
      )
    }

    // Check if last offer was created less than 1 hour ago
    if (merchantProfile.lastOfferCreatedAt) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const lastOfferTime = new Date(merchantProfile.lastOfferCreatedAt)
      
      if (lastOfferTime > oneHourAgo) {
        const minutesRemaining = Math.ceil((lastOfferTime.getTime() - oneHourAgo.getTime()) / (1000 * 60))
        return NextResponse.json(
          { error: `يجب الانتظار ${minutesRemaining} دقيقة قبل إنشاء عرض جديد. يمكنك إنشاء عرض واحد كل ساعة.` },
          { status: 400 }
        )
      }
    }

    if (minAmount >= maxAmount) {
      return NextResponse.json(
        { error: "الحد الأدنى يجب أن يكون أقل من الحد الأعلى" },
        { status: 400 }
      )
    }

    // Create offer and update lastOfferCreatedAt
    const [offer] = await Promise.all([
      prisma.offer.create({
        data: {
          merchantId,
          offerType,
          priceRate: parseFloat(priceRate),
          minAmount: parseFloat(minAmount),
          maxAmount: parseFloat(maxAmount),
          speed,
          description: description || null,
          isActive: true,
        },
      }),
      prisma.merchantProfile.update({
        where: { id: merchantId },
        data: { lastOfferCreatedAt: new Date() },
      }),
    ])

    return NextResponse.json({
      success: true,
      offer,
    })
  } catch (error) {
    console.error("Create offer error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء العرض" },
      { status: 500 }
    )
  }
}

