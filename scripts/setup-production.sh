#!/bin/bash

# MonyWeb Production Setup Script
# هذا السكريبت يساعدك في إعداد Environment Variables للإنتاج

echo "🚀 MonyWeb Production Setup"
echo "=========================="
echo ""

# Check if .env.production exists
if [ -f ".env.production" ]; then
    echo "⚠️  .env.production موجود بالفعل"
    read -p "هل تريد استبداله؟ (y/n): " replace
    if [ "$replace" != "y" ]; then
        echo "تم الإلغاء"
        exit 0
    fi
fi

# Copy .env.example to .env.production
cp .env.example .env.production

echo "✅ تم إنشاء .env.production"
echo ""

# Generate NEXTAUTH_SECRET
echo "🔐 توليد NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "NEXTAUTH_SECRET المولّد: $NEXTAUTH_SECRET"
echo ""

# Update .env.production
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\"|g" .env.production
    sed -i '' "s|CSRF_SECRET=.*|CSRF_SECRET=\"$NEXTAUTH_SECRET\"|g" .env.production
else
    # Linux
    sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\"|g" .env.production
    sed -i "s|CSRF_SECRET=.*|CSRF_SECRET=\"$NEXTAUTH_SECRET\"|g" .env.production
fi

echo "📝 يرجى تحديث القيم التالية في .env.production:"
echo ""
echo "1. DATABASE_URL - رابط قاعدة بيانات PostgreSQL"
echo "2. NEXTAUTH_URL - رابط المنصة (مثال: https://yourdomain.com)"
echo "3. ALLOWED_ORIGINS - Domains المسموح بها"
echo ""
echo "✅ تم توليد NEXTAUTH_SECRET تلقائياً"
echo ""
echo "📋 الخطوات التالية:"
echo "1. افتح .env.production واملأ القيم المطلوبة"
echo "2. تأكد من أن .env.production في .gitignore"
echo "3. اربط قاعدة بيانات PostgreSQL"
echo "4. شغّل: npx prisma migrate deploy"
echo ""
