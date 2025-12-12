# ✅ قائمة التحقق من النشر - Deployment Checklist

## 📋 قبل البدء

### ✅ تم إنجازه:
- [x] فحص أمني شامل
- [x] إصلاح جميع المشاكل الحرجة
- [x] CSRF Protection
- [x] Rate Limiting
- [x] File Upload Security
- [x] Input Validation
- [x] توليد الأسرار

---

## 🚀 خطوات النشر على Vercel

### الخطوة 1: إعداد قاعدة البيانات PostgreSQL ✅

**اختر واحد:**
- [ ] **Supabase** (موصى به - مجاني)
  - [supabase.com](https://supabase.com) → New Project
  - Settings → Database → Connection String
  - انسخ `DATABASE_URL`

- [ ] **Railway** (بديل - مجاني)
  - [railway.app](https://railway.app) → New Project → PostgreSQL
  - انسخ `DATABASE_URL`

**DATABASE_URL المطلوب:**
```
postgresql://user:password@host:5432/database?schema=public
```

---

### الخطوة 2: رفع الكود على GitHub ✅

```bash
git init
git add .
git commit -m "Ready for production"
git remote add origin https://github.com/yourusername/monyweb.git
git push -u origin main
```

**تحقق:**
- [ ] `.env` في `.gitignore` ✅
- [ ] `.env.production` في `.gitignore` ✅
- [ ] الكود على GitHub ✅

---

### الخطوة 3: النشر على Vercel ✅

1. **ربط GitHub:**
   - [vercel.com](https://vercel.com) → Import Project
   - اختر المشروع من GitHub

2. **Environment Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://... (من Supabase)
   NEXTAUTH_SECRET=4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=
   NEXTAUTH_URL=https://yourproject.vercel.app (سيتم تحديثه)
   CSRF_SECRET=4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=
   ALLOWED_ORIGINS=https://yourproject.vercel.app (سيتم تحديثه)
   ```

3. **Deploy:**
   - اضغط "Deploy"
   - انتظر 2-5 دقائق

4. **بعد Deploy:**
   - [ ] حدث `NEXTAUTH_URL` بالرابط الحقيقي
   - [ ] حدث `ALLOWED_ORIGINS` بالرابط الحقيقي
   - [ ] Redeploy

---

### الخطوة 4: تشغيل Migrations ✅

```bash
# في Terminal محلي (بعد إضافة DATABASE_URL في Vercel):
npx prisma generate
npx prisma db push
```

**أو:**
```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

**تحقق:**
- [ ] Prisma Client مولّد ✅
- [ ] Tables موجودة في قاعدة البيانات ✅

---

### الخطوة 5: إنشاء Admin Account ✅

```bash
npm run db:seed
```

**أو يدوياً:**
- استخدم Supabase SQL Editor
- أو Railway Database

**الحسابات الافتراضية:**
- Admin: `admin@monyweb.com` / `123456`
- Merchant: `merchant@monyweb.com` / `123456`
- Buyer: `buyer@monyweb.com` / `123456`

**⚠️ غيّر كلمات المرور بعد أول تسجيل دخول!**

---

### الخطوة 6: اختبارات نهائية ✅

- [ ] الصفحة الرئيسية تفتح
- [ ] "تصفح العروض" يعمل
- [ ] تسجيل حساب جديد
- [ ] تسجيل دخول
- [ ] صفحة الملف الشخصي
- [ ] إرسال طلب التحقق (KYC)
- [ ] Admin: قبول/رفض التحقق
- [ ] إنشاء عرض (Merchant)
- [ ] إنشاء طلب (Buyer)

---

## 🎯 الخطوة التالية

**بعد النشر الناجح:**

1. **تغيير كلمات المرور الافتراضية**
2. **إعداد Domain مخصص (اختياري)**
3. **إضافة Monitoring (Sentry, etc.)**
4. **إعداد Backup System**

---

## 📞 تحتاج مساعدة؟

**أخبرني:**
- في أي خطوة أنت؟
- ما هي المشكلة التي تواجهها؟

**سأساعدك فوراً!** 🚀
