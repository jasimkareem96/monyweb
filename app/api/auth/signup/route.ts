import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { withRateLimit } from "@/middleware/rate-limit"

export async function POST(request: Request) {
  return withRateLimit(
    request,
    async () => {
      try {
        let body
        try {
          body = await request.json()
        } catch (parseError: any) {
          console.error("JSON parse error:", parseError)
          return NextResponse.json(
            { error: "تنسيق البيانات غير صحيح" },
            { status: 400 }
          )
        }
        
        console.log("Signup request received")
        console.log("Request body keys:", Object.keys(body))
        console.log("Request body:", { 
          name: body.name, 
          email: body.email, 
          role: body.role,
          hasPassword: !!body.password,
          passwordLength: body.password?.length 
        })
        
        // Remove confirmPassword if present (client-side validation only)
        const { name, email, phone, password, role, confirmPassword, ...rest } = body

        // Validate required fields - check for empty strings too
        const trimmedName = typeof name === 'string' ? name.trim() : ''
        const trimmedEmail = typeof email === 'string' ? email.trim() : ''
        const trimmedPhone = typeof phone === 'string' ? phone.trim() : ''
        const trimmedPassword = typeof password === 'string' ? password : ''

        if (!trimmedEmail || !trimmedPassword || !trimmedName || !trimmedPhone) {
          console.error("Missing required fields:", { 
            hasEmail: !!trimmedEmail, 
            hasPassword: !!trimmedPassword, 
            hasName: !!trimmedName,
            hasPhone: !!trimmedPhone,
            emailValue: trimmedEmail,
            nameValue: trimmedName,
            phoneValue: trimmedPhone,
            passwordLength: trimmedPassword.length
          })
          return NextResponse.json(
            { error: "جميع الحقول مطلوبة" },
            { status: 400 }
          )
        }

        // Validate phone number format (basic validation)
        const phoneRegex = /^[0-9]{10,15}$/
        if (!phoneRegex.test(trimmedPhone.replace(/[\s\-\(\)]/g, ''))) {
          return NextResponse.json(
            { error: "رقم الهاتف غير صحيح. يجب أن يكون بين 10 و 15 رقم" },
            { status: 400 }
          )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(trimmedEmail)) {
          return NextResponse.json(
            { error: "البريد الإلكتروني غير صحيح" },
            { status: 400 }
          )
        }

        // Validate password length
        if (trimmedPassword.length < 6) {
          console.error("Invalid password length:", { length: trimmedPassword.length })
          return NextResponse.json(
            { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
            { status: 400 }
          )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: trimmedEmail },
        })

        if (existingUser) {
          return NextResponse.json(
            { error: "البريد الإلكتروني مستخدم بالفعل" },
            { status: 400 }
          )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(trimmedPassword, 10)

        // Check if phone number already exists
        const existingPhone = await prisma.user.findFirst({
          where: { phone: trimmedPhone },
        })

        if (existingPhone) {
          return NextResponse.json(
            { error: "رقم الهاتف مستخدم بالفعل" },
            { status: 400 }
          )
        }

        // Create user
        const user = await prisma.user.create({
          data: {
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            password: hashedPassword,
            role: (role === "MERCHANT" || role === "ADMIN") ? role : "BUYER",
          },
        })

        // Create merchant profile if role is MERCHANT
        if (role === "MERCHANT") {
          await prisma.merchantProfile.create({
            data: {
              userId: user.id,
            },
          })
        }

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        })
      } catch (error: any) {
        console.error("Signup error:", error)
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          meta: error.meta,
        })
        
        // Check if it's a database connection error
        if (error.code === "P1001" || error.message?.includes("connect") || error.message?.includes("Can't reach database")) {
          return NextResponse.json(
            { error: "خطأ في الاتصال بقاعدة البيانات. تأكد من تشغيل: npx prisma db push" },
            { status: 500 }
          )
        }
        
        // Check if it's a unique constraint violation
        if (error.code === "P2002") {
          return NextResponse.json(
            { error: "البريد الإلكتروني مستخدم بالفعل" },
            { status: 400 }
          )
        }
        
        return NextResponse.json(
          { error: error.message || "حدث خطأ أثناء التسجيل" },
          { status: 500 }
        )
      }
    },
    { useAuthLimit: true }
  )
}

