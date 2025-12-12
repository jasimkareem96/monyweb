import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateCSRF } from "@/lib/csrf"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    const verification = await prisma.verification.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!verification) {
      return NextResponse.json(
        { error: "طلب التحقق غير موجود" },
        { status: 404 }
      )
    }

    // Update verification status
    await prisma.verification.update({
      where: { id: params.id },
      data: {
        status: "APPROVED",
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
    })

    // Update user verification status
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        isVerified: true,
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: verification.userId,
        type: "VERIFICATION_APPROVED" as const,
        title: "تم التحقق من هويتك",
        message: "تم قبول طلب التحقق من الهوية. يمكنك الآن استخدام جميع ميزات المنصة",
        link: "/profile",
      },
    })

    return NextResponse.json({
      success: true,
      message: "تم قبول طلب التحقق بنجاح",
    })
  } catch (error: any) {
    console.error("Approve verification error:", error)
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء قبول طلب التحقق" },
      { status: 500 }
    )
  }
}
