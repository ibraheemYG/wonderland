# ✅ خطوات إصلاح خطأ Google OAuth 2.0

## 🔴 الخطأ الذي تحصل عليه:
```
Error 400: origin_mismatch
"You can't sign in to this app because it doesn't comply with Google OAuth 2.0 policies"
```

---

## ✅ الحل الكامل

### 📍 الخطوة 1: افتح Google Cloud Console

1. اذهب إلى: **https://console.cloud.google.com**
2. تسجيل الدخول بحسابك
3. اختر project: **project-1021477358452**

---

### 📍 الخطوة 2: اذهب إلى Credentials

1. من القائمة الجانبية → **APIs & Services**
2. اختر: **Credentials**
3. ابحث عن: **OAuth 2.0 Client ID** (يجب أن يكون واحد)
4. اضغط على الـ ID لفتحه

---

### 📍 الخطوة 3: أضف Authorized JavaScript origins

في نافذة التعديل، ستجد قسم: **Authorized JavaScript origins**

**أضف هذه النطاقات:**

للتطوير المحلي:
```
http://localhost:3000
http://localhost
http://127.0.0.1:3000
```

للإنتاج على Render:
```
https://wonderland-app.onrender.com
https://www.wonderland-app.onrender.com
```

---

### 📍 الخطوة 4: أضف Authorized redirect URIs

في نفس النافذة، ستجد قسم: **Authorized redirect URIs**

**أضف هذه النطاقات:**

للتطوير المحلي:
```
http://localhost:3000/complete-profile
http://localhost/complete-profile
http://127.0.0.1:3000/complete-profile
```

للإنتاج على Render:
```
https://wonderland-app.onrender.com/complete-profile
https://www.wonderland-app.onrender.com/complete-profile
```

---

### 📍 الخطوة 5: حفظ التغييرات

1. اضغط الزر الأزرق: **Save** أو **Update**
2. انتظر رسالة التأكيد
3. اغلق النافذة

---

### 📍 الخطوة 6: امسح الكاش واختبر

1. افتح المتصفح
2. اضغط: **Ctrl + Shift + Delete** (Windows) أو **Cmd + Shift + Delete** (Mac)
3. اختر "All time" أو "Everything"
4. اضغط: **Clear browsing data**
5. اذهب إلى: **http://localhost:3000/login**
6. حاول تسجيل الدخول مجدداً

---

## 🔍 تحقق من البيانات

تأكد من أن لديك:

✅ **Client ID الصحيح:**
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1021477358452-rl84k4sosoogajgttclflj15lltf5is5.apps.googleusercontent.com
```

✅ **Client Secret:**
```
GOOGLE_CLIENT_SECRET=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
```

✅ **في ملف .env.local**

---

## 🐛 إذا استمرت المشكلة

### جرّب هذا:

1. **افتح Developer Tools (F12)**
2. اذهب إلى التبويب: **Console**
3. ابحث عن أي أخطاء تحتوي على "google" أو "oauth"
4. اطلب مساعدة مع رسالة الخطأ الكاملة

---

## 📝 ملاحظات مهمة

⚠️ **النطاقات يجب أن تطابق بالضبط:**
- إذا استخدمت `http://localhost:3000`، يجب أن تضيفها مثلاً بالضبط
- إذا استخدمت `http://localhost`، يجب أن تضيفها مثلاً بالضبط
- النطاقات حساسة للنقاط والشرطات والبروتوكول

🔒 **أمان:**
- لا تشارك `GOOGLE_CLIENT_SECRET` مع أحد
- لا تضعه في الـ public code
- في Render، استخدم Secret Files وليس Environment

---

## 🚀 بعد الإصلاح

يجب أن تكون قادراً على:
1. الدخول إلى صفحة Login
2. رؤية زر Google Sign-In
3. الضغط عليه والدخول بحسابك
4. إعادة التوجيه إلى صفحة Complete Profile

---

## 💡 نصيحة إضافية

إذا تريد اختبار على Render:

1. اذهب إلى Render dashboard
2. اختر project: wonderland
3. اذهب إلى **Environment**
4. تأكد من وجود هذه المتغيرات:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=1021477358452-...
   GOOGLE_CLIENT_SECRET=GOCSPX-...
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyfbk8xc5
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
5. اضغط Deploy

---

## ✅ التحقق النهائي

بعد إتمام كل الخطوات، يمكنك التحقق من أن كل شيء يعمل:

```bash
# اختبر على localhost
http://localhost:3000/login

# اختبر على Render (بعد الـ deploy)
https://wonderland-app.onrender.com/login
```

كلا النطاقين يجب أن يعملا بدون مشاكل oauth.
