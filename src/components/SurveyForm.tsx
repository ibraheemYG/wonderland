'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface SurveyFormProps {
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

export default function SurveyForm({ onClose, onSubmit }: SurveyFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    budget: '',
    preferences: [] as string[],
  });

  const budgets = ['أقل من 500', '500 - 1000', '1000 - 2000', '2000 - 5000', 'أكثر من 5000'];
  const preferences = ['أرائك', 'أسرة', 'مطبخ', 'حمام', 'ديكور', 'أثاث', 'أجهزة', 'خصومات'];

  const handlePreferenceToggle = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter(p => p !== pref)
        : [...prev.preferences, pref]
    }));
  };

  const handleSubmit = () => {
    if (step === 1 && formData.budget) {
      setStep(2);
    } else if (step === 2 && formData.preferences.length > 0) {
      const surveyData = {
        ...formData,
        timestamp: Date.now(),
      };

      // حفظ في localStorage
      const responses = JSON.parse(localStorage.getItem('survey_responses') || '[]');
      responses.push(surveyData);
      localStorage.setItem('survey_responses', JSON.stringify(responses));

      if (onSubmit) {
        onSubmit(surveyData);
      }

      alert('✅ شكراً لك! حصلت على خصم 10% على طلبك الأول 🎉');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/20 rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">📋 استبيان سريع</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 1 ? (
            <>
              {/* Personal Info */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">الاسم</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  placeholder="اسمك"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  placeholder="بريدك@example.com"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">الميزانية (د.ع)</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="">اختر الميزانية</option>
                  {budgets.map(budget => (
                    <option key={budget} value={budget}>{budget}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!formData.budget}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white rounded-lg transition font-semibold"
              >
                التالي ({step}/2)
              </button>
            </>
          ) : (
            <>
              <p className="text-white/70">ما هي تفضيلاتك؟ (اختر واحد أو أكثر)</p>
              <div className="grid grid-cols-2 gap-2">
                {preferences.map(pref => (
                  <button
                    key={pref}
                    onClick={() => handlePreferenceToggle(pref)}
                    className={`p-2 rounded-lg transition text-sm font-medium ${
                      formData.preferences.includes(pref)
                        ? 'bg-blue-600 text-white border border-blue-400'
                        : 'bg-white/10 text-white/70 border border-white/20 hover:border-white/40'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-semibold border border-white/20"
                >
                  رجوع
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={formData.preferences.length === 0}
                  className="flex-1 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:opacity-50 text-white rounded-lg transition font-semibold"
                >
                  إرسال ✓
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
