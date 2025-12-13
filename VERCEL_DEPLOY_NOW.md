# 🚀 النشر على Vercel - دليل سريع

## ✅ الخطوة 1: إعداد قاعدة البيانات على Supabase (10 دقائق)

### 1. إنشاء حساب على Supabase:
- اذهب إلى [supabase.com](https://supabase.com)
- سجل دخول أو أنشئ حساب جديد
- اضغط **"New Project"**

### 2. إعداد المشروع:
- **Name:** `monyweb`
- **Database Password:** اختر كلمة مرور قوية واحفظها!
- **Region:** اختر الأقرب لك (مثلاً: `Southeast Asia (Singapore)`)
- اضغط **"Create new project"**
- انتظر 2-3 دقائق حتى يكتمل الإعداد

### 3. الحصول على DATABASE_URL:
1. بعد اكتمال الإعداد، اذهب إلى **Settings** → **Database**
2. ابحث عن **"Connection String"**
3. اختر **"URI"** tab
4. انسخ الرابط (سيبدو هكذا):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
5. **⚠️ مهم جداً:** استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها في الخطوة 2
6. **احفظ هذا الرابط!** ستحتاجه في الخطوة 4

**مثال على DATABASE_URL النهائي:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## ✅ الخطوة 2: توليد الأسرار (2 دقيقة)

### في Terminal:
```powershell
cd c:\Users\pc\Desktop\monyweb
node scripts/generate-secrets.js
```

**احفظ:**
- `NEXTAUTH_SECRET`
- `CSRF_SECRET`

**مثال:**
```
NEXTAUTH_SECRET: qvFL3K+TGYMiRNq07zd/0ZAA2cXVcKfXpVGlP8QR6q0=
CSRF_SECRET: qvFL3K+TGYMiRNq07zd/0ZAA2cXVcKfXpVGlP8QR6q0=
```

---

## ✅ الخطوة 3: النشر على Vercel (10 دقائق)

### 1. تسجيل الدخول إلى Vercel:
- اذهب إلى [vercel.com](https://vercel.com)
- اضغط **"Sign Up"** أو **"Log In"**
- اختر **"Continue with GitHub"**
- سجل دخول بحساب GitHub الخاص بك

### 2. ربط المشروع:
1. بعد تسجيل الدخول، اضغط **"Add New..."** → **"Project"**
2. ابحث عن المستودع `jasimkareem96/monyweb`
3. اضغط **"Import"**

### 3. إعداد المشروع:
- **Project Name:** `monyweb` (أو أي اسم تريده)
- **Framework Preset:** Next.js (يتم اكتشافه تلقائياً)
- **Root Directory:** `./` (افتراضي)
- **Build Command:** `npm run build` (افتراضي)
- **Output Directory:** `.next` (افتراضي)

### 4. ⚠️ **قبل الضغط على Deploy - أضف Environment Variables:**

اضغط على **"Environment Variables"** وأضف:

| Variable | Value | ملاحظات |
|----------|-------|---------|
| `NODE_ENV` | `production` | - |
| `DATABASE_URL` | `postgresql://...` | من Supabase (الخطوة 1) |
| `NEXTAUTH_SECRET` | `qvFL3K+...` | من الخطوة 2 |
| `NEXTAUTH_URL` | `https://monyweb-xxxxx.vercel.app` | سيتم تحديثه بعد Deploy |
| `CSRF_SECRET` | نفس `NEXTAUTH_SECRET` | من الخطوة 2 |
| `ALLOWED_ORIGINS` | `https://monyweb-xxxxx.vercel.app` | سيتم تحديثه بعد Deploy |

**⚠️ مهم:** 
- `NEXTAUTH_URL` و `ALLOWED_ORIGINS` ستكون مؤقتة الآن
- سنحدثها بعد الحصول على الرابط الحقيقي

### 5. Deploy:
1. اضغط **"Deploy"**
2. انتظر 2-5 دقائق
3. بعد اكتمال Deploy، ستحصل على رابط مثل:
   ```
   https://monyweb-xxxxx.vercel.app
   ```

---

## ✅ الخطوة 4: تحديث Environment Variables (5 دقائق)

### بعد الحصول على الرابط الحقيقي:

1. اذهب إلى **Project Settings** → **Environment Variables**
2. حدث القيم التالية:
   - `NEXTAUTH_URL` = `https://monyweb-xxxxx.vercel.app` (الرابط الحقيقي)
   - `ALLOWED_ORIGINS` = `https://monyweb-xxxxx.vercel.app` (الرابط الحقيقي)
3. اضغط **"Save"**
4. اذهب إلى **Deployments** → Latest Deployment → **...** → **Redeploy**
5. انتظر حتى يكتمل Redeploy

---

## ✅ الخطوة 5: تشغيل Migrations (5 دقائق)

### في Terminal محلي:

```powershell
# 1. أضف DATABASE_URL في .env.local مؤقتاً
# (أو استخدم DATABASE_URL من Supabase مباشرة)

# 2. Generate Prisma Client
npx prisma generate

# 3. Push schema to database
npx prisma db push
```

**أو استخدام Migrations:**

```powershell
# إنشاء migration
npx prisma migrate dev --name init

# تطبيق في Production
npx prisma migrate deploy
```

**✅ تحقق:** 
- اذهب إلى Supabase → **Table Editor**
- يجب أن ترى جميع الجداول (User, Order, Offer, etc.)

---

## ✅ الخطوة 6: إنشاء Admin Account (2 دقيقة)

### في Terminal محلي:

```powershell
# تأكد من أن DATABASE_URL في .env.local
npm run db:seed
```

**✅ الحسابات الافتراضية:**
- **Admin:** `admin@monyweb.com` / `123456`
- **Merchant:** `merchant@monyweb.com` / `123456`
- **Buyer:** `buyer@monyweb.com` / `123456`

**⚠️ مهم جداً:** 
- غيّر كلمات المرور بعد أول تسجيل دخول!
- لا تشارك هذه الحسابات مع أحد!

---

## ✅ الخطوة 7: اختبار المنصة (5 دقائق)

### افتح الرابط:
```
https://monyweb-xxxxx.vercel.app
```

### اختبر:
- [ ] الصفحة الرئيسية تفتح ✅
- [ ] "تصفح العروض" يعمل ✅
- [ ] تسجيل حساب جديد ✅
- [ ] تسجيل دخول ✅
- [ ] صفحة الملف الشخصي ✅
- [ ] Admin Panel (`/admin`) ✅

---

## 🎉 تم!

**المنصة الآن على الهواء!** 🚀

**الرابط:** `https://monyweb-xxxxx.vercel.app`

---

## 📋 ملخص سريع

1. ✅ Supabase → DATABASE_URL
2. ✅ توليد الأسرار
3. ✅ Vercel → Deploy + Environment Variables
4. ✅ تحديث Environment Variables بعد Deploy
5. ✅ Prisma → Migrations
6. ✅ Admin Account
7. ✅ اختبار

**الوقت الإجمالي:** ~30-40 دقيقة

---

## 🆘 تحتاج مساعدة؟

**أخبرني:**
- في أي خطوة أنت؟
- ما هي المشكلة؟
- ما هي رسالة الخطأ؟

**سأساعدك فوراً!** 💪

---

## 📝 ملاحظات مهمة

### بعد النشر:
1. ⚠️ غيّر كلمات المرور الافتراضية
2. ⚠️ أضف Domain مخصص (اختياري)
3. ⚠️ فعّل SSL (يتم تلقائياً في Vercel)
4. ⚠️ راجع Security Settings

### للتحسينات المستقبلية:
- إضافة Email Notifications
- إضافة Cloud Storage (S3/Cloudinary)
- إضافة Analytics
- إضافة Monitoring
