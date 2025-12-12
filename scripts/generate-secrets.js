#!/usr/bin/env node

/**
 * Generate secure secrets for production
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto')

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64')
}

console.log('🔐 MonyWeb - Secret Generator')
console.log('==============================\n')

console.log('NEXTAUTH_SECRET:')
console.log(generateSecret(32))
console.log('')

console.log('CSRF_SECRET:')
console.log(generateSecret(32))
console.log('')

console.log('✅ تم توليد الأسرار بنجاح')
console.log('⚠️  احفظ هذه الأسرار في مكان آمن ولا تشاركها!')
