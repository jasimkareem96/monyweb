# ⚡ إعداد قاعدة البيانات السريع

## 🎯 الهدف:
ربط المشروع بقاعدة بيانات Supabase PostgreSQL

---

## 📝 الخطوات:

### 1️⃣ احصل على DATABASE_URL من Supabase:

**اذهب إلى:**
```
https://supabase.com/dashboard/project/ivqpasnoqnrddedfyycp/settings/database
```

**أو:**
1. [supabase.com/dashboard](https://supabase.com/dashboard)
2. اختر المشروع
3. Settings → Database
4. Connection String → URI tab
5. انسخ الرابط

---

### 2️⃣ أرسل لي DATABASE_URL:

**مثال:**
```
postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

### 3️⃣ سأقوم بـ:

- ✅ تحديث Prisma Schema (تم ✅)
- ✅ إعداد `.env.production`
- ✅ تشغيل Migrations
- ✅ إنشاء Tables
- ✅ إنشاء Admin Account

---

## 🔍 إذا لم تجد DATABASE_URL:

**ابحث في Supabase Dashboard عن:**
- "Connection String"
- "Database URL"
- "PostgreSQL Connection"

**أو استخدم:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.ivqpasnoqnrddedfyycp.supabase.co:5432/postgres
```

**استبدل `[YOUR-PASSWORD]` بكلمة المرور**

---

**أرسل لي DATABASE_URL الآن!** 🚀
