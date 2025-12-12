# دليل الإعداد - MonyWeb P2P Marketplace

## المتطلبات الأساسية

- Node.js 18+ 
- PostgreSQL أو استخدام Supabase
- npm أو yarn

## خطوات الإعداد

### 1. تثبيت الحزم

```bash
npm install
```

### 2. إعداد قاعدة البيانات

#### خيار أ: استخدام Supabase (موصى به)

1. أنشئ مشروع جديد على [Supabase](https://supabase.com)
2. انسخ رابط الاتصال من Settings > Database
3. أضف الرابط إلى ملف `.env`:

```
DATABASE_URL="your-supabase-connection-string"
```

#### خيار ب: استخدام PostgreSQL محلي

1. ثبت PostgreSQL على جهازك
2. أنشئ قاعدة بيانات جديدة:
```sql
CREATE DATABASE monyweb;
```
3. أضف رابط الاتصال إلى `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/monyweb?schema=public"
```

### 3. إعداد متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع:

```env
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# PayPal (اختياري - للإنتاج)
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-secret"
```

لإنشاء `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. إعداد قاعدة البيانات

```bash
# توليد Prisma Client
npx prisma generate

# تطبيق Schema على قاعدة البيانات
npx prisma db push

# (اختياري) فتح Prisma Studio لعرض البيانات
npx prisma studio
```

### 5. إنشاء حساب Admin

بعد تشغيل المشروع، يمكنك إنشاء حساب Admin يدوياً من قاعدة البيانات:

```sql
-- استبدل القيم التالية
INSERT INTO "User" (id, email, name, password, role, "isVerified", "createdAt", "updatedAt")
VALUES (
  'admin-id',
  'admin@example.com',
  'Admin User',
  '$2a$10$hashedpassword', -- استخدم bcrypt لتوليد hash
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

أو استخدم Prisma Studio لإضافة المستخدم.

### 6. تشغيل المشروع

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## الميزات الرئيسية

✅ نظام Escrow آمن
✅ إدارة العروض المالية
✅ نظام الإثباتات الشامل
✅ نظام النزاعات والتحكيم
✅ نظام التقييم والسمعة
✅ لوحة تحكم Admin كاملة
✅ حساب الرسوم التلقائي (1%)

## البنية الأساسية

- `/auth` - صفحات التسجيل والدخول
- `/dashboard` - لوحة التحكم الرئيسية
- `/offers` - تصفح العروض
- `/orders` - إدارة الطلبات
- `/merchant` - لوحة تحكم التاجر
- `/admin` - لوحة تحكم الإدارة

## ملاحظات مهمة

1. **رفع الملفات**: يتم حفظ الإثباتات في `public/uploads/evidence/`
2. **PayPal Integration**: يحتاج إلى إعداد Webhooks للإنتاج
3. **الأمان**: تأكد من استخدام HTTPS في الإنتاج
4. **Backup**: قم بعمل نسخ احتياطي منتظم لقاعدة البيانات

## الدعم

للمساعدة أو الاستفسارات، راجع ملف README.md

