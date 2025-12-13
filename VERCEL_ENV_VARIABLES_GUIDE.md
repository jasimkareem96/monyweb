# 🔐 Environment Variables في Vercel - دليل شامل

## ✅ المتغيرات المطلوبة (يجب إضافتها)

### 1. `NODE_ENV`
**القيمة:** `production`
**مطلوب:** نعم
**من أين:** - (قيمة ثابتة)

---

### 2. `DATABASE_URL`
**القيمة:** `postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
**مطلوب:** نعم
**من أين:** Supabase → Settings → Database → Connection String → URI
**⚠️ مهم:** استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها في Supabase

**مثال:**
```
postgresql://postgres.abcdefghijklmnop:MyPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

### 3. `NEXTAUTH_SECRET`
**القيمة:** سلسلة عشوائية قوية (32+ حرف)
**مطلوب:** نعم
**من أين:** 
```bash
node scripts/generate-secrets.js
```
**مثال:**
```
qvFL3K+TGYMiRNq07zd/0ZAA2cXVcKfXpVGlP8QR6q0=
```

---

### 4. `NEXTAUTH_URL`
**القيمة:** `https://yourproject.vercel.app`
**مطلوب:** نعم
**من أين:** ستحصل عليه بعد أول Deploy من Vercel
**⚠️ مهم:** 
- في البداية استخدم: `https://monyweb-xxxxx.vercel.app` (مؤقت)
- بعد Deploy، حدثه بالرابط الحقيقي

**مثال:**
```
https://monyweb-abc123.vercel.app
```

---

### 5. `CSRF_SECRET`
**القيمة:** نفس `NEXTAUTH_SECRET`
**مطلوب:** نعم
**من أين:** نفس قيمة `NEXTAUTH_SECRET`

**مثال:**
```
qvFL3K+TGYMiRNq07zd/0ZAA2cXVcKfXpVGlP8QR6q0=
```

---

### 6. `ALLOWED_ORIGINS`
**القيمة:** `https://yourproject.vercel.app`
**مطلوب:** نعم
**من أين:** نفس `NEXTAUTH_URL`

**مثال:**
```
https://monyweb-abc123.vercel.app
```

---

## ⚠️ المتغيرات الاختيارية (يمكن إضافتها لاحقاً)

### 7. `UPSTASH_REDIS_REST_URL` (اختياري)
**القيمة:** من Upstash Redis
**مطلوب:** لا (لـ Rate Limiting فقط)
**من أين:** [upstash.com](https://upstash.com) → Create Database

---

### 8. `UPSTASH_REDIS_REST_TOKEN` (اختياري)
**القيمة:** من Upstash Redis
**مطلوب:** لا (لـ Rate Limiting فقط)
**من أين:** [upstash.com](https://upstash.com) → Database → REST API

---

## 📋 ملخص سريع - ما تحتاج إضافته في Vercel:

| Variable | Value | مطلوب |
|----------|-------|-------|
| `NODE_ENV` | `production` | ✅ نعم |
| `DATABASE_URL` | من Supabase | ✅ نعم |
| `NEXTAUTH_SECRET` | من `generate-secrets.js` | ✅ نعم |
| `NEXTAUTH_URL` | `https://yourproject.vercel.app` | ✅ نعم |
| `CSRF_SECRET` | نفس `NEXTAUTH_SECRET` | ✅ نعم |
| `ALLOWED_ORIGINS` | نفس `NEXTAUTH_URL` | ✅ نعم |

---

## 🚀 خطوات الإضافة في Vercel:

1. اذهب إلى **Vercel Dashboard**
2. اضغط على المشروع `monyweb`
3. اذهب إلى **Settings** → **Environment Variables**
4. اضغط **"Add New"**
5. أضف كل متغير من القائمة أعلاه
6. اختر **Environment:** `Production` (و `Preview` و `Development` إذا أردت)
7. اضغط **"Save"**

---

## ⚠️ ملاحظات مهمة:

1. **لا تشارك الأسرار مع أحد!**
2. **احفظ `NEXTAUTH_SECRET` و `DATABASE_URL` في مكان آمن**
3. **بعد Deploy، حدث `NEXTAUTH_URL` و `ALLOWED_ORIGINS` بالرابط الحقيقي**
4. **بعد تحديث Environment Variables، قم بـ Redeploy**

---

## 🔄 بعد إضافة Environment Variables:

1. اذهب إلى **Deployments**
2. اضغط على آخر deployment
3. اضغط **"..."** → **"Redeploy"**
4. انتظر حتى يكتمل Deploy

---

## ✅ التحقق من النجاح:

بعد Deploy، تحقق من:
- ✅ لا توجد أخطاء "NEXTAUTH_SECRET must be set"
- ✅ لا توجد أخطاء "DATABASE_URL not found"
- ✅ البناء يكتمل بنجاح
- ✅ الموقع يعمل

---

## 🆘 إذا نسيت قيمة:

### NEXTAUTH_SECRET:
```bash
cd c:\Users\pc\Desktop\monyweb
node scripts/generate-secrets.js
```

### DATABASE_URL:
- اذهب إلى Supabase → Settings → Database → Connection String → URI

---

## 📝 مثال كامل:

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres.abc123:MyPassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres
NEXTAUTH_SECRET=qvFL3K+TGYMiRNq07zd/0ZAA2cXVcKfXpVGlP8QR6q0=
NEXTAUTH_URL=https://monyweb-abc123.vercel.app
CSRF_SECRET=qvFL3K+TGYMiRNq07zd/0ZAA2cXVcKfXpVGlP8QR6q0=
ALLOWED_ORIGINS=https://monyweb-abc123.vercel.app
```

---

**✅ الآن أنت جاهز لإضافة Environment Variables في Vercel!**
