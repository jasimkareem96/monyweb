# ⚡ نشر سريع على Vercel - 3 خطوات

## 🎯 أنت الآن في صفحة Vercel "New Project"

---

## ✅ الخطوة 1: رفع الكود على GitHub (5 دقائق)

### أ. إنشاء Repository:

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

# تهيئة Git
git init
git add .
git commit -m "Ready for production"

# إضافة Remote (استبدل jasimkareem96 بـ اسمك على GitHub)
git remote add origin https://github.com/jasimkareem96/monyweb.git

# رفع الكود
git branch -M main
git push -u origin main
```

**⚠️ إذا طُلب تسجيل الدخول:**
- استخدم GitHub Personal Access Token
- أو استخدم GitHub Desktop

---

## ✅ الخطوة 2: استيراد المشروع إلى Vercel

### من صفحة Vercel الحالية:

**الخيار 1: من القائمة**
- في قسم "Import Git Repository"
- ابحث عن `monyweb`
- اضغط **"Import"**

**الخيار 2: باستخدام URL**
- انسخ رابط GitHub: `https://github.com/jasimkareem96/monyweb`
- الصقه في حقل "Enter a Git repository URL"
- اضغط **"Continue"**

---

## ✅ الخطوة 3: إعداد Environment Variables

**⚠️ قبل Deploy، اضغط "Environment Variables"**

**أضف:**

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres.ivqpasnoqnrddedfyycp:KU3AjJbs7Y6k0AyU@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
NEXTAUTH_SECRET=4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=
NEXTAUTH_URL=https://monyweb-xxxxx.vercel.app
CSRF_SECRET=4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=
ALLOWED_ORIGINS=https://monyweb-xxxxx.vercel.app
```

**⚠️ `NEXTAUTH_URL` و `ALLOWED_ORIGINS` سيتم تحديثهما بعد Deploy**

---

## ✅ الخطوة 4: Deploy

1. اضغط **"Deploy"**
2. انتظر 2-5 دقائق
3. بعد اكتمال Deploy، ستحصل على رابط

---

## ✅ الخطوة 5: تحديث Environment Variables

**بعد الحصول على الرابط الحقيقي:**

1. Settings → Environment Variables
2. حدث `NEXTAUTH_URL` و `ALLOWED_ORIGINS`
3. Redeploy

---

## 🎉 تم!

**المنصة الآن على الهواء!** 🚀

---

**ابدأ بالخطوة 1: رفع الكود على GitHub!** 💪
