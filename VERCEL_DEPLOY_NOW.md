# 🚀 نشر المشروع على Vercel - خطوة بخطوة

## 📍 أنت الآن في صفحة Vercel "New Project"

---

## ✅ الخطوة 1: رفع الكود على GitHub

### أ. إنشاء Repository على GitHub:

1. اذهب إلى [github.com](https://github.com)
2. اضغط "+" → "New repository"
3. **Name:** `monyweb`
4. **Public** أو **Private**
5. **⚠️ لا تضع:** README, .gitignore, License
6. اضغط "Create repository"

### ب. رفع الكود:

**في Terminal (PowerShell):**

```powershell
cd c:\Users\pc\Desktop\monyweb

# إذا لم يكن Git مهيأ:
git init
git add .
git commit -m "Ready for production - Database connected"

# إضافة Remote (استبدل jasimkareem96 بـ اسمك):
git remote add origin https://github.com/jasimkareem96/monyweb.git

# رفع الكود:
git branch -M main
git push -u origin main
```

**⚠️ إذا طُلب تسجيل الدخول:**
- استخدم GitHub Personal Access Token
- أو استخدم GitHub Desktop

---

## ✅ الخطوة 2: استيراد المشروع إلى Vercel

### أ. من صفحة Vercel الحالية:

1. **في قسم "Import Git Repository":**
   - ابحث عن `monyweb` في القائمة
   - اضغط **"Import"** بجانب المشروع

### ب. أو استخدم Git URL:

1. **انسخ رابط GitHub:**
   ```
   https://github.com/jasimkareem96/monyweb
   ```

2. **الصقه في حقل "Enter a Git repository URL"**
   - اضغط **"Continue"**

---

## ✅ الخطوة 3: إعداد المشروع في Vercel

### أ. Configure Project:

- **Project Name:** `monyweb` (أو أي اسم)
- **Framework Preset:** Next.js (يُكتشف تلقائياً)
- **Root Directory:** `./` (افتراضي)
- **Build Command:** `npm run build` (افتراضي)
- **Output Directory:** `.next` (افتراضي)

### ب. Environment Variables:

**⚠️ قبل الضغط على Deploy، اضغط "Environment Variables"**

**أضف هذه المتغيرات:**

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres.ivqpasnoqnrddedfyycp:KU3AjJbs7Y6k0AyU@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `NEXTAUTH_SECRET` | `4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=` |
| `NEXTAUTH_URL` | `https://monyweb-xxxxx.vercel.app` (سيتم تحديثه بعد Deploy) |
| `CSRF_SECRET` | `4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=` |
| `ALLOWED_ORIGINS` | `https://monyweb-xxxxx.vercel.app` (سيتم تحديثه بعد Deploy) |

**⚠️ مهم:**
- `NEXTAUTH_URL` و `ALLOWED_ORIGINS` ستكون `https://monyweb-xxxxx.vercel.app` في البداية
- بعد Deploy، ستحصل على رابط حقيقي، قم بتحديثهما

---

## ✅ الخطوة 4: Deploy

1. اضغط **"Deploy"**
2. انتظر 2-5 دقائق حتى يكتمل البناء
3. بعد اكتمال Deploy، ستحصل على رابط مثل:
   ```
   https://monyweb-xxxxx.vercel.app
   ```

---

## ✅ الخطوة 5: تحديث Environment Variables

**بعد الحصول على الرابط الحقيقي:**

1. اذهب إلى **Project Settings** → **Environment Variables**
2. حدث:
   - `NEXTAUTH_URL` = `https://monyweb-xxxxx.vercel.app`
   - `ALLOWED_ORIGINS` = `https://monyweb-xxxxx.vercel.app`
3. اضغط "Save"
4. اذهب إلى **Deployments** → Latest → **...** → **Redeploy**

---

## ✅ الخطوة 6: اختبار

**افتح الرابط:**
```
https://monyweb-xxxxx.vercel.app
```

**اختبر:**
- [ ] الصفحة الرئيسية تفتح
- [ ] تسجيل دخول كـ Admin
- [ ] تصفح العروض
- [ ] لوحة التحكم

---

## 🎉 تم!

**المنصة الآن على الهواء!** 🚀

---

## 🆘 إذا واجهت مشاكل:

**أخبرني:**
- في أي خطوة أنت؟
- ما هي المشكلة؟

**سأساعدك فوراً!** 💪
