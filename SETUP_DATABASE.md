# 🔗 إعداد قاعدة البيانات - Supabase

## 📍 معلومات المشروع:
- **Project URL:** `https://ivqpasnoqnrddedfyycp.supabase.co`
- **Project ID:** `ivqpasnoqnrddedfyycp`

---

## ✅ الخطوة 1: الحصول على DATABASE_URL

### من Supabase Dashboard:

1. **اذهب إلى:** [supabase.com/dashboard](https://supabase.com/dashboard)
2. **اختر مشروعك:** `ivqpasnoqnrddedfyycp`
3. **Settings** (⚙️) → **Database**
4. **Connection String** → **URI** tab
5. **انسخ الرابط الكامل**

**سيبدو هكذا:**
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**أو:**
```
postgresql://postgres:[PASSWORD]@db.ivqpasnoqnrddedfyycp.supabase.co:5432/postgres
```

---

## ⚠️ إذا نسيت كلمة المرور:

1. في **Settings** → **Database**
2. ابحث عن **"Database Password"**
3. اضغط **"Reset Database Password"**
4. اختر كلمة مرور جديدة واحفظها

---

## 📋 بعد الحصول على DATABASE_URL:

**أرسل لي DATABASE_URL الكامل وسأقوم بـ:**

1. ✅ إعداد `.env.production`
2. ✅ تشغيل Prisma Migrations
3. ✅ إنشاء Tables في قاعدة البيانات
4. ✅ إنشاء Admin Account

---

## 🔧 أو يمكنك إعدادها يدوياً:

### 1. أنشئ ملف `.env.production`:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.ivqpasnoqnrddedfyycp.supabase.co:5432/postgres"
NODE_ENV=production
NEXTAUTH_SECRET=4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=
NEXTAUTH_URL=http://localhost:3000
CSRF_SECRET=4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=
ALLOWED_ORIGINS=http://localhost:3000
```

### 2. شغّل Migrations:

```bash
npx prisma generate
npx prisma db push
```

### 3. أنشئ Admin Account:

```bash
npm run db:seed
```

---

**أرسل لي DATABASE_URL الكامل الآن!** 🚀
