# 🚀 دليل نشر Wonderland على Render.com

## الحالة الحالية
✅ التطبيق يُبنى وينشر بنجاح على Render  
✅ جميع الخصائص الأساسية تعمل (المتاجر، المنتجات، الاستبيان)  
❌ Google OAuth معطل (يتطلب Google Client ID)  
✅ Cloudinary جاهز للعمل (بيانات البيانات معرّفة في render.yaml)

## المتغيرات المطلوبة

### 1. Google OAuth (اختياري حالياً)
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-secret>
```

**الحصول على Google Client ID:**
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
2. أنشئ مشروع جديد
3. اذهب إلى "Credentials"
4. اختر "OAuth 2.0 Client IDs"
5. اختر "Web application"
6. أضف `https://wonderland-f0vb.onrender.com` إلى Authorized redirect URIs
7. انسخ Client ID و Secret

### 2. Cloudinary (مُعرّف بالفعل)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=d416495193741984
CLOUDINARY_API_KEY=416495193741984
CLOUDINARY_API_SECRET=4mf7TZCqyzog2CsdNzA5d7R9st8
```

جميع بيانات Cloudinary موجودة في `render.yaml`

### 3. URL API
```
NEXT_PUBLIC_API_URL=https://wonderland-f0vb.onrender.com
```

## خطوات النشر

### الخطوة 1: تحديث متغيرات البيئة على Render

1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اختر مشروع **wonderland**
3. اذهب إلى **Environment** → **Environment Variables**
4. حدّث المتغيرات:

| المفتاح | القيمة | ملاحظات |
|--------|--------|--------|
| NEXT_PUBLIC_GOOGLE_CLIENT_ID | `<your-id>` | اختياري |
| GOOGLE_CLIENT_SECRET | `<your-secret>` | اختياري |
| NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME | `d416495193741984` | معرّف مسبقاً |
| CLOUDINARY_API_KEY | `416495193741984` | معرّف مسبقاً |
| CLOUDINARY_API_SECRET | `4mf7TZCqyzog2CsdNzA5d7R9st8` | معرّف مسبقاً |
| NEXT_PUBLIC_API_URL | `https://wonderland-f0vb.onrender.com` | معرّف مسبقاً |
| NODE_ENV | `production` | معرّف مسبقاً |
| NODE_VERSION | `22` | معرّف مسبقاً |

### الخطوة 2: إعادة النشر

1. انتظر حتى تظهر رسالة الإعادة
2. أو اذهب إلى **Deployments** وانقر **Redeploy** على أحدث نشر

## الخصائص المتاحة الآن

### ✅ تم تفعيلها
- 🛍️ عرض المنتجات
- 🎨 الفئات (غرف النوم، المطبخ، إلخ)
- 🛒 سلة التسوق
- 📋 استبيان (8 خطوات)
- 📤 رفع الصور إلى Cloudinary
- 🌙 وضع الليل/النهار
- 🌍 دعم اللغة العربية (RTL)
- 👤 تسجيل الدخول (بحساب محلي)
- 🏠 عرض 3D للغرف

### ⏳ قيد الانتظار (تحتاج Google Client ID)
- 🔐 تسجيل الدخول عبر Google
- 👤 إكمال الملف الشخصي

## استكشاف الأخطاء

### مشكلة: "Module not found: 'next-cloudinary'"
✅ **تم حلها:** أزلنا `next-cloudinary` واستخدمنا `cloudinary` SDK مباشرة

### مشكلة: "useSearchParams() should be wrapped in a suspense boundary"
✅ **تم حلها:** أضفنا Suspense boundary في `/complete-profile`

### مشكلة: Google Sign-In لا يعمل
🔧 **الحل:** أضف Google Client ID إلى متغيرات البيئة على Render

## الروابط المهمة

- **موقع التطبيق:** https://wonderland-f0vb.onrender.com
- **لوحة Render:** https://dashboard.render.com
- **مستودع GitHub:** https://github.com/ibraheemYG/wonderland
- **Google Cloud Console:** https://console.cloud.google.com
- **Cloudinary Dashboard:** https://cloudinary.com/console

## الخطوات التالية

1. ✅ الحصول على Google Client ID
2. ✅ إضافة Client ID إلى متغيرات البيئة على Render
3. ✅ اختبار Google Sign-In
4. ✅ ربط الصور المرفوعة بمعرض المنتجات
5. ✅ إضافة قدرة حذف الصور
6. ✅ تحسين الأداء والتخزين المؤقت

## 🔒 حل مشكلة Google OAuth على Render (Production)

### المشكلة:
```
✅ localhost:3000 - تسجيل الدخول يعمل
❌ Render/production - "تم حظر المحاولات" / Restricted Access
```

### الحل (4 خطوات):

#### 1️⃣ تفعيل Google+ API:
1. اذهب إلى: https://console.cloud.google.com/
2. اختر project: `project-1021477358452`
3. **APIs & Services** → **Library**
4. ابحث عن: `Google+ API` وفعّله (**Enable**)

#### 2️⃣ تحديث OAuth Consent Screen:
1. **APIs & Services** → **OAuth consent screen**
2. اختر: **External** (إذا لم تختره)
3. في **Authorized domains**:
   - اضغط: **Add domain**
   - أضف: `wonderland-app.onrender.com`
   - **Save and Continue**
4. تأكد من وجود scopes: `email`, `profile`, `openid`

#### 3️⃣ تحديث OAuth 2.0 Credentials:
1. **APIs & Services** → **Credentials**
2. اختر: **OAuth 2.0 Client ID**
3. اضغط: **Edit**
4. في **Authorized JavaScript origins** أضف:
   ```
   https://wonderland-app.onrender.com
   ```
5. في **Authorized redirect URIs** أضف:
   ```
   https://wonderland-app.onrender.com/complete-profile
   ```
6. **Save**

#### 4️⃣ تحديث Render Environment:
1. اذهب إلى: https://dashboard.render.com/
2. اختر: **wonderland**
3. **Environment** → تأكد من وجود:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=1021477358452-rl84k4sosoogajgttclflj15lltf5is5.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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
   NEXT_PUBLIC_API_URL=https://wonderland-app.onrender.com
   ```
4. **Save Changes** و **Deploy**

### ✅ بعد الإتمام:
- امسح الكاش: `Ctrl + Shift + Delete`
- جرّب على: `https://wonderland-app.onrender.com/login`
- يجب أن يعمل بدون "Restricted Access"

## الدعم

في حالة واجهت مشاكل:
1. تحقق من السجلات على Render (Logs tab)
2. تأكد من جميع متغيرات البيئة معرّفة بشكل صحيح
3. أعد نشر المشروع
4. امسح ذاكرة التخزين المؤقت للمتصفح (Ctrl+Shift+Del)
5. تأكد من تفعيل Google+ API و OAuth Consent Screen
