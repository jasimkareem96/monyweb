# 🔍 أين تجد DATABASE_URL في Supabase

## ❌ ليس في:
- Schema Visualizer
- Tables
- Functions
- أي قسم في DATABASE MANAGEMENT

---

## ✅ هو في:

### الخطوات:

1. **من القائمة الجانبية (Left Sidebar):**
   - ابحث عن قسم **"CONFIGURATION"**
   - اضغط على **"Settings"** (⚙️)

2. **في صفحة Settings:**
   - ستجد عدة tabs في الأعلى
   - اضغط على **"Database"** tab

3. **في Database Settings:**
   - ابحث عن قسم **"Connection String"**
   - ستجد عدة خيارات:
     - **Session mode**
     - **Transaction mode**
     - **URI** ← **هذا ما نحتاجه!**

4. **انسخ DATABASE_URL:**
   - اضغط على **"URI"** tab
   - انسخ الرابط الكامل
   - سيبدو هكذا:
     ```
     postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```

---

## 📍 المسار الكامل:

```
Supabase Dashboard
  → Left Sidebar
    → CONFIGURATION
      → Settings ⚙️
        → Database tab
          → Connection String
            → URI tab
              → Copy الرابط
```

---

## 🎯 بديل سريع:

**اذهب مباشرة إلى:**
```
https://supabase.com/dashboard/project/ivqpasnoqnrddedfyycp/settings/database
```

**ثم:**
1. ابحث عن **"Connection String"**
2. اختر **"URI"** tab
3. انسخ الرابط

---

## ⚠️ إذا لم تجد "Connection String":

**ابحث عن:**
- "Database URL"
- "PostgreSQL Connection"
- "Connection Info"
- "Connection Pooling"

**أو استخدم:**
- **"Connection Pooling"** → **"Session mode"** → انسخ الرابط

---

**جرب الآن وأخبرني إذا وجدته!** 🚀
