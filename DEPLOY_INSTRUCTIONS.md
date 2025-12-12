# 🚀 تعليمات النشر على Vercel

## ✅ ما تم إنجازه:

- [x] تهيئة Git
- [x] إضافة جميع الملفات
- [x] Commit

---

## 📋 الخطوات التالية:

### 1️⃣ إنشاء Repository على GitHub:

1. اذهب إلى [github.com](https://github.com)
2. اضغط "+" → "New repository"
3. **Name:** `monyweb`
4. **Public** أو **Private**
5. **⚠️ لا تضع:** README, .gitignore, License
6. اضغط "Create repository"

---

### 2️⃣ ربط المشروع بـ GitHub:

**بعد إنشاء Repository، شغّل هذا الأمر:**

```powershell
cd c:\Users\pc\Desktop\monyweb

# ربط المشروع بـ GitHub
git remote add origin https://github.com/jasimkareem96/monyweb.git

# رفع الكود
git branch -M main
git push -u origin main
```

**⚠️ إذا طُلب تسجيل الدخول:**
- استخدم GitHub Personal Access Token
- أو استخدم GitHub Desktop

---

### 3️⃣ استيراد المشروع إلى Vercel:

**من صفحة Vercel الحالية:**

**الخيار 1: من القائمة**
- في قسم "Import Git Repository"
- ابحث عن `monyweb`
- اضغط **"Import"**

**الخيار 2: باستخدام URL**
- انسخ رابط GitHub: `https://github.com/jasimkareem96/monyweb`
- الصقه في حقل "Enter a Git repository URL"
- اضغط **"Continue"**

---

### 4️⃣ إعداد Environment Variables:

**⚠️ قبل Deploy، اضغط "Environment Variables"**

**أضف هذه المتغيرات:**

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

### 5️⃣ Deploy:

1. اضغط **"Deploy"**
2. انتظر 2-5 دقائق
3. بعد اكتمال Deploy، ستحصل على رابط مثل:
   ```
   https://monyweb-xxxxx.vercel.app
   ```

---

### 6️⃣ تحديث Environment Variables:

**بعد الحصول على الرابط الحقيقي:**

1. اذهب إلى **Project Settings** → **Environment Variables**
2. حدث:
   - `NEXTAUTH_URL` = `https://monyweb-xxxxx.vercel.app` (الرابط الحقيقي)
   - `ALLOWED_ORIGINS` = `https://monyweb-xxxxx.vercel.app` (الرابط الحقيقي)
3. اضغط "Save"
4. اذهب إلى **Deployments** → Latest → **...** → **Redeploy**

---

## 🎉 تم!

**المنصة الآن على الهواء!** 🚀

---

## 🔐 معلومات تسجيل الدخول:

- **Admin:** `admin@monyweb.com` / `123456`
- **Merchant:** `merchant@monyweb.com` / `123456`
- **Buyer:** `buyer@monyweb.com` / `123456`

---

## 🆘 إذا واجهت مشاكل:

**أخبرني:**
- في أي خطوة أنت؟
- ما هي المشكلة؟

**سأساعدك فوراً!** 💪
