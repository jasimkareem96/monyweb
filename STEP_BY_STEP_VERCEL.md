# 🚀 خطوات النشر على Vercel - خطوة بخطوة

## ✅ الخطوة 1: إعداد قاعدة البيانات (10 دقائق)

### أ. سجل على Supabase:
1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل دخول أو أنشئ حساب
3. اضغط "New Project"

### ب. أنشئ المشروع:
- **Name:** `monyweb`
- **Database Password:** (اختر قوية واحفظها!)
- **Region:** اختر الأقرب لك
- اضغط "Create new project"

### ج. احصل على DATABASE_URL:
1. انتظر 2-3 دقائق حتى يكتمل الإعداد
2. اذهب إلى **Settings** → **Database**
3. ابحث عن **"Connection String"**
4. اختر **"URI"** tab
5. انسخ الرابط (سيبدو هكذا):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
6. **⚠️ استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها**

**احفظ هذا الرابط! ستحتاجه في الخطوة 4**

---

## ✅ الخطوة 2: رفع الكود على GitHub (5 دقائق)

### أ. إنشاء Repository:
1. اذهب إلى [github.com](https://github.com)
2. اضغط "+" → "New repository"
3. **Name:** `monyweb`
4. **Public** أو **Private**
5. **⚠️ لا تضع README أو .gitignore**
6. اضغط "Create repository"

### ب. رفع الكود:

**في Terminal (PowerShell):**

```powershell
# 1. اذهب لمجلد المشروع
cd c:\Users\pc\Desktop\monyweb

# 2. تهيئة Git
git init

# 3. إضافة الملفات
git add .

# 4. Commit
git commit -m "Ready for production"

# 5. إضافة Remote (استبدل yourusername)
git remote add origin https://github.com/yourusername/monyweb.git

# 6. رفع الكود
git branch -M main
git push -u origin main
```

**⚠️ إذا طُلب تسجيل الدخول:**
- استخدم GitHub Personal Access Token
- أو استخدم GitHub Desktop

---

## ✅ الخطوة 3: النشر على Vercel (10 دقائق)

### أ. ربط Vercel:
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول (استخدم GitHub)
3. اضغط "Add New..." → "Project"
4. اختر المشروع `monyweb` من GitHub
5. اضغط "Import"

### ب. إعداد Environment Variables:

**⚠️ قبل الضغط على Deploy، اضغط "Environment Variables"**

**أضف هذه المتغيرات:**

| Variable | Value | من أين؟ |
|----------|-------|---------|
| `NODE_ENV` | `production` | - |
| `DATABASE_URL` | `postgresql://...` | من Supabase (الخطوة 1) |
| `NEXTAUTH_SECRET` | `4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=` | من توليد الأسرار |
| `NEXTAUTH_URL` | `https://yourproject.vercel.app` | سيتم تحديثه بعد Deploy |
| `CSRF_SECRET` | `4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=` | نفس NEXTAUTH_SECRET |
| `ALLOWED_ORIGINS` | `https://yourproject.vercel.app` | سيتم تحديثه بعد Deploy |

### ج. Deploy:
1. اضغط "Deploy"
2. انتظر 2-5 دقائق
3. بعد اكتمال Deploy، ستحصل على رابط مثل:
   ```
   https://monyweb-xxxxx.vercel.app
   ```

### د. تحديث Environment Variables:

**بعد الحصول على الرابط الحقيقي:**

1. اذهب إلى **Project Settings** → **Environment Variables**
2. حدث:
   - `NEXTAUTH_URL` = `https://monyweb-xxxxx.vercel.app`
   - `ALLOWED_ORIGINS` = `https://monyweb-xxxxx.vercel.app`
3. اضغط "Save"
4. اذهب إلى **Deployments** → Latest → **...** → **Redeploy**

---

## ✅ الخطوة 4: تشغيل Migrations (5 دقائق)

### في Terminal محلي:

```powershell
# 1. أضف DATABASE_URL في .env.production مؤقتاً
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

**✅ تحقق:** اذهب إلى Supabase → Table Editor → يجب أن ترى Tables

---

## ✅ الخطوة 5: إنشاء Admin Account (2 دقيقة)

### في Terminal محلي:

```powershell
# تأكد من أن DATABASE_URL في .env.production
npm run db:seed
```

**✅ الحسابات الافتراضية:**
- **Admin:** `admin@monyweb.com` / `123456`
- **Merchant:** `merchant@monyweb.com` / `123456`
- **Buyer:** `buyer@monyweb.com` / `123456`

**⚠️ غيّر كلمات المرور بعد أول تسجيل دخول!**

---

## ✅ الخطوة 6: اختبار (5 دقائق)

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
- [ ] Admin Panel ✅

---

## 🎉 تم!

**المنصة الآن على الهواء!** 🚀

**الرابط:** `https://monyweb-xxxxx.vercel.app`

---

## 📋 ملخص سريع

1. ✅ Supabase → DATABASE_URL
2. ✅ GitHub → رفع الكود
3. ✅ Vercel → Deploy + Environment Variables
4. ✅ Prisma → Migrations
5. ✅ Admin Account
6. ✅ اختبار

**الوقت الإجمالي:** ~30 دقيقة

---

## 🆘 تحتاج مساعدة؟

**أخبرني:**
- في أي خطوة أنت؟
- ما هي المشكلة؟

**سأساعدك فوراً!** 💪
