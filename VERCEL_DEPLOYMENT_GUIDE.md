# 🚀 دليل النشر على Vercel - خطوة بخطوة

## ✅ المتطلبات
- حساب GitHub
- حساب Supabase (مجاني) أو Railway (مجاني)
- 30 دقيقة من الوقت

---

## 📝 الخطوة 1: توليد الأسرار (Secrets)

### تم بالفعل! ✅
```
NEXTAUTH_SECRET: 4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=
CSRF_SECRET: Ks+G0VcBE8HQ6u09If7a5SgGUaTNEQFLFsYXHp1P6b0=
```

**⚠️ احفظ هذه الأسرار في مكان آمن!**

---

## 🗄️ الخطوة 2: إعداد قاعدة بيانات PostgreSQL

### الخيار 1: Supabase (موصى به - مجاني)

1. **سجل على Supabase:**
   - اذهب إلى [supabase.com](https://supabase.com)
   - سجل دخول أو أنشئ حساب

2. **أنشئ مشروع جديد:**
   - اضغط "New Project"
   - اختر Organization
   - اسم المشروع: `monyweb` (أو أي اسم)
   - كلمة مرور قاعدة البيانات: (احفظها!)
   - Region: اختر الأقرب لك
   - اضغط "Create new project"

3. **احصل على DATABASE_URL:**
   - انتظر حتى يكتمل الإعداد (2-3 دقائق)
   - اذهب إلى Settings → Database
   - ابحث عن "Connection String"
   - اختر "URI" tab
   - انسخ `DATABASE_URL` (سيبدو هكذا):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```
   - ⚠️ استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها

4. **اختبار الاتصال (اختياري):**
   ```bash
   # في Terminal محلي:
   # أضف DATABASE_URL مؤقتاً في .env
   # ثم:
   npx prisma db push
   ```

---

### الخيار 2: Railway (بديل - مجاني)

1. سجل على [railway.app](https://railway.app)
2. New Project → Deploy PostgreSQL
3. انسخ `DATABASE_URL` من Variables

---

## 📤 الخطوة 3: رفع الكود على GitHub

### 3.1 إنشاء Repository جديد

1. اذهب إلى [github.com](https://github.com)
2. اضغط "New" (أو + → New repository)
3. اسم المشروع: `monyweb`
4. Public أو Private (اختر ما تريد)
5. **لا** تضع README أو .gitignore (موجود بالفعل)
6. اضغط "Create repository"

### 3.2 رفع الكود

```bash
# في Terminal في مجلد المشروع:
cd c:\Users\pc\Desktop\monyweb

# تهيئة Git (إذا لم يكن موجوداً)
git init

# إضافة جميع الملفات
git add .

# Commit
git commit -m "Initial commit - Ready for production"

# إضافة Remote (استبدل yourusername بـ اسمك)
git remote add origin https://github.com/yourusername/monyweb.git

# رفع الكود
git branch -M main
git push -u origin main
```

**⚠️ تأكد من أن `.env` و `.env.production` في `.gitignore`!**

---

## 🚀 الخطوة 4: النشر على Vercel

### 4.1 ربط Vercel بـ GitHub

1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول (استخدم GitHub)
3. اضغط "Add New..." → "Project"
4. اختر المشروع `monyweb` من GitHub
5. اضغط "Import"

### 4.2 إعداد المشروع

**في صفحة Configure Project:**

1. **Project Name:** `monyweb` (أو أي اسم)
2. **Framework Preset:** Next.js (يُكتشف تلقائياً)
3. **Root Directory:** `./` (افتراضي)
4. **Build Command:** `npm run build` (افتراضي)
5. **Output Directory:** `.next` (افتراضي)

### 4.3 إضافة Environment Variables

**قبل الضغط على Deploy، اضغط "Environment Variables" وأضف:**

| Variable | Value | ملاحظات |
|----------|-------|---------|
| `NODE_ENV` | `production` | - |
| `DATABASE_URL` | `postgresql://...` | من Supabase |
| `NEXTAUTH_SECRET` | `4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=` | من الخطوة 1 |
| `NEXTAUTH_URL` | `https://yourproject.vercel.app` | سيتم تحديثه بعد Deploy |
| `CSRF_SECRET` | `4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=` | نفس NEXTAUTH_SECRET |
| `ALLOWED_ORIGINS` | `https://yourproject.vercel.app` | سيتم تحديثه بعد Deploy |

**⚠️ مهم:**
- `NEXTAUTH_URL` و `ALLOWED_ORIGINS` ستكون `https://yourproject.vercel.app` في البداية
- بعد Deploy، ستحصل على رابط حقيقي، قم بتحديثهما

### 4.4 Deploy

1. اضغط "Deploy"
2. انتظر حتى يكتمل البناء (2-5 دقائق)
3. بعد اكتمال Deploy، ستحصل على رابط مثل:
   ```
   https://monyweb-xxxxx.vercel.app
   ```

### 4.5 تحديث Environment Variables

**بعد الحصول على الرابط:**

1. اذهب إلى Project Settings → Environment Variables
2. حدث:
   - `NEXTAUTH_URL` = `https://monyweb-xxxxx.vercel.app`
   - `ALLOWED_ORIGINS` = `https://monyweb-xxxxx.vercel.app`
3. اضغط "Save"
4. اذهب إلى Deployments → Latest → ... → Redeploy

---

## 🗄️ الخطوة 5: تشغيل Migrations

### 5.1 إعداد Prisma للـ Production

```bash
# في Terminal محلي:
# تأكد من أن DATABASE_URL في .env.production
# ثم:

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

**أو استخدام Migrations (موصى به):**

```bash
# إنشاء migration
npx prisma migrate dev --name init

# تطبيق migrations في Production
npx prisma migrate deploy
```

---

## 👤 الخطوة 6: إنشاء Admin Account

### 6.1 استخدام Script الموجود

```bash
npm run db:seed
```

**أو يدوياً:**

1. اذهب إلى [supabase.com](https://supabase.com) → Project → SQL Editor
2. شغّل:
   ```sql
   -- استبدل القيم:
   INSERT INTO "User" (id, email, name, password, role, "isVerified", "isBlocked")
   VALUES (
     'admin-id-here',
     'admin@example.com',
     'Admin',
     '$2a$10$hashed_password_here', -- استخدم bcrypt hash
     'ADMIN',
     true,
     false
   );
   ```

### 6.2 أو استخدام Script الموجود

```bash
# في Terminal محلي (بعد إعداد DATABASE_URL):
npm run db:seed
```

---

## ✅ الخطوة 7: اختبارات نهائية

### 7.1 اختبارات أساسية

1. **افتح الرابط:**
   ```
   https://monyweb-xxxxx.vercel.app
   ```

2. **اختبر:**
   - [ ] الصفحة الرئيسية تفتح
   - [ ] "تصفح العروض" يعمل
   - [ ] تسجيل حساب جديد
   - [ ] تسجيل دخول
   - [ ] صفحة الملف الشخصي
   - [ ] إرسال طلب التحقق (KYC)

3. **اختبار Admin:**
   - [ ] تسجيل دخول كـ Admin
   - [ ] لوحة التحكم
   - [ ] قبول/رفض التحقق

---

## 🔧 الخطوة 8: إعدادات إضافية (اختياري)

### 8.1 ربط Domain مخصص

1. في Vercel Dashboard → Settings → Domains
2. أضف Domain الخاص بك
3. اتبع التعليمات لإعداد DNS
4. حدث `NEXTAUTH_URL` و `ALLOWED_ORIGINS`

### 8.2 إعداد Monitoring

- **Sentry:** لتتبع الأخطاء
- **Vercel Analytics:** مجاني مع Vercel
- **UptimeRobot:** لمراقبة Uptime

---

## 📋 Checklist النهائي

### قبل الإطلاق:
- [x] الأسرار مولّدة
- [ ] قاعدة بيانات PostgreSQL جاهزة
- [ ] الكود على GitHub
- [ ] Environment Variables في Vercel
- [ ] Deploy ناجح
- [ ] Migrations مطبقة
- [ ] Admin Account موجود

### بعد الإطلاق:
- [ ] اختبار الصفحة الرئيسية
- [ ] اختبار تسجيل الدخول
- [ ] اختبار KYC
- [ ] اختبار Admin Panel
- [ ] Domain مخصص (اختياري)

---

## 🆘 حل المشاكل

### مشكلة: Build فشل
- تحقق من Environment Variables
- تحقق من أن `DATABASE_URL` صحيح
- تحقق من Logs في Vercel Dashboard

### مشكلة: Database connection failed
- تحقق من `DATABASE_URL`
- تأكد من أن Supabase/Railway يسمح بالاتصالات الخارجية
- تحقق من Firewall settings

### مشكلة: Authentication لا يعمل
- تحقق من `NEXTAUTH_SECRET`
- تحقق من `NEXTAUTH_URL`
- تأكد من أن Cookies تعمل

---

## 🎉 تهانينا!

**المنصة الآن على الهواء!** 🚀

**الرابط:** `https://yourproject.vercel.app`

**الخطوة التالية:**
- اختبر جميع الميزات
- راقب Logs
- أضف Domain مخصص (اختياري)

---

**هل تحتاج مساعدة في أي خطوة؟ أخبرني!** 💪
