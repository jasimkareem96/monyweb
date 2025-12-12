# 🚀 إعداد قاعدة البيانات - خطوات سريعة

## ✅ ما تم إنجازه:
- [x] تحديث Prisma Schema لدعم PostgreSQL
- [x] إعداد DATABASE_URL template

## ⏳ ما نحتاجه الآن:

### 1️⃣ الحصول على كلمة المرور:

**اذهب إلى:**
```
https://supabase.com/dashboard/project/ivqpasnoqnrddedfyycp/settings/database
```

**ابحث عن:**
- "Database Password" section
- إذا كانت مخفية، اضغط **"Reset Database Password"**
- اختر كلمة مرور جديدة واحفظها

---

### 2️⃣ بعد الحصول على كلمة المرور:

**أرسل لي كلمة المرور وسأقوم بـ:**

1. ✅ إنشاء `.env.production` مع DATABASE_URL الكامل
2. ✅ تشغيل `npx prisma generate`
3. ✅ تشغيل `npx prisma db push` (إنشاء Tables)
4. ✅ تشغيل `npm run db:seed` (إنشاء Admin Account)

---

## 🔧 أو يمكنك إعدادها يدوياً:

### أ. أنشئ ملف `.env.production`:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.ivqpasnoqnrddedfyycp.supabase.co:5432/postgres"
NODE_ENV=production
NEXTAUTH_SECRET=4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=
NEXTAUTH_URL=http://localhost:3000
CSRF_SECRET=4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=
ALLOWED_ORIGINS=http://localhost:3000
```

**استبدل `[PASSWORD]` بكلمة المرور**

### ب. شغّل الأوامر:

```powershell
# 1. Generate Prisma Client
npx prisma generate

# 2. Push schema to database
npx prisma db push

# 3. Create Admin Account
npm run db:seed
```

---

## 📋 الحسابات الافتراضية بعد db:seed:

- **Admin:** `admin@monyweb.com` / `123456`
- **Merchant:** `merchant@monyweb.com` / `123456`
- **Buyer:** `buyer@monyweb.com` / `123456`

**⚠️ غيّر كلمات المرور بعد أول تسجيل دخول!**

---

## 🆘 إذا واجهت مشاكل:

**أرسل لي:**
- كلمة المرور (أو أخبرني إذا قمت بـ Reset)
- أي أخطاء تظهر

**سأساعدك فوراً!** 🚀
