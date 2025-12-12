# إصلاح خطأ NextAuth Module

## المشكلة
```
Error: Cannot find module './vendor-chunks/next-auth.js'
```

## الحلول المطبقة

### 1. حذف .next folder ✅
```powershell
Remove-Item -Recurse -Force .next
```

### 2. حذف node_modules/.cache ✅
```powershell
Remove-Item -Recurse -Force node_modules\.cache
```

### 3. إعادة تشغيل السيرفر ✅
```powershell
npm run dev
```

---

## إذا استمرت المشكلة

### الحل 1: إعادة تثبيت next-auth
```powershell
npm uninstall next-auth
npm install next-auth@^4.24.5
```

### الحل 2: حذف node_modules بالكامل وإعادة التثبيت
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### الحل 3: تنظيف شامل
```powershell
# حذف جميع ملفات البناء والـ cache
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# إعادة التثبيت
npm install

# إعادة تشغيل
npm run dev
```

---

## التحقق من التثبيت

```powershell
npm list next-auth
```

يجب أن يظهر:
```
`-- next-auth@4.24.13
```

---

## ملاحظات

- هذا الخطأ عادة ما يحدث بسبب مشاكل في cache البناء
- حذف `.next` folder عادة ما يحل المشكلة
- إذا استمرت المشكلة، قد تحتاج لإعادة تثبيت node_modules
