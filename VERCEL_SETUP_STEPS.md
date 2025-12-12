# 🚀 إعداد Vercel - خطوة بخطوة

## 📍 أنت الآن في صفحة "New Project" على Vercel

---

## ✅ الخطوة 1: التحقق من الإعدادات

### ما يجب أن يكون:

- ✅ **Project Name:** `monyweb` (صحيح)
- ✅ **Framework Preset:** `Next.js` (صحيح - تم اكتشافه تلقائياً)
- ✅ **Root Directory:** `./` (صحيح)
- ✅ **Repository:** `jasimkareem96/monyweb` (صحيح)

**⚠️ لا تغير هذه الإعدادات!**

---

## ⚠️ الخطوة 2: إضافة Environment Variables (مهم جداً!)

### قبل الضغط على "Deploy":

1. **اضغط على "> Environment Variables"** (سيفتح القسم)

2. **أضف هذه المتغيرات واحدة تلو الأخرى:**

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres.ivqpasnoqnrddedfyycp:KU3AjJbs7Y6k0AyU@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `NEXTAUTH_SECRET` | `4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=` |
| `NEXTAUTH_URL` | `https://monyweb-xxxxx.vercel.app` |
| `CSRF_SECRET` | `4NUPw0bboBhK4u31xcyf8RZQm8aYBjuavVLuboOk43c=` |
| `ALLOWED_ORIGINS` | `https://monyweb-xxxxx.vercel.app` |

**⚠️ مهم:**
- `NEXTAUTH_URL` و `ALLOWED_ORIGINS` ستكون `https://monyweb-xxxxx.vercel.app` في البداية
- بعد Deploy، ستحصل على رابط حقيقي، قم بتحديثهما

---

## ✅ الخطوة 3: Deploy

### بعد إضافة Environment Variables:

1. **اضغط على زر "Deploy"** (أسفل الصفحة)
2. **انتظر 2-5 دقائق** حتى يكتمل البناء
3. **بعد اكتمال Deploy، ستحصل على رابط مثل:**
   ```
   https://monyweb-xxxxx.vercel.app
   ```

---

## 🔄 الخطوة 4: تحديث Environment Variables

### بعد الحصول على الرابط الحقيقي:

1. اذهب إلى **Project Settings** → **Environment Variables**
2. حدث:
   - `NEXTAUTH_URL` = `https://monyweb-xxxxx.vercel.app` (الرابط الحقيقي)
   - `ALLOWED_ORIGINS` = `https://monyweb-xxxxx.vercel.app` (الرابط الحقيقي)
3. اضغط "Save"
4. اذهب إلى **Deployments** → Latest → **...** → **Redeploy**

---

## 📋 ملخص سريع:

1. ✅ تحقق من الإعدادات (كل شيء صحيح)
2. ⚠️ **أضف Environment Variables** (قبل Deploy!)
3. ✅ اضغط "Deploy"
4. 🔄 حدث Environment Variables بعد Deploy

---

## 🎯 الخطوة التالية الآن:

**اضغط على "> Environment Variables" وأضف المتغيرات!** 🚀
