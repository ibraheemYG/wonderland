# نظام تسجيل الدخول المدمج مع Google OAuth

## نظرة عامة
تم دمج نظام تسجيل دخول متقدم يجمع بين:
- ✅ تسجيل دخول تقليدي (اسم مستخدم/كلمة مرور)
- ✅ تسجيل دخول عبر Google OAuth
- ✅ صفحة إكمال البيانات الشخصية
- ✅ تخزين محلي للجلسات

## معمارية النظام

### 1. صفحة تسجيل الدخول (`/login`)
```
User Interface (React Component)
├── Traditional Login Form
│   ├── Username Input
│   ├── Password Input
│   └── Submit Button
│
├── Google Sign-In Button
│   └── Google OAuth 2.0 Flow
│
└── Navigation
    └── Back to Home
```

**الملف:** `src/app/login/page.tsx`

**المميزات:**
- واجهة ثنائية اللغة (عربي/إنجليزي)
- تصميم عصري مع تدرجات
- زر Google مع تحميل سكريبت GSI
- معالجة الأخطاء

### 2. صفحة إكمال البيانات (`/complete-profile`)
```
Profile Completion Flow
├── User Information
│   ├── Full Name (Required)
│   ├── Email (Required)
│   ├── Phone (Optional)
│   └── Country (Required)
│
└── Preferences
    ├── Furniture Categories (Optional)
    └── Additional Interests
```

**الملف:** `src/app/complete-profile/page.tsx`

**المميزات:**
- استقبال بيانات من Google OAuth
- نموذج متقدم بتحقق من البيانات
- تخزين البيانات في localStorage
- إعادة توجيه للرئيسية بعد الحفظ

### 3. API Endpoint (`/api/auth/google`)
```
Google OAuth Flow
├── Token Verification
│   └── JWT Decoding
│
├── User Data Extraction
│   ├── Name
│   ├── Email
│   └── Picture (Optional)
│
└── Session Creation
    └── Store in localStorage
```

**الملف:** `src/app/api/auth/google/route.ts`

**الدوال:**
- `POST`: التحقق من توكن Google
- `GET`: الحصول على Google Client ID

### 4. Authentication Context (`AuthContext`)
```
State Management
├── User State
│   ├── User ID
│   ├── Username
│   ├── Name
│   ├── Email
│   ├── Role (admin/user)
│   └── Google Auth Flag
│
├── Functions
│   ├── login(): تسجيل دخول تقليدي
│   ├── googleLogin(): تسجيل دخول Google
│   ├── logout(): خروج
│   └── isAdmin(): فحص الإدارة
│
└── Persistence
    └── localStorage: "currentUser"
```

**الملف:** `src/context/AuthContext.tsx`

**الواجهة:**
```typescript
interface User {
  id: number;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  furniturePreferences?: string[];
  role: 'admin' | 'user';
  googleAuth?: boolean;
}
```

## عملية تسجيل الدخول عبر Google

### الخطوات التفصيلية:

```
1. المستخدم يفتح صفحة /login
   ↓
2. يتم تحميل Google Sign-In JavaScript SDK
   ↓
3. يتم تهيئة Google Sign-In Button
   ↓
4. المستخدم يضغط على الزر
   ↓
5. يفتح نافذة منبثقة من Google
   ↓
6. المستخدم يسجل دخول Google
   ↓
7. يرسل Google توكن JWT
   ↓
8. يتم فك تشفير الـ JWT للحصول على:
   - name
   - email
   - picture
   ↓
9. إعادة توجيه إلى /complete-profile
   ↓
10. المستخدم يملأ البيانات الإضافية:
    - الهاتف
    - الدولة
    - الاهتمامات بالأثاث
    ↓
11. حفظ البيانات في localStorage
    ↓
12. إعادة توجيه إلى الرئيسية /
```

## متغيرات البيئة

