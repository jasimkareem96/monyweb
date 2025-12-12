# 🚀 خطوات رفع المشروع على GitHub - آمن

## ✅ ما تم إصلاحه:

- [x] `.env` محمي في `.gitignore` ✅
- [x] `.env.production` محمي في `.gitignore` ✅
- [x] `prisma/dev.db` محمي في `.gitignore` ✅
- [x] تم إزالة `prisma/dev.db` من Git ✅

---

## 📋 الخطوات:

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

# ربط المشروع بـ GitHub (استبدل jasimkareem96)
git remote add origin https://github.com/jasimkareem96/monyweb.git
```

---

### 3️⃣ Commit التغييرات الأخيرة:

```powershell
# إضافة جميع الملفات (الملفات الحساسة مستبعدة تلقائياً)
git add .

# Commit
git commit -m "Ready for production - Secure push"
```

---

### 4️⃣ رفع الكود:

```powershell
# رفع الكود
git branch -M main
git push -u origin main
```

**⚠️ إذا طُلب تسجيل الدخول:**
- استخدم GitHub Personal Access Token
- أو استخدم GitHub Desktop

---

## 🔒 الملفات المحمية (لن يتم رفعها):

- ✅ `.env` - متغيرات البيئة المحلية
- ✅ `.env.production` - متغيرات البيئة للإنتاج
- ✅ `prisma/dev.db` - قاعدة البيانات المحلية
- ✅ `node_modules` - الحزم
- ✅ `.next` - ملفات البناء

---

## ✅ ما سيتم رفعه (آمن):

- ✅ الكود المصدري
- ✅ `package.json`
- ✅ `prisma/schema.prisma`
- ✅ المكونات والصفحات
- ✅ ملفات الإعداد

---

## 🎯 بعد الرفع:

**ستحتاج إلى إضافة Environment Variables في Vercel:**
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `CSRF_SECRET`
- وغيرها

**لكن هذه لن تكون في GitHub ✅**

---

## 🚀 جاهز للرفع!

**ابدأ الآن:**
1. أنشئ Repository على GitHub
2. شغّل الأوامر أعلاه

**أخبرني عندما تنتهي!** 💪
