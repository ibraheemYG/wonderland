# 🔧 دليل استكشاف أخطاء Google OAuth

## 🚨 الأخطاء الشائعة والحلول

### ❌ الخطأ 1: `Error 400: origin_mismatch`

**الرسالة:**
```
You can't sign in to this app because it doesn't comply with Google OAuth 2.0 policies
```

**السبب:**
النطاق الذي تحاول الدخول منه لم يُضف إلى `Authorized JavaScript origins`

**الحل:**
1. اذهب إلى: **Google Cloud Console** → **Credentials** → **OAuth 2.0 Client ID**
2. اضغط: **Edit**
3. أضف النطاق الحالي إلى **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://wonderland-app.onrender.com`
4. اضغط: **Save**

---

### ❌ الخطأ 2: `Restricted Access` (على Render فقط)

**الرسالة:**
```
تم حظر المحاولات
Access to this page has been restricted
```

**السبب:**
Google يحظر الدخول من الـ production لأن:
- Domain غير معترف به في OAuth Consent Screen
- Google+ API غير مفعّل
- OAuth app في مرحلة تطوير

**الحل الكامل:**

#### الخطوة 1: فعّل Google+ API
```
Google Cloud Console
→ APIs & Services
→ Library
→ ابحث عن "Google+ API"
→ اضغط "Enable"
```

#### الخطوة 2: أضف Domain إلى OAuth Consent Screen
```
Google Cloud Console
→ APIs & Services
→ OAuth consent screen
→ Authorized domains
→ Add domain: wonderland-app.onrender.com
→ Save and Continue
```

#### الخطوة 3: تحديث Credentials
```
Google Cloud Console
→ APIs & Services
→ Credentials
→ OAuth 2.0 Client ID
→ Edit
→ Authorized JavaScript origins: https://wonderland-app.onrender.com
→ Authorized redirect URIs: https://wonderland-app.onrender.com/complete-profile
→ Save
```

#### الخطوة 4: تحديث Render Environment
```
Render Dashboard
→ wonderland project
→ Environment
→ NEXT_PUBLIC_GOOGLE_CLIENT_ID: (تأكد من وجوده)
→ GOOGLE_CLIENT_SECRET: (تأكد من وجوده)
→ Save Changes
→ Deploy
```

---

### ❌ الخطأ 3: `Cannot read properties of undefined`

**الرسالة:**
```
Cannot read properties of undefined (reading 'id')
```

**السبب:**
`window.google` لم يتحمل أو لم يُهيّأ بشكل صحيح

**الحل:**
1. افتح **F12** (Developer Tools)
2. اذهب إلى **Console**
3. تحقق من وجود أي أخطاء
4. تأكد من تحميل script:
   ```
   https://accounts.google.com/gsi/client
   ```
5. امسح الكاش: `Ctrl + Shift + Delete`

---

### ❌ الخطأ 4: `Invalid Client ID`

**الرسالة:**
```
Invalid Client ID
```

**السبب:**
Client ID غير صحيح أو غير معرّف

**الحل:**
1. تأكد من أن `NEXT_PUBLIC_GOOGLE_CLIENT_ID` موجود في:
   - `.env.local` (للتطوير)
   - Render Environment Variables (للإنتاج)
2. تأكد من أنه:
   ```
   1021477358452-rl84k4sosoogajgttclflj15lltf5is5.apps.googleusercontent.com
   ```
3. أعد تحميل الصفحة بعد التحديث

---

## ✅ قائمة التحقق:

قبل تسجيل الدخول، تأكد من:

- [ ] **Google+ API** مفعّل في Google Cloud Console
- [ ] **OAuth Consent Screen** موجود و **Domain معترف به**
- [ ] **Authorized JavaScript origins** تضم النطاق الحالي
- [ ] **Authorized redirect URIs** تضم `/complete-profile`
- [ ] **NEXT_PUBLIC_GOOGLE_CLIENT_ID** موجود و صحيح
- [ ] **GOOGLE_CLIENT_SECRET** موجود و صحيح
- [ ] **Render Environment** محدّثة و app معاد نشره
- [ ] **الكاش ممسوح** (Ctrl+Shift+Delete)

---

## 🔍 طرق التشخيص:

### 1. افتح Developer Console (F12):
```javascript
// تحقق من وجود Google API
console.log(window.google);

// تحقق من Client ID
console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

// ابحث عن أي أخطاء في Console
```

### 2. تحقق من Render Logs:
```
Render Dashboard
→ wonderland
→ Logs
→ ابحث عن أي أخطاء
```

### 3. استخدم OAuth Troubleshooter:
```
https://console.cloud.google.com/apis/credentials/oauthclient
```

---

## 📝 قائمة المراجعة النهائية:

| العنصر | ✅/❌ | ملاحظات |
|-------|-----|---------|
| Google+ API مفعّل | | |
| OAuth Consent Screen موجود | | |
| Domain: wonderland-app.onrender.com معترف | | |
| Client ID صحيح | | |
| Client Secret موجود | | |
| Credentials محدّثة | | |
| Render Environment محدّثة | | |
| App معاد نشره | | |
| الكاش ممسوح | | |

---

## 🆘 إذا استمرت المشكلة:

1. **تأكد من أن كل شيء صحيح أعلاه**
2. **جرّب على متصفح مختلف**
3. **جرّب في Incognito mode**
4. **انتظر 5-10 دقائق** (Google قد يأخذ وقتاً لتحديث الإعدادات)
5. **أعد نشر التطبيق** على Render
6. **تواصل مع دعم Google**: https://support.google.com/

---

## 📚 روابط مهمة:

- [Google Cloud Console](https://console.cloud.google.com)
- [Render Dashboard](https://dashboard.render.com)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google OAuth Troubleshooter](https://console.cloud.google.com/apis/credentials/oauthclient)
