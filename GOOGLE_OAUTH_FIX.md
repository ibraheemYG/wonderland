# حل مشكلة Google OAuth 2.0 - origin_mismatch

## المشكلة
```
خطأ 400: origin_mismatch
"You can't sign in to this app because it doesn't comply with Google OAuth 2.0 policies"
```

## السبب
النطاق الذي تحاول الدخول منه لم يُضف إلى **Authorized JavaScript origins** في Google Cloud Console.

## الحل

### للتطوير المحلي (localhost):

1. اذهب إلى: https://console.cloud.google.com/
2. اختر project: `project-1021477358452`
3. اذهب إلى: **APIs & Services** → **Credentials**
4. ابحث عن OAuth 2.0 Client ID
5. اضغط Edit
6. أضف هذه النطاقات تحت **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost
   http://127.0.0.1:3000
   ```
7. أضف هذه النطاقات تحت **Authorized redirect URIs**:
   ```
   http://localhost:3000/complete-profile
   http://localhost/complete-profile
   ```
8. اضغط Save

### للإنتاج (Render):

1. اذهب إلى Google Cloud Console (نفس الخطوات أعلاه)
2. أضف هذه النطاقات تحت **Authorized JavaScript origins**:
   ```
   https://wonderland-app.onrender.com
   https://www.wonderland-app.onrender.com
   ```
3. أضف هذه النطاقات تحت **Authorized redirect URIs**:
   ```
   https://wonderland-app.onrender.com/complete-profile
   https://www.wonderland-app.onrender.com/complete-profile
   ```
4. اضغط Save

## تحقق من ClientID

تأكد من أن `NEXT_PUBLIC_GOOGLE_CLIENT_ID` الموجود لديك هو:
```
1021477358452-rl84k4sosoogajgttclflj15lltf5is5.apps.googleusercontent.com
```

## بعد إضافة النطاقات

1. امسح ذاكرة المتصفح (Cache) - Ctrl+Shift+Delete
2. جرّب تسجيل الدخول مجدداً
3. إذا استمرت المشكلة، تأكد من:
   - استخدام نفس النطاق الذي أضفته
   - أن الـ Client ID صحيح
   - أنك لم تستخدم VPN أو proxy

## ملاحظات مهمة

⚠️ **لا تخزن بيانات حساسة في متغيرات البيئة العامة (NEXT_PUBLIC_***)**
- فقط `NEXT_PUBLIC_GOOGLE_CLIENT_ID` يجب أن يكون عام
- `GOOGLE_CLIENT_SECRET` يجب أن يبقى خاص (في .env.local أو في Render Secret)

🔒 **الـ GOOGLE_CLIENT_SECRET يجب أن يكون في Render Secret Files، وليس في Environment Variables**

## إذا استمرت المشكلة

1. تأكد من أن Google Sign-In script يحمل بنجاح
2. افتح Developer Console (F12) وابحث عن أي أخطاء
3. تحقق من أن `window.google` مُعرّف عند الدخول
4. جرّب من متصفح مختلف (قد تكون مشكلة في الكاش)
