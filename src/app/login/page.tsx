'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

declare global {
  interface Window {
    google?: any;
    Capacitor?: any;
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

  // Check if running in native app
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cap = window.Capacitor;
      const isNative = !!cap?.isNativePlatform?.();
      setIsNativeApp(isNative);
      console.log('Is Native App:', isNative);
    }
  }, []);

  // Load Google Sign-In script (for web only)
  useEffect(() => {
    if (isNativeApp) return; // Don't load GSI in native app

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
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isNativeApp]);

  // Native Google Sign-In using Capacitor plugin
  const handleNativeGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
      
      // Initialize GoogleAuth
      await GoogleAuth.initialize({
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });

      const result = await GoogleAuth.signIn();
      console.log('Native Google Sign-In result:', result);

      if (result && result.email) {
        const userData = {
          id: Math.floor(Math.random() * 10000),
          username: result.email.split('@')[0] || 'google-user',
          name: result.name || result.givenName || 'Google User',
          email: result.email,
          role: 'user' as const,
          googleAuth: true,
        };

        googleLogin(userData);
        router.push(`/complete-profile?email=${encodeURIComponent(result.email)}&name=${encodeURIComponent(userData.name)}`);
      }
    } catch (err: any) {
      console.error('Native Google Sign-In error:', err);
      if (err?.message?.includes('canceled') || err?.message?.includes('cancelled')) {
        setError('تم إلغاء تسجيل الدخول');
      } else {
        setError('فشل تسجيل الدخول عبر Google: ' + (err?.message || 'خطأ غير معروف'));
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="space-y-4">
              {/* Native Google Sign-In Button */}
              <button
                onClick={handleNativeGoogleSignIn}
                disabled={isLoading}
                className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-foreground font-medium">
                  {isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول بـ Google'}
                </span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-foreground/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-foreground/50">أو</span>
                </div>
              </div>

              {/* Password Login Form */}
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground/70 mb-2">اسم المستخدم</label>
                  <input
                    className="w-full glass-input rounded-xl px-4 py-3 text-foreground"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
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
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !username || !password}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
                </button>
              </form>
            </div>
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
