import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { validateCSRF } from "@/lib/csrf"
import { NextRequest } from "next/server"

export async function PUT(request: NextRequest) {
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
    const { name, email, phone, password, currentPassword, profileImage } = body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    const updateData: any = {}

    // Update name
    if (name !== undefined) {
      updateData.name = name.trim() || null
    }

    // Update email
    if (email !== undefined && email !== user.email) {
      const trimmedEmail = email.trim()
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json(
          { error: "البريد الإلكتروني غير صحيح" },
          { status: 400 }
        )
      }

      // Check if email already exists
      const existingEmail = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      })

      if (existingEmail) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مستخدم بالفعل" },
          { status: 400 }
        )
      }

      updateData.email = trimmedEmail
    }

    // Update phone
    if (phone !== undefined) {
      const trimmedPhone = phone.trim()
      
      // Validate phone number format
      const phoneRegex = /^[0-9]{10,15}$/
      if (!phoneRegex.test(trimmedPhone.replace(/[\s\-\(\)]/g, ''))) {
        return NextResponse.json(
          { error: "رقم الهاتف غير صحيح. يجب أن يكون بين 10 و 15 رقم" },
          { status: 400 }
        )
      }

      // Check if phone already exists
      const existingPhone = await prisma.user.findFirst({
        where: { 
          phone: trimmedPhone,
          id: { not: session.user.id }
        },
      })

      if (existingPhone) {
        return NextResponse.json(
          { error: "رقم الهاتف مستخدم بالفعل" },
          { status: 400 }
        )
      }

      updateData.phone = trimmedPhone
    }

    // Update password
    if (password !== undefined) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "يجب إدخال كلمة المرور الحالية" },
          { status: 400 }
        )
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "كلمة المرور الحالية غير صحيحة" },
          { status: 400 }
        )
      }

      // Validate new password
      if (password.length < 6) {
        return NextResponse.json(
          { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
          { status: 400 }
        )
      }

      // Hash new password
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update profile image
    if (profileImage !== undefined) {
      updateData.profileImage = profileImage || null
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error: any) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء تحديث الملف الشخصي" },
      { status: 500 }
    )
  }
}
