import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('جاري إنشاء الحسابات الافتراضية...')

  // Hash password
  const hashedPassword = await bcrypt.hash('123456', 10)

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@monyweb.com' },
    update: {},
    create: {
      email: 'admin@monyweb.com',
      name: 'مدير النظام',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  })
  console.log('✅ تم إنشاء حساب Admin:', admin.email, '| كلمة المرور: 123456')

  // Create Merchant
  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@monyweb.com' },
    update: {},
    create: {
      email: 'merchant@monyweb.com',
      name: 'تاجر تجريبي',
      password: hashedPassword,
      role: 'MERCHANT',
      isVerified: true,
    },
  })

  // Create Merchant Profile
  const merchantProfile = await prisma.merchantProfile.upsert({
    where: { userId: merchant.id },
    update: {},
    create: {
      userId: merchant.id,
      businessName: 'متجر تجريبي',
      isOnline: true,
      tier: 'GOLD',
    },
  })
  console.log('✅ تم إنشاء حساب Merchant:', merchant.email, '| كلمة المرور: 123456')

  // Create Buyer
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@monyweb.com' },
    update: {},
    create: {
      email: 'buyer@monyweb.com',
      name: 'مشتري تجريبي',
      password: hashedPassword,
      role: 'BUYER',
      isVerified: true,
    },
  })
  console.log('✅ تم إنشاء حساب Buyer:', buyer.email, '| كلمة المرور: 123456')

  // Create sample offer
  const offer = await prisma.offer.upsert({
    where: { id: 'sample-offer-1' },
    update: {},
    create: {
      id: 'sample-offer-1',
      merchantId: merchantProfile.id,
      offerType: 'PAYPAL_TO_PAYPAL',
      priceRate: 1.05,
      minAmount: 10,
      maxAmount: 1000,
      speed: '5-10 دقائق',
      description: 'عرض تجريبي للاختبار',
      isActive: true,
    },
  })
  console.log('✅ تم إنشاء عرض تجريبي')

  console.log('\n🎉 تم إنشاء جميع الحسابات بنجاح!')
  console.log('\n📋 معلومات الدخول:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 Admin:')
  console.log('   البريد: admin@monyweb.com')
  console.log('   كلمة المرور: 123456')
  console.log('\n👤 Merchant:')
  console.log('   البريد: merchant@monyweb.com')
  console.log('   كلمة المرور: 123456')
  console.log('\n👤 Buyer:')
  console.log('   البريد: buyer@monyweb.com')
  console.log('   كلمة المرور: 123456')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

