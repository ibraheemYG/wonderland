'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface SurveyResponse {
  _id: string;
  userId?: string;
  userName?: string;
  email: string;
  preferences?: {
    categories?: string[];
    styles?: string[];
    colors?: string[];
  };
  budget?: string;
  timeline?: string;
  additionalNotes?: string;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  'أرائك': '🛋️ أرائك',
  'أسرة': '🛏️ أسرة',
  'مطبخ': '🍳 مطبخ',
  'حمام': '🚿 حمام',
  'ديكور': '🖼️ ديكور',
  'أثاث': '🪑 أثاث',
  'أجهزة': '📺 أجهزة',
  'خصومات': '🏷️ خصومات',
};

const budgetLabels: Record<string, string> = {
  'أقل من 500': '💰 أقل من 500,000 د.ع',
  '500 - 1000': '💰 500,000 - 1,000,000 د.ع',
  '1000 - 2000': '💰💰 1,000,000 - 2,000,000 د.ع',
  '2000 - 5000': '💰💰💰 2,000,000 - 5,000,000 د.ع',
  'أكثر من 5000': '💰💰💰💰 أكثر من 5,000,000 د.ع',
};

export default function SurveysPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyResponse | null>(null);

  useEffect(() => {
    if (!user || !isAdmin()) {
      router.push('/login');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const response = await fetch('/api/survey');
      if (response.ok) {
        const result = await response.json();
        setResponses(result.data || []);
      } else {
        setResponses([]);
      }
    } catch (error) {
      console.error('Error loading surveys:', error);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاستبيان؟')) return;
    
    try {
      const response = await fetch(`/api/survey?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setResponses((prev) => prev.filter((item) => item._id !== id));
        setFeedback('✅ تم حذف الاستبيان!');
        setSelectedSurvey(null);
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback('❌ فشل الحذف');
      }
    } catch (error) {
      setFeedback('❌ خطأ في الحذف');
    }
  };

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">جاري تحميل الاستبيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">📋 استبيانات العملاء</h1>
            <p className="text-white/60 text-sm mt-1">
              إجمالي الاستبيانات: {responses.length} | 
              <span className="text-green-400 mr-2"> كل من أكمل استبيان يحصل على خصم 10%</span>
            </p>
          </div>
          <Link href="/admin/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm">
            ← لوحة التحكم
          </Link>
        </div>

        {feedback && (
          <div className={`mb-6 p-4 rounded-xl ${feedback.includes('✅') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {feedback}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Surveys List */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
              {responses.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="text-5xl mb-4 block">📋</span>
                  <p className="text-white/60">لا توجد استبيانات حتى الآن</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {responses.map((survey) => (
                    <button
                      key={survey._id}
                      onClick={() => setSelectedSurvey(survey)}
                      className={`w-full text-right p-4 hover:bg-white/5 transition ${
                        selectedSurvey?._id === survey._id ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                            {survey.userName?.[0] || survey.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{survey.userName || 'مستخدم'}</p>
                            <p className="text-white/50 text-sm">{survey.email}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs">
                          خصم 10%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex flex-wrap gap-1">
                          {survey.preferences?.categories?.slice(0, 3).map((cat, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white/10 rounded text-white/70 text-xs">
                              {cat}
                            </span>
                          ))}
                          {(survey.preferences?.categories?.length || 0) > 3 && (
                            <span className="text-white/50 text-xs">+{(survey.preferences?.categories?.length || 0) - 3}</span>
                          )}
                        </div>
                        <p className="text-white/40 text-xs">
                          {new Date(survey.createdAt).toLocaleDateString('ar-IQ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Survey Details */}
          <div className="lg:col-span-1">
            {selectedSurvey ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sticky top-24 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">تفاصيل الاستبيان</h2>
                  <button
                    onClick={() => handleDeleteSurvey(selectedSurvey._id)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition"
                  >
                    🗑️ حذف
                  </button>
                </div>

                {/* معلومات العميل */}
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                      {selectedSurvey.userName?.[0] || selectedSurvey.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{selectedSurvey.userName || 'مستخدم'}</p>
                      <p className="text-white/50 text-sm">{selectedSurvey.email}</p>
                    </div>
                  </div>
                  {selectedSurvey.userId && (
                    <p className="text-white/50 text-xs">
                      ID: {selectedSurvey.userId}
                    </p>
                  )}
                  <p className="text-white/50 text-xs">
                    📅 {new Date(selectedSurvey.createdAt).toLocaleString('ar-IQ')}
                  </p>
                </div>

                {/* التفضيلات */}
                {selectedSurvey.preferences?.categories && selectedSurvey.preferences.categories.length > 0 && (
                  <div>
                    <p className="text-white/60 text-sm mb-2">🛍️ الفئات المفضلة</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSurvey.preferences.categories.map((cat, i) => (
                        <span key={i} className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm">
                          {categoryLabels[cat] || cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* الميزانية */}
                {selectedSurvey.budget && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <p className="text-white/60 text-sm mb-1">💰 الميزانية</p>
                    <p className="text-yellow-400 font-bold">
                      {budgetLabels[selectedSurvey.budget] || selectedSurvey.budget}
                    </p>
                  </div>
                )}

                {/* ملاحظات */}
                {selectedSurvey.additionalNotes && (
                  <div>
                    <p className="text-white/60 text-sm mb-2">📝 ملاحظات</p>
                    <p className="text-white/80 text-sm bg-white/5 rounded-lg p-3">
                      {selectedSurvey.additionalNotes}
                    </p>
                  </div>
                )}

                {/* شارة الخصم */}
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                  <p className="text-green-400 font-bold text-lg">🎁 مستحق لخصم 10%</p>
                  <p className="text-green-400/70 text-sm">على أي طلب يقوم به</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
                <span className="text-5xl mb-4 block">👆</span>
                <p className="text-white/60">اختر استبياناً لعرض تفاصيله</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
