'use client';

import { useEffect, useState } from 'react';
import SurveyForm from '@/components/survey/SurveyForm';

export default function SurveySuggestion() {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // التحقق إذا تم رفض العرض مسبقاً
    const wasDismissed = localStorage.getItem('survey_dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // عرض الاقتراح بعد 90 ثانية
    const timer = setTimeout(() => {
      if (!dismissed) {
        setShowSuggestion(true);
      }
    }, 90000);

    return () => clearTimeout(timer);
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('survey_dismissed', 'true');
  };

  if (dismissed || !showSuggestion) {
    return null;
  }

  if (showForm) {
    return <SurveyForm onClose={handleDismiss} />;
  }

  return (
    <div 
      className={`fixed bottom-4 left-4 z-40 transition-all duration-500 ease-out ${
        isExpanded ? 'w-72' : 'w-auto'
      }`}
    >
      {!isExpanded ? (
        // الشكل المصغر - دائرة صغيرة أنيقة
        <button
          onClick={() => setIsExpanded(true)}
          className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <span className="text-lg">🎁</span>
          <span className="text-sm font-medium">خصم 10%</span>
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
        </button>
      ) : (
        // الشكل الموسع
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎁</span>
              <span className="text-white font-semibold text-sm">عرض خاص</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white/80 hover:text-white p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
              أجب على استبيان سريع واحصل على <span className="font-bold text-amber-600">خصم 10%</span> على طلبك الأول
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-lg transition-all text-sm"
              >
                ابدأ الآن
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm transition-colors"
              >
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
