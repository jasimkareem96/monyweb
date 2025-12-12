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

        // Validate CSRF token
        const csrfValidation = await validateCSRF(request)
        if (!csrfValidation.valid) {
          return NextResponse.json(
            { error: "CSRF token غير صحيح" },
            { status: 403 }
          )
        }

        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "MERCHANT") {
          return NextResponse.json(
            { error: "غير مصرح" },
            { status: 401 }
          )
        }

        const formData = await request.formData()
        const deliveryProof = formData.get("deliveryProof") as File
        const transactionId = formData.get("transactionId") as string
        const recipientAddress = formData.get("recipientAddress") as string
        const confirmationText = formData.get("confirmationText") as string

        if (!deliveryProof || !transactionId || !recipientAddress || !confirmationText) {
          return NextResponse.json(
            { error: "جميع الحقول مطلوبة" },
            { status: 400 }
          )
        }

        // Validate file size (5MB max)
        if (deliveryProof.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: "حجم الملف يجب أن يكون أقل من 5 ميجابايت" },
            { status: 400 }
          )
        }

        // Validate file size (minimum 1KB)
        if (deliveryProof.size < 1024) {
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

        // Validate recipient address
        if (typeof recipientAddress !== 'string' || recipientAddress.trim().length === 0 || recipientAddress.length > 500) {
          return NextResponse.json(
            { error: "عنوان المستلم غير صحيح" },
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

        // Check file extension
        const fileExtension = '.' + (deliveryProof.name.split('.').pop()?.toLowerCase() || '')
        
        // Block dangerous extensions
        if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
          return NextResponse.json(
            { error: "نوع الملف غير مسموح" },
            { status: 400 }
          )
        }

        const bytes = await deliveryProof.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Validate MIME type from file header
        const fileType = await fileTypeFromBuffer(buffer)
        
        if (!fileType || !fileType.mime.startsWith('image/')) {
          return NextResponse.json(
            { error: "الملف يجب أن يكون صورة" },
            { status: 400 }
          )
        }

        if (!ALLOWED_MIME_TYPES.includes(fileType.mime)) {
          return NextResponse.json(
            { error: `نوع الصورة غير مدعوم: ${fileType.mime}` },
            { status: 400 }
          )
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

        // Get order
        const order = await prisma.order.findUnique({
          where: { id },
        })

        if (!order || order.merchantId !== session.user.id) {
          return NextResponse.json(
            { error: "الطلب غير موجود أو غير مصرح" },
            { status: 404 }
          )
        }

        if (!["ESCROWED", "MERCHANT_PROCESSING"].includes(order.status)) {
          return NextResponse.json(
            { error: "حالة الطلب غير صحيحة" },
            { status: 400 }
          )
        }

        // Save file
        const uploadDir = join(process.cwd(), "public", "uploads", "evidence", id)
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }

        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileName = `delivery-${timestamp}-${randomString}.jpg`
        const filePath = join(uploadDir, fileName)

        await writeFile(filePath, processedImage)

        const fileUrl = `/uploads/evidence/${id}/${fileName}`

        // Update order
        await prisma.order.update({
          where: { id },
          data: {
            merchantDeliveryProof: fileUrl,
            merchantTransactionId: transactionId,
            merchantConfirmationText: confirmationText,
            status: "WAITING_BUYER_CONFIRM",
          },
        })

        // Create notification for buyer
        await createNotification({
          userId: order.buyerId,
          type: "DELIVERY_PROOF_REQUIRED" as const,
          title: "تم رفع إثبات التسليم",
          message: `تم رفع إثبات التسليم للطلب #${order.id.slice(0, 8)}. يرجى تأكيد الاستلام`,
          link: `/orders/${order.id}`,
        })

        return NextResponse.json({
          success: true,
          message: "تم رفع إثبات التسليم بنجاح",
        })
      } catch (error: any) {
        console.error("Upload delivery proof error:", error)
        return NextResponse.json(
          { error: error.message || "حدث خطأ أثناء رفع الإثبات" },
          { status: 500 }
        )
      }
    },
    { limit: 5, window: 60000 } // 5 uploads per minute
  )
}

