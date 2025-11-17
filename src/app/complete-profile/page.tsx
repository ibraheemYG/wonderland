
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, googleLogin } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    furniturePreferences: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const furnitureOptions = [
    'غرفة معيشة',
    'غرفة نوم',
    'مطبخ',
    'حمام',
    'مكتب',
    'ديكور',
  ];

  const countries = [
    'السعودية',
    'الإمارات',
    'مصر',
    'الأردن',
    'الكويت',
    'قطر',
    'البحرين',
    'عمان',
  ];

  useEffect(() => {
    // Get user data from Google OAuth callback
    const googleEmail = searchParams.get('email');
    const googleName = searchParams.get('name');
    
    if (googleEmail && googleName) {
      setFormData((prev) => ({
        ...prev,
        email: googleEmail,
        name: googleName,
      }));
    }

    // Redirect if already logged in (including users who came from Google OAuth)
    if (user) {
      router.push('/');
    }
  }, [user, router, searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (option: string) => {
    setFormData((prev) => {
      const preferences = prev.furniturePreferences;
      if (preferences.includes(option)) {
        return {
          ...prev,
          furniturePreferences: preferences.filter((p) => p !== option),
        };
      } else {
        return {
          ...prev,
          furniturePreferences: [...preferences, option],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.country) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create user session
      const userData = {
        id: Math.floor(Math.random() * 10000),
        username: formData.email.split('@')[0],
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        furniturePreferences: formData.furniturePreferences,
        role: 'user' as const,
        googleAuth: true,
      };

      // Call googleLogin function
      googleLogin(userData);

      // Redirect to home
      router.push('/');
    } catch (error) {
      setErrorMessage('حدث خطأ في إكمال البيانات');
      console.error('Profile completion error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">👤 إكمال البيانات الشخصية</h1>
          <p className="text-white/70">ساعدنا بمعلومات إضافية لتحسين تجربتك</p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400 rounded-lg text-red-100">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg">
            <label className="block text-white font-semibold mb-2">الاسم الكامل *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="أدخل اسمك الكامل"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Email */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg">
            <label className="block text-white font-semibold mb-2">البريد الإلكتروني *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="أدخل بريدك الإلكتروني"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Phone */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg">
            <label className="block text-white font-semibold mb-2">رقم الهاتف</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="أدخل رقم هاتفك (اختياري)"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Country */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg">
            <label className="block text-white font-semibold mb-2">الدولة *</label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">اختر دولتك...</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Furniture Preferences */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg">
            <label className="block text-white font-semibold mb-4">🏠 اهتماماتك في الأثاث (اختياري)</label>
            <div className="space-y-3">
              {furnitureOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={formData.furniturePreferences.includes(option)}
                    onChange={() => handleCheckboxChange(option)}
                    className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                  />
                  <span className="text-white ml-3">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold"
            >
              {isSubmitting ? '⏳ جاري الحفظ...' : '✅ إكمال التسجيل'}
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition border border-white/20 text-center"
            >
              الرئيسية
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function CompleteProfePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <CompleteProfileContent />
    </Suspense>
  );
}
