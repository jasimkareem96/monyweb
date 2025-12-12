# 🔐 Environment Variables لـ Vercel

## 📋 قائمة المتغيرات المطلوبة:

### 1️⃣ NODE_ENV
```
NODE_ENV=production
```

### 2️⃣ DATABASE_URL
```
DATABASE_URL=postgresql://postgres.ivqpasnoqnrddedfyycp:KU3AjJbs7Y6k0AyU@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### 3️⃣ NEXTAUTH_SECRET
```
NEXTAUTH_SECRET=4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=
```

### 4️⃣ NEXTAUTH_URL
```
NEXTAUTH_URL=https://monyweb-xxxxx.vercel.app
```
**⚠️ سيتم تحديثه بعد Deploy**

### 5️⃣ CSRF_SECRET
```
CSRF_SECRET=4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=
```

### 6️⃣ ALLOWED_ORIGINS
```
ALLOWED_ORIGINS=https://monyweb-xxxxx.vercel.app
```
**⚠️ سيتم تحديثه بعد Deploy**

---

## 📝 كيفية الإضافة في Vercel:

1. **اضغط على "> Environment Variables"**
2. **لكل متغير:**
   - اضغط "Add New"
   - أدخل **Name** (مثل: `NODE_ENV`)
   - أدخل **Value** (مثل: `production`)
   - اضغط "Save"
3. **كرر لكل متغير**

---

## ⚠️ ملاحظات مهمة:

- **لا تنسى إضافة جميع المتغيرات قبل Deploy!**
- `NEXTAUTH_URL` و `ALLOWED_ORIGINS` سيتم تحديثهما بعد Deploy
- بعد Deploy، حدثهما ثم Redeploy

---

**ابدأ الآن: اضغط "> Environment Variables"!** 🚀
