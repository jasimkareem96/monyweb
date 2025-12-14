import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"
import { validateCSRF } from "@/lib/csrf"
import { withRateLimit } from "@/middleware/rate-limit"
import { fileTypeFromBuffer } from "file-type"
import sharp from "sharp"
import { randomBytes } from "crypto"
import { createClient } from "@supabase/supabase-js"

// مهم: حتى Vercel يشغلها Node (لأن sharp يحتاج Node runtime)
export const runtime = "nodejs"

// Allowed MIME types for images
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]

// Dangerous file extensions to block
const DANGEROUS_EXTENSIONS = [
  ".exe",
  ".bat",
  ".cmd",
  ".com",
  ".pif",
  ".scr",
  ".vbs",
  ".js",
  ".jar",
  ".php",
  ".asp",
  ".aspx",
  ".jsp",
  ".html",
  ".htm",
  ".sh",
]

// اسم البكت الموجود عندك في Supabase Storage
const BUCKET_NAME = "img_user"

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
          return NextResponse.json({ error: "معرف الطلب غير صحيح" }, { status: 400 })
        }

        // Validate CSRF token
        const csrfValidation = await validateCSRF(request)
        if (!csrfValidation.valid) {
          return NextResponse.json({ error: "CSRF token غير صحيح" }, { status: 403 })
        }

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "BUYER") {
          return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
        }

        const formData = await request.formData()
        const beforePaymentProof = formData.get("beforePaymentProof") as File
        const afterPaymentProof = formData.get("afterPaymentProof") as File
        const transactionId = formData.get("transactionId") as string
        const confirmationText = formData.get("confirmationText") as string

        if (!beforePaymentProof || !afterPaymentProof || !transactionId || !confirmationText) {
          return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
        }

        // Validate file sizes (5MB max)
        if (
          beforePaymentProof.size > 5 * 1024 * 1024 ||
          afterPaymentProof.size > 5 * 1024 * 1024
        ) {
          return NextResponse.json(
            { error: "حجم الملف يجب أن يكون أقل من 5 ميجابايت" },
            { status: 400 }
          )
        }

        // Validate file sizes (minimum 1KB)
        if (beforePaymentProof.size < 1024 || afterPaymentProof.size < 1024) {
          return NextResponse.json({ error: "الملف صغير جداً" }, { status: 400 })
        }

        // Validate transaction ID
        if (
          typeof transactionId !== "string" ||
          transactionId.trim().length === 0 ||
          transactionId.length > 100
        ) {
          return NextResponse.json({ error: "معرف المعاملة غير صحيح" }, { status: 400 })
        }

        // Validate confirmation text
        if (
          typeof confirmationText !== "string" ||
          confirmationText.trim().length === 0 ||
          confirmationText.length > 500
        ) {
          return NextResponse.json({ error: "نص التأكيد غير صحيح" }, { status: 400 })
        }

        // Helper function to validate and process image
        const validateAndProcessImage = async (file: File) => {
          // Check file extension
          const fileExtension = "." + (file.name.split(".").pop()?.toLowerCase() || "")

          // Block dangerous extensions
          if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
            throw new Error(`نوع الملف غير مسموح: ${fileExtension}`)
          }

          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)

          // Validate MIME type from file header
          const fileType = await fileTypeFromBuffer(buffer)
          if (!fileType || !fileType.mime.startsWith("image/")) {
            throw new Error("الملف يجب أن يكون صورة")
          }

          if (!ALLOWED_MIME_TYPES.includes(fileType.mime)) {
            throw new Error(`نوع الصورة غير مدعوم: ${fileType.mime}`)
          }

          // Process and optimize image using Sharp -> نحولها JPG دائمًا
          const processedImage = await sharp(buffer)
            .resize(1920, 1920, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({
              quality: 85,
              progressive: true,
              mozjpeg: true,
            })
            .toBuffer()

          return processedImage
        }

        // Validate and process both images
        const beforeProcessed = await validateAndProcessImage(beforePaymentProof)
        const afterProcessed = await validateAndProcessImage(afterPaymentProof)

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
          return NextResponse.json({ error: "حالة الطلب غير صحيحة" }, { status: 400 })
        }

        // ---- Supabase Storage Upload (بدل حفظ الملفات على public) ----
        const SUPABASE_URL = process.env.SUPABASE_URL
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
          throw new Error("SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY غير موجودة في Environment Variables")
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        const timestamp = Date.now()
        const randomString = randomBytes(12).toString("hex")

        // نخزن داخل فولدر داخل البكت
        const folder = `payment_proofs/${id}`
        const beforeFileName = `before-${timestamp}-${randomString}.jpg`
        const afterFileName = `after-${timestamp}-${randomString}.jpg`

        const beforePath = `${folder}/${beforeFileName}`
        const afterPath = `${folder}/${afterFileName}`

        // Upload before
        const up1 = await supabase.storage.from(BUCKET_NAME).upload(beforePath, beforeProcessed, {
          contentType: "image/jpeg",
          upsert: false,
        })
        if (up1.error) {
          console.error("Supabase upload before error:", up1.error)
          throw new Error("فشل رفع صورة الإثبات (قبل)")
        }

        // Upload after
        const up2 = await supabase.storage.from(BUCKET_NAME).upload(afterPath, afterProcessed, {
          contentType: "image/jpeg",
          upsert: false,
        })
        if (up2.error) {
          console.error("Supabase upload after error:", up2.error)
          throw new Error("فشل رفع صورة الإثبات (بعد)")
        }

        // Get URLs
        const beforeUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(beforePath).data.publicUrl
        const afterUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(afterPath).data.publicUrl

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
          beforeUrl,
          afterUrl,
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
