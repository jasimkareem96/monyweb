# 📍 خطوات الحصول على DATABASE_URL - بالصور

## 🎯 الخطوات بالتفصيل:

### 1️⃣ من الصفحة الحالية:

**أنت الآن في:** Schema Visualizer

**افعل التالي:**
- انظر إلى **القائمة الجانبية اليسرى (Left Sidebar)**
- ابحث عن قسم **"CONFIGURATION"**
- اضغط على **"Settings"** (⚙️)

---

### 2️⃣ في صفحة Settings:

**ستجد عدة Tabs في الأعلى:**
- General
- **Database** ← **اضغط هنا!**
- Authentication
- Storage
- ... إلخ

---

### 3️⃣ في Database Tab:

**ستجد عدة أقسام:**
- Database Password
- Connection Pooling
- **Connection String** ← **هذا ما نحتاجه!**

---

### 4️⃣ في Connection String:

**ستجد 3 خيارات:**
- Session mode
- Transaction mode
- **URI** ← **اختر هذا!**

**انسخ الرابط الكامل**

---

## 🔗 أو اذهب مباشرة:

**افتح هذا الرابط:**
```
https://supabase.com/dashboard/project/ivqpasnoqnrddedfyycp/settings/database
```

**ثم:**
1. ابحث عن **"Connection String"**
2. اختر **"URI"**
3. انسخ الرابط

---

## 📋 مثال على DATABASE_URL:

**سيبدو هكذا:**
```
postgresql://postgres.ivqpasnoqnrddedfyycp:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**أو:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.ivqpasnoqnrddedfyycp.supabase.co:5432/postgres
```

---

## ⚠️ إذا لم تجد "Connection String":

**جرب:**
1. **Connection Pooling** → **Session mode** → انسخ الرابط
2. أو ابحث في الصفحة عن **"postgresql://"**

---

**جرب الآن وأرسل لي DATABASE_URL!** 🚀
