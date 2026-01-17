'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { googleLogin, login } = useAuth();
  const router = useRouter();

  // Load Google Sign-In script
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cap = (window as any).Capacitor;
      setIsNativeApp(!!cap?.isNativePlatform?.());
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleReady(true);
      if (window.google && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        console.log('Initializing Google Sign-In with Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
          });
        } catch (initError) {
          console.error('Google Sign-In Initialization Error:', initError);
          setError('حدث خطأ أثناء تهيئة تسجيل الدخول عبر Google.');
        }
      } else {
        console.warn('Google GSI script loaded, but Client ID is missing or window.google is not available.');
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const ok = await login(username.trim(), password);
      if (ok) {
        router.push('/');
      } else {
        setError('بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      console.error('Password login error:', err);
      setError('فشل تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Google Sign-In button when ready
  useEffect(() => {
    if (googleReady && window.google) {
      const googleButtonDiv = document.getElementById('google-sign-in-button');
      if (googleButtonDiv && googleButtonDiv.childNodes.length === 0) {
        window.google.accounts.id.renderButton(
          document.getElementById('google-sign-in-button'),
          {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            locale: 'ar',
          }
        );
      }
    }
  }, [googleReady]);

  const handleGoogleSignIn = async (response: any) => {
    try {
      setIsLoading(true);
      setError('');

      if (response.credential) {
        // Decode JWT token to get user info
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const googleUser = JSON.parse(jsonPayload);

        // Create user object
        const userData = {
          id: Math.floor(Math.random() * 10000),
          username: googleUser.email?.split('@')[0] || 'google-user',
          name: googleUser.name || 'Google User',
          email: googleUser.email,
          role: 'user' as const,
          googleAuth: true,
        };

        // Login with Google
        googleLogin(userData);

        // Redirect to complete profile
        router.push(
          `/complete-profile?email=${encodeURIComponent(googleUser.email)}&name=${encodeURIComponent(googleUser.name)}`
        );
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('فشل تسجيل الدخول عبر Google');
    } finally {
      setIsLoading(false);
    }
  };

  // No username/password flow anymore

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-white/10">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-amber-400 to-orange-500 bg-clip-text text-transparent mb-3">✨ Wonderland</h1>
            <p className="text-foreground/60">تسجيل الدخول عبر Google</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="glass-subtle bg-red-500/10 border border-red-400/30 rounded-2xl p-4 mb-6 text-red-500 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Sign-In Options */}
          {!isNativeApp ? (
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
              <div className="glass-subtle rounded-2xl p-5 flex justify-center">
                <div id="google-sign-in-button" style={{ width: '100%' }}></div>
              </div>
            ) : (
              <div className="glass-subtle bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-4 text-yellow-600 dark:text-yellow-400 text-sm">
                لم يتم ضبط Google Client ID. الرجاء إضافة NEXT_PUBLIC_GOOGLE_CLIENT_ID إلى متغيرات البيئة.
              </div>
            )
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-foreground/70 mb-2">اسم المستخدم</label>
                <input
                  className="w-full glass-input rounded-xl px-4 py-3 text-foreground"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-foreground/70 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  className="w-full glass-input rounded-xl px-4 py-3 text-foreground"
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
              <p className="text-xs text-foreground/50 text-center">
                تسجيل Google لا يعمل داخل التطبيق، استخدم بيانات الدخول.
              </p>
            </form>
          )}

          {/* Help text */}
          <div className="text-center mt-8 text-foreground/50 text-sm">
            بالدخول عبر Google سيتم توجيهك لإكمال ملفك الشخصي.
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-foreground/50 hover:text-primary transition-colors">
            ← العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
