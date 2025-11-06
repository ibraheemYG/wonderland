# إعداد Google OAuth

## خطوات الإعداد

### 1. إنشاء Google Cloud Project
1. انتقل إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد باسم "Wonderland"
3. انتقل إلى القائمة → APIs & Services → Credentials

### 2. إنشاء OAuth 2.0 Credentials
1. انقر على "Create Credentials" → "OAuth client ID"
2. اختر "Web application"
3. أضف URIs المصرح بها:
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (للتطوير)
     - `https://wonderland.onrender.com` (للإنتاج)
   
   - **Authorized redirect URIs:**
     - `http://localhost:3000/complete-profile` (للتطوير)
     - `https://wonderland.onrender.com/complete-profile` (للإنتاج)

### 3. حفظ بيانات الاعتماد
1. انسخ `Client ID`
2. ضعه في ملف `.env.local`:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

### 4. التثبيت والتطوير
```bash
# تثبيت المكتبات
npm install

# تشغيل سيرفر التطوير
npm run dev

# الذهاب إلى http://localhost:3000/login
```

## خصائص نظام Google OAuth

✅ **تسجيل دخول آمن** - استخدام توكنات JWT
✅ **إكمال البيانات** - صفحة متقدمة لإكمال البيانات الشخصية
✅ **تخزين محلي** - حفظ البيانات في localStorage
✅ **دعم عربي كامل** - واجهة عربية بالكامل
✅ **تصميم عصري** - تدرجات وتأثيرات حديثة

## عملية تسجيل الدخول

1. المستخدم يضغط على زر "Google Sign-In"
2. يتم التوثيق عبر Google OAuth
3. يتم فك تشفير توكن JWT للحصول على بيانات المستخدم
4. إعادة توجيه المستخدم إلى صفحة إكمال البيانات
5. إكمال البيانات الإضافية (الدولة، الهاتف، الاهتمامات)
6. حفظ البيانات في localStorage
7. إعادة توجيه إلى الرئيسية

## معلومات المستخدم المخزنة

```typescript
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  furniturePreferences?: string[];
  role: 'admin' | 'user';
  googleAuth: boolean;
}
```

## حل المشاكل

### مشكلة: "Invalid Client ID"
- تأكد من نسخ Client ID الصحيح من Google Cloud Console
- تحقق من أن `.env.local` يحتوي على القيمة الصحيحة

### مشكلة: "Redirect URI mismatch"
- أضف الـ URI الصحيح في Google Cloud Console
- تأكد من أن الـ localhost أو الـ domain في browser يطابق الـ registered URI

### مشكلة: لا يعمل الزر
- تأكد من تحميل سكريبت Google: `https://accounts.google.com/gsi/client`
- افتح Developer Console وتحقق من الأخطاء

## الملفات المعنية

- `src/app/login/page.tsx` - صفحة تسجيل الدخول مع زر Google
- `src/app/complete-profile/page.tsx` - صفحة إكمال البيانات
- `src/app/api/auth/google/route.ts` - API endpoint للتحقق من التوكن
- `src/context/AuthContext.tsx` - إدارة المصادقة والجلسات
- `.env.local` - متغيرات البيئة

