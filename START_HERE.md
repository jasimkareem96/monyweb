# 🚀 ابدأ من هنا - Start Here

## الخطوة الأولى: اختر طريقة النشر

### ⭐ الخيار 1: Vercel (الأسهل - موصى به للمبتدئين)

**الوقت المطلوب:** 30 دقيقة  
**التكلفة:** مجاني للبداية

#### الخطوات:

1. **توليد الأسرار (Secrets):**
   ```bash
   npm run generate:secrets
   ```
   احفظ `NEXTAUTH_SECRET` و `CSRF_SECRET`

2. **إعداد قاعدة بيانات PostgreSQL:**
   - اذهب إلى [Supabase.com](https://supabase.com) (مجاني)
   - أنشئ مشروع جديد
   - من Settings > Database > Connection String
   - انسخ `DATABASE_URL`

3. **رفع الكود على GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/monyweb.git
   git push -u origin main
   ```

4. **النشر على Vercel:**
   - اذهب إلى [vercel.com](https://vercel.com)
   - سجل دخول بـ GitHub
   - اضغط "New Project"
   - اختر المشروع
   - أضف Environment Variables:
     - `NODE_ENV` = `production`
     - `DATABASE_URL` = (من Supabase)
     - `NEXTAUTH_SECRET` = (من الخطوة 1)
     - `NEXTAUTH_URL` = `https://yourproject.vercel.app`
     - `CSRF_SECRET` = (نفس NEXTAUTH_SECRET)
     - `ALLOWED_ORIGINS` = `https://yourproject.vercel.app`
   - اضغط "Deploy"

5. **تشغيل Migrations:**
   ```bash
   # في Vercel Dashboard > Settings > Environment Variables
   # تأكد من إضافة DATABASE_URL
   # ثم في Terminal محلي:
   npx prisma migrate deploy
   ```

6. **إنشاء Admin Account:**
   ```bash
   npm run db:seed
   ```

✅ **تم! المنصة جاهزة!**

---

### 🔧 الخيار 2: VPS (للتحكم الكامل)

**الوقت المطلوب:** 2-3 ساعات  
**التكلفة:** $5-10/شهر

راجع `QUICK_START_GUIDE.md` للتفاصيل الكاملة.

---

## 📋 Checklist سريع

### قبل النشر:
- [ ] توليد `NEXTAUTH_SECRET` قوي
- [ ] إعداد قاعدة بيانات PostgreSQL
- [ ] إعداد Environment Variables
- [ ] تشغيل Migrations
- [ ] إنشاء Admin Account
- [ ] اختبارات نهائية

### بعد النشر:
- [ ] اختبار تسجيل الدخول
- [ ] اختبار إنشاء حساب
- [ ] اختبار KYC
- [ ] اختبار إنشاء عرض
- [ ] اختبار إنشاء طلب

---

## 🆘 تحتاج مساعدة؟

**أخبرني:**
1. أي طريقة نشر تريد استخدامها؟ (Vercel أو VPS)
2. هل لديك domain name جاهز؟
3. هل تريد مساعدة في إعداد قاعدة البيانات؟

**سأساعدك خطوة بخطوة!** 🚀
