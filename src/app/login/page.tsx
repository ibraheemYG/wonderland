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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const { login, googleLogin } = useAuth();
  const router = useRouter();

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleReady(true);
      if (window.google && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        router.push('/');
      } else {
        setError('بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Wonderland</h1>
            <p className="text-white/70">تسجيل الدخول</p>
          </div>

          {/* Demo Credentials Info */}
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-4 mb-6 text-sm text-blue-100">
            <p className="font-semibold mb-2">🔐 بيانات تجريبية:</p>
            <p>Admin: admin / admin123</p>
            <p>User: user / user123</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3 mb-6 text-red-100 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'جاري التسجيل...' : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Divider */}
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <>
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 border-t border-white/20"></div>
                <span className="text-white/60 text-sm">أو</span>
                <div className="flex-1 border-t border-white/20"></div>
              </div>

              {/* Google Sign-In Button */}
              <div className="bg-white rounded-lg p-4 flex justify-center">
                <div id="google-sign-in-button" style={{ width: '100%' }}></div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="text-center mt-6 text-white/60 text-sm">
            <p>
              هذا تطبيق تجريبي
              <br />
              استخدم البيانات أعلاه للدخول
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-white/60 hover:text-white transition"
          >
            ← العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
