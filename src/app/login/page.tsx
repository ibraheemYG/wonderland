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
  const { googleLogin } = useAuth();
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Wonderland</h1>
            <p className="text-white/70">تسجيل الدخول عبر Google</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3 mb-6 text-red-100 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign-In Only */}
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
            <div className="bg-white rounded-lg p-4 flex justify-center">
              <div id="google-sign-in-button" style={{ width: '100%' }}></div>
            </div>
          ) : (
            <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-4 text-yellow-100 text-sm">
              لم يتم ضبط Google Client ID. الرجاء إضافة NEXT_PUBLIC_GOOGLE_CLIENT_ID إلى متغيرات البيئة.
            </div>
          )}

          {/* Help text */}
          <div className="text-center mt-6 text-white/60 text-sm">
            بالدخول عبر Google سيتم توجيهك لإكمال ملفك الشخصي.
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-white/60 hover:text-white transition">
            ← العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
