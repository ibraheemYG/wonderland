'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SURVEY_QUESTIONS } from '@/data/survey';

export default function SurveyPage() {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: '',
    furnitureType: [] as string[],
    purchaseFrequency: '',
    onlinePurchase: '',
    onlinePurchaseReason: '',
    mainConcern: '',
    preferredDelivery: '',
    preferredPayment: '',
    installmentInterest: [] as string[],
    appWishlist: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 9;

  // التعامل مع حقول Checkbox
  const handleCheckboxChange = (field: string, value: string) => {
    setFormData((prev) => {
      const currentArray = prev[field as keyof typeof formData] as string[];
      if (currentArray.includes(value)) {
        return {
          ...prev,
          [field]: currentArray.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          [field]: [...currentArray, value],
        };
      }
    });
  };

  // التعامل مع حقول Radio و Select
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // التعامل مع Textarea
  const handleTextareaChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // إرسال الاستبانة
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('✅ شكراً لك! تم استقبال استبانتك بنجاح');
        setFormData({
          email: user?.email || '',
          username: '',
          furnitureType: [],
          purchaseFrequency: '',
          onlinePurchase: '',
          onlinePurchaseReason: '',
          mainConcern: '',
          preferredDelivery: '',
          preferredPayment: '',
          installmentInterest: [],
          appWishlist: '',
        });
        setCurrentStep(1);
        // إعادة توجيه بعد ثانيتين
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setErrorMessage(data.message || 'حدث خطأ أثناء إرسال الاستبانة');
      }
    } catch (error) {
      setErrorMessage('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى');
      console.error('Survey submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">📋 استبانة العملاء</h1>
          <p className="text-white/70 text-lg">
            مرحباً بك! نحن نقدر آرائك كثيراً
          </p>
          <p className="text-white/50 text-sm mt-2">
            ساعدنا على تحسين خدمتنا من خلال إجابتك على بعض الأسئلة
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/70 text-sm">السؤال {currentStep} من {totalSteps}</span>
            <span className="text-white/70 text-sm">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-400 rounded-lg text-green-100">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400 rounded-lg text-red-100">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question 0: البريد الإلكتروني واسم المستخدم */}
          {currentStep === 1 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-6">
                  📧 بيانات التواصل
                </h2>
              </div>
              
              {user?.email ? (
                <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-4">
                  <p className="text-white/70 text-sm mb-2">البريد الإلكتروني المسجل:</p>
                  <p className="text-white font-semibold">{user.email}</p>
                  <p className="text-white/50 text-xs mt-2">سيتم استخدام هذا البريد في استجابتك</p>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">اسم المستخدم (اختياري)</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="اسمك أو لقبك"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          )}

          {/* Question 1: نوع الأثاث */}
          {currentStep === 3 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">
                1️⃣ ما نوع الأثاث الذي تشتريه عادة؟
              </h2>
              <div className="space-y-3">
                {SURVEY_QUESTIONS.furnitureType.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.furnitureType.includes(option)}
                      onChange={() => handleCheckboxChange('furnitureType', option)}
                      className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                    />
                    <span className="text-white ml-3">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Question 2: تكرار الشراء */}
          {currentStep === 3 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">
                2️⃣ كم مرة تشتري أثاث جديد في السنة؟
              </h2>
              <div className="space-y-3">
                {SURVEY_QUESTIONS.purchaseFrequency.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition"
                  >
                    <input
                      type="radio"
                      name="purchaseFrequency"
                      value={option}
                      checked={formData.purchaseFrequency === option}
                      onChange={() => handleInputChange('purchaseFrequency', option)}
                      className="w-5 h-5 text-blue-600 cursor-pointer"
                    />
                    <span className="text-white ml-3">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Question 3: الشراء أونلاين */}
          {currentStep === 5 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">
                3️⃣ هل سبق أن اشتريت أثاث عبر الإنترنت؟
              </h2>
              <div className="space-y-3">
                {SURVEY_QUESTIONS.onlinePurchase.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition"
                  >
                    <input
                      type="radio"
                      name="onlinePurchase"
                      value={option}
                      checked={formData.onlinePurchase === option}
                      onChange={() => handleInputChange('onlinePurchase', option)}
                      className="w-5 h-5 text-blue-600 cursor-pointer"
                    />
                    <span className="text-white ml-3">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Question 4: السبب (إذا كانت الإجابة لا) */}
          {currentStep === 5 && formData.onlinePurchase === 'لا' && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">
                4️⃣ لماذا لم تشتر أثاث عبر الإنترنت؟
              </h2>
              <textarea
                value={formData.onlinePurchaseReason}
                onChange={(e) => handleTextareaChange('onlinePurchaseReason', e.target.value)}
                placeholder="شارك أسبابك معنا..."
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                rows={5}
              />
            </div>
          )}

          {/* Question 5: أكثر قلق */}
          {(currentStep === 5 && formData.onlinePurchase === 'نعم') || currentStep === 6 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">
                5️⃣ ما أكثر شيء يقلقك عند الشراء أونلاين؟
              </h2>
              <select
                value={formData.mainConcern}
                onChange={(e) => handleInputChange('mainConcern', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">اختر قلقك الأساسي...</option>
                {SURVEY_QUESTIONS.mainConcern.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Question 6: التوصيل */}
          {currentStep === 7 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">
                6️⃣ ما الطريقة المفضلة للتوصيل؟
              </h2>
              <div className="space-y-3">
                {SURVEY_QUESTIONS.preferredDelivery.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition"
                  >
                    <input
                      type="radio"
                      name="preferredDelivery"
                      value={option}
                      checked={formData.preferredDelivery === option}
                      onChange={() => handleInputChange('preferredDelivery', option)}
                      className="w-5 h-5 text-blue-600 cursor-pointer"
                    />
                    <span className="text-white ml-3">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Question 7: الدفع والتقسيط */}
          {currentStep === 8 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">
                  7️⃣ ما الطريقة المفضلة للدفع؟
                </h3>
                <div className="space-y-3">
                  {SURVEY_QUESTIONS.preferredPayment.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition"
                    >
                      <input
                        type="radio"
                        name="preferredPayment"
                        value={option}
                        checked={formData.preferredPayment === option}
                        onChange={() => handleInputChange('preferredPayment', option)}
                        className="w-5 h-5 text-blue-600 cursor-pointer"
                      />
                      <span className="text-white ml-3">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/20 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  هل ترغب بميزة التقسيط أو الحجز المسبق؟
                </h3>
                <div className="space-y-3">
                  {SURVEY_QUESTIONS.installmentInterest.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={formData.installmentInterest.includes(option)}
                        onChange={() => handleCheckboxChange('installmentInterest', option)}
                        className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                      />
                      <span className="text-white ml-3">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Question 8: الأمنيات */}
          {currentStep === 9 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">
                8️⃣ ما الذي تتمنى وجوده في تطبيق بيع الأثاث؟
              </h2>
              <textarea
                value={formData.appWishlist}
                onChange={(e) => handleTextareaChange('appWishlist', e.target.value)}
                placeholder="أخبرنا عن أحلامك وتوقعاتك..."
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                rows={6}
              />
              <p className="text-white/50 text-sm mt-3">
                ⚠️ هذا السؤال الأخير - شكراً على وقتك!
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition border border-white/20"
            >
              ← السابق
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition font-semibold"
              >
                التالي →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold"
              >
                {isSubmitting ? 'جاري الإرسال...' : '✅ إرسال الاستبانة'}
              </button>
            )}
          </div>
        </form>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-white/60 hover:text-white transition">
            ← العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
