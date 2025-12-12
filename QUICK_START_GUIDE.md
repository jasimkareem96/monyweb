# دليل البدء السريع - Quick Start Guide

## 🎯 الخطوة الأولى: اختر طريقة النشر

### الخيار 1: Vercel (الأسهل والأسرع) ⭐ موصى به

#### الخطوات:
1. **رفع الكود على GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/monyweb.git
   git push -u origin main
   ```

2. **ربط المشروع بـ Vercel:**
   - اذهب إلى [vercel.com](https://vercel.com)
   - سجل دخول بـ GitHub
   - اضغط "New Project"
   - اختر المشروع من GitHub
   - أضف Environment Variables (انظر أدناه)
   - اضغط "Deploy"

3. **إعداد Environment Variables في Vercel:**
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = رابط PostgreSQL
   - `NEXTAUTH_SECRET` = (استخدم script أدناه)
   - `NEXTAUTH_URL` = `https://yourdomain.vercel.app`
   - `CSRF_SECRET` = نفس `NEXTAUTH_SECRET`
   - `ALLOWED_ORIGINS` = `https://yourdomain.vercel.app`

4. **إعداد قاعدة البيانات:**
   - استخدم [Supabase](https://supabase.com) (مجاني)
   - أو [Railway](https://railway.app) (مجاني للبداية)
   - انسخ `DATABASE_URL` وأضفه في Vercel

5. **تشغيل Migrations:**
   ```bash
   # في Vercel Dashboard > Settings > Environment Variables
   # أضف: DATABASE_URL
   # ثم في Terminal:
   npx prisma migrate deploy
   ```

---

### الخيار 2: VPS (DigitalOcean, AWS, etc.)

#### المتطلبات:
- VPS (Ubuntu 22.04)
- Domain name
- SSH access

#### الخطوات:
1. **تثبيت المتطلبات:**
   ```bash
   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # PostgreSQL
   sudo apt-get install postgresql postgresql-contrib
   
   # Nginx
   sudo apt-get install nginx
   
   # PM2
   sudo npm install -g pm2
   ```

2. **إعداد قاعدة البيانات:**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE monyweb;
   CREATE USER monyweb_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE monyweb TO monyweb_user;
   \q
   ```

3. **رفع الكود:**
   ```bash
   git clone https://github.com/yourusername/monyweb.git
   cd monyweb
   npm install
   ```

4. **إعداد Environment Variables:**
   ```bash
   cp .env.example .env.production
   nano .env.production
   # املأ القيم المطلوبة
   ```

5. **تشغيل Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

6. **Build و Deploy:**
   ```bash
   npm run build
   pm2 start npm --name "monyweb" -- start
   pm2 save
   pm2 startup
   ```

7. **إعداد Nginx:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **إعداد SSL (Let's Encrypt):**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 🔐 توليد الأسرار (Secrets)

### الطريقة 1: استخدام Script
```bash
node scripts/generate-secrets.js
```

### الطريقة 2: استخدام OpenSSL
```bash
openssl rand -base64 32
```

### الطريقة 3: استخدام Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📊 قاعدة البيانات

### الخيار 1: Supabase (مجاني) ⭐
1. سجل على [supabase.com](https://supabase.com)
2. أنشئ مشروع جديد
3. انسخ `Connection String` من Settings > Database
4. استخدمه كـ `DATABASE_URL`

### الخيار 2: Railway (مجاني للبداية)
1. سجل على [railway.app](https://railway.app)
2. أنشئ PostgreSQL database
3. انسخ `DATABASE_URL`

### الخيار 3: DigitalOcean (مدفوع)
1. أنشئ PostgreSQL database
2. انسخ `DATABASE_URL`

---

## ✅ Checklist قبل النشر

### الأمان:
- [ ] `NEXTAUTH_SECRET` قوي (32+ حرف)
- [ ] `CSRF_SECRET` محدد
- [ ] `DATABASE_URL` آمن
- [ ] `.env.production` في `.gitignore`
- [ ] SSL/HTTPS مفعّل

### قاعدة البيانات:
- [ ] PostgreSQL جاهز
- [ ] `DATABASE_URL` صحيح
- [ ] Migrations مطبقة
- [ ] Admin account موجود

### النشر:
- [ ] Environment Variables محددة
- [ ] Domain name جاهز
- [ ] SSL Certificate جاهز
- [ ] Build ناجح

---

## 🚀 الخطوة التالية

**اختر طريقة النشر وابدأ!**

1. **Vercel:** الأسهل - ابدأ من هنا إذا كنت مبتدئ
2. **VPS:** للتحكم الكامل - إذا كنت تريد VPS خاص

**أخبرني أي طريقة تريد استخدامها وسأساعدك خطوة بخطوة!**
