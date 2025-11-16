'use client';

import { useEffect, useState } from 'react';
import SurveyForm from '@/components/survey/SurveyForm';

export default function SurveySuggestion() {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // عرض الاقتراح بعد 60 ثانية
    const timer = setTimeout(() => {
      if (!dismissed) {
        setShowSuggestion(true);
      }
    }, 60000);

    return () => clearTimeout(timer);
  }, [dismissed]);

  if (dismissed || !showSuggestion) {
    return null;
  }

  if (showForm) {
    return <SurveyForm onClose={() => setDismissed(true)} />;
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 max-w-sm">
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-2xl p-4 border border-white/20">
        <div className="flex gap-3 items-start">
          <span className="text-2xl">🎁</span>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">هل تريد خصم 10%؟</h3>
            <p className="text-white/90 text-sm mb-3">أجب على استبيان سريع واحصل على خصم 10% على طلبك الأول</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="flex-1 px-3 py-2 bg-white hover:bg-white/90 text-amber-600 font-semibold rounded-lg transition text-sm"
              >
                نعم! ✓
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