### المطلوبة:
```env
# Google OAuth Credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### الملف:
- الملف: `.env.local`
- لا تنسَ إضافة `.env.local` إلى `.gitignore`

## المكتبات المستخدمة

```json
{
  "dependencies": {
    "@react-oauth/google": "^0.12.1",
    "google-auth-library": "^9.0.0",
    "next": "16.0.1",
    "react": "19.2.0",
    "react-dom": "19.2.0"
  }
}
```

## التكامل مع Google Cloud

### إعداد Google Cloud Project

1. **الخطوة 1: الذهاب إلى Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **الخطوة 2: إنشاء مشروع جديد**
   - Project Name: "Wonderland"
   - Location: (أي منطقة)

3. **الخطوة 3: تفعيل Google+ API**
   - الذهاب إلى APIs & Services
   - انقر على "Enable APIs and Services"
   - ابحث عن "Google+ API"
   - انقر "Enable"

4. **الخطوة 4: إنشاء OAuth 2.0 Credentials**
   - الذهاب إلى Credentials
   - انقر "Create Credentials"
   - اختر "OAuth client ID"
   - نوع التطبيق: "Web application"

5. **الخطوة 5: إضافة Authorized URIs**
   - JavaScript origins:
     ```
     http://localhost:3000
     https://wonderland.onrender.com
     ```
   - Redirect URIs:
     ```
     http://localhost:3000/complete-profile
     https://wonderland.onrender.com/complete-profile
     ```

6. **الخطوة 6: نسخ Client ID**
   - انسخ `Client ID`
   - ضعه في `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
   ```

## تسلسل الملفات المعدلة

### ملفات جديدة:
- ✨ `src/app/complete-profile/page.tsx` - صفحة إكمال البيانات
- ✨ `src/app/api/auth/google/route.ts` - API endpoint للـ Google OAuth
- ✨ `.env.local` - متغيرات البيئة
- ✨ `GOOGLE_AUTH_SETUP.md` - دليل الإعداد

### ملفات معدلة:
- 🔧 `src/app/login/page.tsx` - إضافة زر Google
- 🔧 `src/context/AuthContext.tsx` - إضافة `googleLogin` function
- 🔧 `package.json` - إضافة مكتبات Google OAuth

## أمان النظام

### أفضل الممارسات المطبقة:

1. **Token Security**
   - فك تشفير JWT محلياً في المتصفح
   - عدم إرسال التوكن إلى السيرفر دون الحاجة

2. **Data Storage**
   - تخزين البيانات في localStorage فقط (عميل)
   - لا تخزين بيانات حساسة

3. **Environment Variables**
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - آمن للعميل
   - `GOOGLE_CLIENT_SECRET` - للسيرفر فقط (غير مستخدم حالياً)

4. **CORS & CSP**
   - تحميل Google SDK من source موثوق
   - تحديد authenticated URIs في Google Cloud

## الاختبار

### اختبار على المحلي:

```bash
# تثبيت المكتبات
npm install

# إضافة Google Client ID في .env.local
echo "NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_ID" >> .env.local

# تشغيل السيرفر
npm run dev

# الذهاب إلى http://localhost:3000/login
```

### خطوات الاختبار:

1. **اختبار التسجيل التقليدي:**
   ```
   Username: admin
   Password: admin123
   ```

2. **اختبار Google OAuth:**
   - انقر على زر Google
   - سجل دخول بحساب Google
   - تحقق من البيانات الظاهرة
   - أكمل النموذج الإضافي
   - تحقق من localStorage

## Deployment

### Render.com

```yaml
# render.yaml
services:
  - type: web
    name: wonderland
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NEXT_PUBLIC_GOOGLE_CLIENT_ID
        value: YOUR_CLIENT_ID
      - key: GOOGLE_CLIENT_SECRET
        value: YOUR_SECRET
```

## استكشاف الأخطاء

### مشكلة: "Invalid Client ID"
**الحل:**
- تحقق من نسخ Client ID الصحيح
- تأكد من أن `.env.local` يحتوي على القيمة

### مشكلة: "Redirect URI mismatch"
**الحل:**
- أضف الـ URI في Google Cloud Console
- تأكد من المطابقة الدقيقة

### مشكلة: الزر لا يظهر
**الحل:**
- افتح Developer Console
- تحقق من تحميل Google SDK
- تأكد من `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### مشكلة: البيانات لا تُحفظ
**الحل:**
- افتح DevTools → Application → localStorage
- تحقق من وجود `currentUser`
- تحقق من صحة البيانات

## المزايا المستقبلية المقترحة

- [ ] Social Login (Facebook, GitHub)
- [ ] Two-Factor Authentication
- [ ] User Profile Dashboard
- [ ] Admin Panel للمستخدمين
- [ ] Data Backup & Sync
- [ ] Advanced Analytics

