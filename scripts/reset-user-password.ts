import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const newPassword = process.argv[3] || '123456'

  if (!email) {
    console.error('❌ يرجى إدخال البريد الإلكتروني')
    console.log('الاستخدام: tsx scripts/reset-user-password.ts <email> [new-password]')
    process.exit(1)
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.error(`❌ المستخدم غير موجود: ${email}`)
      process.exit(1)
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        isBlocked: false, // Unblock if blocked
      },
    })

    console.log('✅ تم تحديث كلمة المرور بنجاح!')
    console.log(`📧 البريد الإلكتروني: ${email}`)
    console.log(`🔑 كلمة المرور الجديدة: ${newPassword}`)
  } catch (error: any) {
    console.error('❌ خطأ:', error.message)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
