import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import sharp from "sharp"
import { fileTypeFromBuffer } from "file-type"
import { withRateLimit } from "@/middleware/rate-limit"
import { validateCSRF } from "@/lib/csrf"

// Allowed MIME types for images
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

// Dangerous file extensions to block
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
  '.jar', '.php', '.asp', '.aspx', '.jsp', '.html', '.htm', '.sh'
]

export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
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

        const formData = await request.formData()
        const file = formData.get("file") as File
        const type = formData.get("type") as string

        if (!file) {
          return NextResponse.json(
            { error: "لم يتم رفع ملف" },
            { status: 400 }
          )
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: "حجم الملف يجب أن يكون أقل من 5 ميجابايت" },
            { status: 400 }
          )
        }

        // Validate file size (minimum 1KB)
        if (file.size < 1024) {
          return NextResponse.json(
            { error: "الملف صغير جداً" },
            { status: 400 }
          )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Check file extension
        const fileExtension = '.' + (file.name.split('.').pop()?.toLowerCase() || '')
        
        // Block dangerous extensions
        if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
          console.error(`Blocked dangerous file: ${file.name} (${fileExtension})`)
          return NextResponse.json(
            { error: "نوع الملف غير مسموح" },
            { status: 400 }
          )
        }

        // Validate extension
        if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
          return NextResponse.json(
            { error: "نوع الملف غير مدعوم. الصور المدعومة: JPG, PNG, WEBP, GIF" },
            { status: 400 }
          )
        }

        // Validate MIME type from file header (Magic Bytes)
        const fileType = await fileTypeFromBuffer(buffer)
        
        if (!fileType) {
          return NextResponse.json(
            { error: "لا يمكن تحديد نوع الملف. يرجى التأكد من أن الملف صورة صحيحة" },
            { status: 400 }
          )
        }

        // Verify it's actually an image
        if (!fileType.mime.startsWith('image/')) {
          console.error(`Blocked non-image file: ${file.name} (${fileType.mime})`)
          return NextResponse.json(
            { error: "الملف يجب أن يكون صورة" },
            { status: 400 }
          )
        }

        // Verify MIME type matches allowed types
        if (!ALLOWED_MIME_TYPES.includes(fileType.mime)) {
          return NextResponse.json(
            { error: `نوع الصورة غير مدعوم: ${fileType.mime}` },
            { status: 400 }
          )
        }

        // Verify declared MIME type matches actual file type
        if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
          console.warn(`MIME type mismatch: declared ${file.type}, actual ${fileType.mime}`)
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "public", "uploads")
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        // Generate unique filename (always use .jpg for consistency and security)
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const filename = `${type}-${session.user.id}-${timestamp}-${randomString}.jpg`
        const filepath = join(uploadsDir, filename)

        // Process and optimize image using Sharp
        let processedImage: Buffer
        
        try {
          processedImage = await sharp(buffer)
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
        } catch (error: any) {
          console.error("Image processing error:", error)
          return NextResponse.json(
            { error: "فشل في معالجة الصورة. يرجى التأكد من أن الملف صورة صحيحة" },
            { status: 400 }
          )
        }

        // Save processed image
        await writeFile(filepath, processedImage)

        // Return URL
        const url = `/uploads/${filename}`

        return NextResponse.json({
          success: true,
          url,
          filename,
          size: processedImage.length,
          originalSize: file.size,
        })
      } catch (error: any) {
        console.error("Upload error:", error)
        return NextResponse.json(
          { error: error.message || "حدث خطأ أثناء رفع الملف" },
          { status: 500 }
        )
      }
    },
    { limit: 10, window: 60000 } // 10 uploads per minute
  )
}
