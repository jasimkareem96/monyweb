# 🔗 إعداد اتصال Supabase

## 📋 المعلومات المتوفرة:

- **Supabase URL:** `https://ivqpasnoqnrddedfyycp.supabase.co`
- **Project ID:** `ivqpasnoqnrddedfyycp`

## ⚠️ نحتاج DATABASE_URL الكامل

`DATABASE_URL` يجب أن يكون على هذا الشكل:
```
postgresql://postgres:[YOUR-PASSWORD]@db.ivqpasnoqnrddedfyycp.supabase.co:5432/postgres
```

## 🔍 كيفية الحصول على DATABASE_URL:

### الطريقة 1: من Supabase Dashboard (الأسهل)

1. اذهب إلى [supabase.com](https://supabase.com)
2. اختر مشروعك: `ivqpasnoqnrddedfyycp`
3. اذهب إلى **Settings** → **Database**
4. ابحث عن **"Connection String"**
5. اختر **"URI"** tab
6. انسخ الرابط الكامل

**سيبدو هكذا:**
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### الطريقة 2: بناء الرابط يدوياً

إذا كنت تعرف كلمة المرور:

```
postgresql://postgres:[YOUR-PASSWORD]@db.ivqpasnoqnrddedfyycp.supabase.co:5432/postgres?pgbouncer=true
```

**أو مع Connection Pooling:**
```
postgresql://postgres.ivqpasnoqnrddedfyycp:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## ✅ بعد الحصول على DATABASE_URL:

1. سأحدث Prisma schema ليدعم PostgreSQL
2. سأنشئ ملف `.env.production` مع DATABASE_URL
3. سأشغل Migrations

---

## 🆘 إذا نسيت كلمة المرور:

1. اذهب إلى Supabase Dashboard
2. Settings → Database → Reset Database Password
3. اختر كلمة مرور جديدة
4. استخدمها في DATABASE_URL

---

**أخبرني عندما تحصل على DATABASE_URL الكامل!** 🚀
