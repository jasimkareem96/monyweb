import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateCSRF } from "@/lib/csrf"

export async function POST(request: NextRequest) {
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

    if (!session?.user) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { idType, idImage, selfieImage, fullName, address } = body

    if (!idType || !idImage || !selfieImage || !fullName || !address) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      )
    }

    // Check if user already has a verification request
    const existingVerification = await prisma.verification.findUnique({
      where: { userId: session.user.id },
    })

    if (existingVerification && existingVerification.status === "PENDING") {
      return NextResponse.json(
        { error: "لديك طلب تحقق قيد المراجعة بالفعل" },
        { status: 400 }
      )
    }

    if (existingVerification && existingVerification.status === "APPROVED") {
      return NextResponse.json(
        { error: "حسابك محقق بالفعل" },
        { status: 400 }
      )
    }

    // Create or update verification
    const verification = await prisma.verification.upsert({
      where: { userId: session.user.id },
      update: {
        idType,
        idImage,
        selfieImage,
        fullName,
        address,
        status: "PENDING",
        rejectionReason: null,
        reviewedBy: null,
        reviewedAt: null,
      },
      create: {
        userId: session.user.id,
        idType,
        idImage,
        selfieImage,
        fullName,
        address,
        status: "PENDING",
      },
    })

    return NextResponse.json({
      success: true,
      verification,
    })
  } catch (error: any) {
    console.error("Verification submit error:", error)
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء إرسال طلب التحقق" },
      { status: 500 }
    )
  }
}
