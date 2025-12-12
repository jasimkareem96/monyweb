# إصلاح خطأ next-auth vendor-chunks

## المشكلة
```
Error: Cannot find module './vendor-chunks/next-auth.js'
```

## الحل المطبق

### 1. حذف .next cache ✅
```powershell
Remove-Item -Recurse -Force .next
```

### 2. حذف node_modules cache ✅
```powershell
Remove-Item -Recurse -Force node_modules\.cache
```

### 3. إعادة تثبيت next-auth ✅
```powershell
npm uninstall next-auth
npm install next-auth@^4.24.5
```

### 4. إعادة تشغيل السيرفر ✅
```powershell
npm run dev
```

---

## إذا استمرت المشكلة

### الحل الشامل:
```powershell
# 1. حذف جميع ملفات البناء والـ cache
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.cache

# 2. حذف node_modules بالكامل
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 3. إعادة التثبيت
npm install

# 4. إعادة تشغيل
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

- هذا الخطأ يحدث عادة بسبب:
  - مشاكل في cache البناء
  - تلف في node_modules
  - مشاكل في webpack bundling

- بعد إعادة التثبيت، يجب أن يعمل السيرفر بشكل صحيح

---

## الخطوات التالية

1. انتظر حتى يكتمل البناء (ابحث عن `Ready` في Terminal)
2. افتح `http://localhost:3000`
3. إذا استمرت المشكلة، جرب الحل الشامل أعلاه
