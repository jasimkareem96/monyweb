import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { createNotification } from "@/lib/notifications"
import { validateCSRF } from "@/lib/csrf"
import { withRateLimit } from "@/middleware/rate-limit"
import { fileTypeFromBuffer } from "file-type"
import sharp from "sharp"
import { randomBytes } from "crypto"

// Allowed MIME types for images
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]

// Dangerous file extensions to block
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
  '.jar', '.php', '.asp', '.aspx', '.jsp', '.html', '.htm', '.sh'
]

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

        // Basic path traversal guard (id is used as folder name)
        if (!id || id.includes("..") || id.includes("/") || id.includes("\\")) {
          return NextResponse.json(
            { error: "معرف الطلب غير صحيح" },
            { status: 400 }
          )
        }

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

        const formData = await request.formData()
        const beforePaymentProof = formData.get("beforePaymentProof") as File
        const afterPaymentProof = formData.get("afterPaymentProof") as File
        const transactionId = formData.get("transactionId") as string
        const confirmationText = formData.get("confirmationText") as string

        if (!beforePaymentProof || !afterPaymentProof || !transactionId || !confirmationText) {
          return NextResponse.json(
            { error: "جميع الحقول مطلوبة" },
            { status: 400 }
          )
        }

        // Validate file sizes (5MB max)
        if (beforePaymentProof.size > 5 * 1024 * 1024 || afterPaymentProof.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: "حجم الملف يجب أن يكون أقل من 5 ميجابايت" },
            { status: 400 }
          )
        }

        // Validate file sizes (minimum 1KB)
        if (beforePaymentProof.size < 1024 || afterPaymentProof.size < 1024) {
          return NextResponse.json(
            { error: "الملف صغير جداً" },
            { status: 400 }
          )
        }

        // Validate transaction ID
        if (typeof transactionId !== 'string' || transactionId.trim().length === 0 || transactionId.length > 100) {
          return NextResponse.json(
            { error: "معرف المعاملة غير صحيح" },
            { status: 400 }
          )
        }

        // Validate confirmation text
        if (typeof confirmationText !== 'string' || confirmationText.trim().length === 0 || confirmationText.length > 500) {
          return NextResponse.json(
            { error: "نص التأكيد غير صحيح" },
            { status: 400 }
          )
        }

        // Helper function to validate and process image
        const validateAndProcessImage = async (file: File, fileName: string) => {
          // Check file extension
          const fileExtension = '.' + (file.name.split('.').pop()?.toLowerCase() || '')
          
          // Block dangerous extensions
          if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
            throw new Error(`نوع الملف غير مسموح: ${fileExtension}`)
          }

          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)

          // Validate MIME type from file header
          const fileType = await fileTypeFromBuffer(buffer)
          
          if (!fileType || !fileType.mime.startsWith('image/')) {
            throw new Error("الملف يجب أن يكون صورة")
          }

          if (!ALLOWED_MIME_TYPES.includes(fileType.mime)) {
            throw new Error(`نوع الصورة غير مدعوم: ${fileType.mime}`)
          }

          // Process and optimize image using Sharp
          const processedImage = await sharp(buffer)
            .resize(1920, 1920, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .jpeg({ 
              quality: 85,
              progressive: true,
              mozjpeg: true
            })
            .toBuffer()

          return processedImage
        }

        // Validate and process both images
        const beforeProcessed = await validateAndProcessImage(beforePaymentProof, 'before')
        const afterProcessed = await validateAndProcessImage(afterPaymentProof, 'after')

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

    if (order.status !== "WAITING_PAYMENT") {
      return NextResponse.json(
        { error: "حالة الطلب غير صحيحة" },
        { status: 400 }
      )
    }

        // Save files
        const uploadDir = join(process.cwd(), "public", "uploads", "evidence", id)
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }

        const timestamp = Date.now()
        const randomString = randomBytes(12).toString("hex")
        const beforeFileName = `before-${timestamp}-${randomString}.jpg`
        const afterFileName = `after-${timestamp}-${randomString}.jpg`

        const beforePath = join(uploadDir, beforeFileName)
        const afterPath = join(uploadDir, afterFileName)

        await writeFile(beforePath, beforeProcessed)
        await writeFile(afterPath, afterProcessed)

    const beforeUrl = `/uploads/evidence/${id}/${beforeFileName}`
    const afterUrl = `/uploads/evidence/${id}/${afterFileName}`

    // Update order
    await prisma.order.update({
      where: { id },
      data: {
        buyerBeforePaymentProof: beforeUrl,
        buyerAfterPaymentProof: afterUrl,
        paypalTransactionId: transactionId,
        buyerConfirmationText: confirmationText,
        status: "ESCROWED",
      },
    })

    // Create notification for merchant
    await createNotification({
      userId: order.merchantId,
      type: "ORDER_STATUS_CHANGED" as const,
      title: "تم استلام الدفع",
      message: `تم استلام إثبات الدفع للطلب #${order.id.slice(0, 8)}. يرجى البدء بتنفيذ العملية`,
      link: `/orders/${order.id}`,
    })

        return NextResponse.json({
          success: true,
          message: "تم رفع الإثباتات بنجاح",
        })
      } catch (error: any) {
        console.error("Upload payment proof error:", error)
        return NextResponse.json(
          { error: error.message || "حدث خطأ أثناء رفع الإثباتات" },
          { status: 500 }
        )
      }
    },
    { limit: 5, window: 60000 } // 5 uploads per minute
  )
}

