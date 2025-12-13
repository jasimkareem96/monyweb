# ⚡ النشر السريع على Vercel

## 🎯 الخطوات السريعة (30 دقيقة)

### 1️⃣ Supabase - قاعدة البيانات (10 دقائق)
```
1. اذهب إلى supabase.com
2. New Project → Name: monyweb
3. اختر كلمة مرور قوية
4. Settings → Database → Connection String → URI
5. انسخ DATABASE_URL (استبدل [YOUR-PASSWORD])
```

### 2️⃣ توليد الأسرار (1 دقيقة)
```powershell
node scripts/generate-secrets.js
```
**احفظ:** NEXTAUTH_SECRET و CSRF_SECRET

### 3️⃣ Vercel - النشر (10 دقائق)
```
1. اذهب إلى vercel.com
2. Sign Up with GitHub
3. Add New Project
4. اختر monyweb repository
5. ⚠️ اضغط "Environment Variables" قبل Deploy
```

**Environment Variables:**
```
NODE_ENV = production
DATABASE_URL = (من Supabase)
NEXTAUTH_SECRET = (من الخطوة 2)
NEXTAUTH_URL = https://monyweb-xxxxx.vercel.app (مؤقت)
CSRF_SECRET = (نفس NEXTAUTH_SECRET)
ALLOWED_ORIGINS = https://monyweb-xxxxx.vercel.app (مؤقت)
```

### 4️⃣ تحديث Environment Variables (5 دقائق)
```
1. بعد Deploy، انسخ الرابط الحقيقي
2. Settings → Environment Variables
3. حدث NEXTAUTH_URL و ALLOWED_ORIGINS
4. Redeploy
```

### 5️⃣ Migrations (5 دقائق)
```powershell
# أضف DATABASE_URL في .env.local
npx prisma generate
npx prisma db push
```

### 6️⃣ Admin Account (2 دقيقة)
```powershell
npm run db:seed
```

**الحسابات:**
- Admin: admin@monyweb.com / 123456
- Merchant: merchant@monyweb.com / 123456
- Buyer: buyer@monyweb.com / 123456

---

## ✅ تم!

**المنصة الآن على:** `https://monyweb-xxxxx.vercel.app`

---

## 🆘 مشاكل شائعة

### خطأ: "NEXTAUTH_SECRET must be set"
**الحل:** تأكد من إضافة NEXTAUTH_SECRET في Environment Variables

### خطأ: "DATABASE_URL not found"
**الحل:** تأكد من إضافة DATABASE_URL في Environment Variables

### خطأ: "Connection refused"
**الحل:** تحقق من DATABASE_URL (تأكد من استبدال [YOUR-PASSWORD])

---

## 📞 تحتاج مساعدة؟

راجع `VERCEL_DEPLOY_NOW.md` للتفاصيل الكاملة.
