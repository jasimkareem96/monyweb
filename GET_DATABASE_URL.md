# 🔗 الحصول على DATABASE_URL من Supabase

## 📍 معلومات المشروع:
- **Project ID:** `ivqpasnoqnrddedfyycp`
- **URL:** `https://ivqpasnoqnrddedfyycp.supabase.co`

---

## ✅ الخطوات:

### 1. اذهب إلى Supabase Dashboard:
[supabase.com/dashboard](https://supabase.com/dashboard)

### 2. اختر مشروعك:
- ابحث عن المشروع `ivqpasnoqnrddedfyycp`
- اضغط عليه

### 3. اذهب إلى Settings:
- من القائمة الجانبية → **Settings** (⚙️)
- ثم **Database**

### 4. احصل على Connection String:
- ابحث عن قسم **"Connection String"**
- اختر **"URI"** tab (ليس "Session mode" أو "Transaction")
- انسخ الرابط الكامل

**سيبدو هكذا:**
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**أو:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.ivqpasnoqnrddedfyycp.supabase.co:5432/postgres
```

---

## ⚠️ إذا نسيت كلمة المرور:

1. في نفس الصفحة (Settings → Database)
2. ابحث عن **"Database Password"**
3. اضغط **"Reset Database Password"**
4. اختر كلمة مرور جديدة
5. استخدمها في DATABASE_URL

---

## 📋 بعد الحصول على DATABASE_URL:

**انسخ الرابط الكامل وأرسله لي، وسأقوم بـ:**
1. ✅ إعداد `.env.production`
2. ✅ تشغيل Prisma Migrations
3. ✅ إنشاء Tables في قاعدة البيانات
4. ✅ إنشاء Admin Account

---

**أرسل لي DATABASE_URL الكامل الآن!** 🚀
