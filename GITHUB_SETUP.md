# 📤 إعداد GitHub ورفع الكود

## الخطوة 1: إنشاء Repository على GitHub

1. اذهب إلى [github.com](https://github.com)
2. اضغط "+" (أعلى يمين) → "New repository"
3. **اسم المشروع:** `monyweb`
4. **الوصف:** (اختياري) "P2P Financial Marketplace Platform"
5. **Public** أو **Private** (اختر ما تريد)
6. **⚠️ لا تضع:**
   - ❌ README
   - ❌ .gitignore (موجود بالفعل)
   - ❌ License
7. اضغط **"Create repository"**

---

## الخطوة 2: رفع الكود

### في Terminal (PowerShell):

```powershell
# 1. تأكد أنك في مجلد المشروع
cd c:\Users\pc\Desktop\monyweb

# 2. تهيئة Git
git init

# 3. إضافة جميع الملفات
git add .

# 4. Commit
git commit -m "Initial commit - Ready for production"

# 5. إضافة Remote (استبدل yourusername بـ اسمك على GitHub)
git remote add origin https://github.com/yourusername/monyweb.git

# 6. رفع الكود
git branch -M main
git push -u origin main
```

**⚠️ إذا طُلب منك تسجيل الدخول:**
- استخدم GitHub Personal Access Token
- أو استخدم GitHub Desktop

---

## الخطوة 3: التحقق

1. اذهب إلى GitHub → Repository
2. تأكد من أن جميع الملفات موجودة
3. **⚠️ تأكد من أن `.env` و `.env.production` غير موجودة!**

---

## ✅ تم!

**الآن الكود على GitHub وجاهز للنشر على Vercel!**

**الخطوة التالية:** اذهب إلى [vercel.com](https://vercel.com) و Import Project

---

## 🆘 مشاكل شائعة

### مشكلة: "fatal: not a git repository"
**الحل:** شغّل `git init` أولاً

### مشكلة: "Permission denied"
**الحل:** 
- استخدم GitHub Personal Access Token
- أو استخدم GitHub Desktop

### مشكلة: "Large files"
**الحل:** تأكد من أن `.next` و `node_modules` في `.gitignore`

---

**هل تريد أن أساعدك في رفع الكود الآن؟** 🚀
