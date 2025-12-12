# دليل إعداد الإنتاج 🚀

## 📋 Checklist قبل النشر

### ✅ الأمان (Security)
- [x] File upload security - **تم**
- [x] Rate limiting - **تم**
- [x] CSRF protection - **تم**
- [x] Security headers - **تم**
- [x] Security logging - **تم**
- [ ] Environment variables محددة
- [ ] SSL/HTTPS مفعل
- [ ] Database backup strategy

---

## 🔐 Environment Variables

### 1. إنشاء ملف `.env.production`

انسخ `.env.example` إلى `.env.production` واملأ القيم:

```bash
cp .env.example .env.production
```

### 2. القيم المطلوبة

#### Database
```env
# Production Database (PostgreSQL recommended)
DATABASE_URL="postgresql://user:password@host:5432/monyweb?schema=public"
```

#### NextAuth
```env
# Generate strong secret
NEXTAUTH_SECRET="your-strong-random-secret-32-chars-minimum"
NEXTAUTH_URL="https://yourdomain.com"
```

**لإنشاء NEXTAUTH_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

#### Security
```env
CSRF_SECRET="${NEXTAUTH_SECRET}"
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

#### File Storage (اختياري - موصى به)
```env
# AWS S3
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

---

## 🗄️ Database Setup

### 1. إنشاء قاعدة البيانات

#### PostgreSQL (Local)
```sql
CREATE DATABASE monyweb;
CREATE USER monyweb_user WITH PASSWORD 'strong-password';
GRANT ALL PRIVILEGES ON DATABASE monyweb TO monyweb_user;
```

#### Supabase (Cloud - موصى به)
1. أنشئ مشروع جديد على [Supabase](https://supabase.com)
2. انسخ Connection String من Settings > Database
3. أضفه إلى `.env.production`

### 2. Migration

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# أو استخدام Migrations (موصى به للإنتاج)
npx prisma migrate deploy
```

---

## 📦 Build & Deploy

### 1. Build

```bash
npm run build
```

### 2. Test Build Locally

```bash
npm start
```

### 3. Deploy

#### Vercel (موصى به لـ Next.js)
1. اربط GitHub repository
2. أضف Environment Variables في Vercel Dashboard
3. Deploy

#### Docker
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔒 Security Checklist

### قبل النشر:
- [ ] جميع Environment Variables محددة
- [ ] NEXTAUTH_SECRET قوي (32+ حرف)
- [ ] DATABASE_URL آمن (لا يحتوي على credentials في الكود)
- [ ] SSL/HTTPS مفعل
- [ ] Security Headers مفعلة ✅
- [ ] CSRF Protection مفعل ✅
- [ ] Rate Limiting مفعل ✅
- [ ] File Upload Security مفعل ✅

---

## 📊 Monitoring Setup

### 1. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

### 2. Logging

- استخدام `lib/security-logger.ts` الموجود
- إرسال Logs إلى خدمة مثل:
  - LogRocket
  - Datadog
  - CloudWatch

---

## 💾 Backup Strategy

### Database Backup

#### PostgreSQL
```bash
# Manual backup
pg_dump -U user -d monyweb > backup.sql

# Restore
psql -U user -d monyweb < backup.sql
```

#### Automated Backup (Cron)
```bash
# Daily backup script
0 2 * * * pg_dump -U user -d monyweb > /backups/monyweb-$(date +\%Y\%m\%d).sql
```

#### Supabase
- Automatic backups متوفرة في Supabase Pro plan

---

## 🚀 Deployment Platforms

### Vercel (موصى به)
- ✅ Built-in Next.js optimization
- ✅ Automatic HTTPS
- ✅ Environment variables management
- ✅ Serverless functions

### Railway
- ✅ Easy PostgreSQL setup
- ✅ Automatic deployments
- ✅ Environment variables

### DigitalOcean App Platform
- ✅ Managed PostgreSQL
- ✅ Auto-scaling
- ✅ CDN included

---

## 📝 Post-Deployment

### 1. Verify Security Headers
```bash
curl -I https://yourdomain.com
```

### 2. Test Critical Features
- [ ] User registration
- [ ] User login
- [ ] File upload
- [ ] Profile update
- [ ] Verification flow

### 3. Monitor
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Check security logs

---

## 🔗 Useful Links

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL Backup](https://www.postgresql.org/docs/current/backup.html)

---

**آخر تحديث:** دليل إعداد الإنتاج ✅
