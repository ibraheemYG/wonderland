'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SurveyResponse {
  _id: string;
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

export default function SurveysPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const response = await fetch('/api/survey');
      if (response.ok) {
        const result = await response.json();
        setResponses(result.data || []);
        console.log('✅ Surveys loaded from MongoDB:', result.data?.length || 0);
      } else {
        console.error('Failed to fetch surveys');
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
    try {
      const response = await fetch(`/api/survey?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setResponses((prev) => prev.filter((item) => item._id !== id));
        setFeedback('تم حذف الاستبانة!');
      } else {
        setFeedback('فشل الحذف');
      }
    } catch (error) {
      setFeedback('خطأ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📋 الاستبيانات</h1>
          <p className="text-white/60">عدد الاستبانات: {responses.length}</p>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 text-green-200 text-sm">
            {feedback}
          </div>
        )}

        {/* Responses */}
        <div className="space-y-4">
          {responses.length > 0 ? (
            responses.map((r) => (
              <div
                key={r._id}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white font-semibold">{r.email}</p>
                    <p className="text-white/60 text-sm">
                      {new Date(r.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSurvey(r._id)}
                    className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded hover:bg-red-500/30 transition"
                  >
                    حذف
                  </button>
                </div>

                {r.preferences && (
                  <div className="space-y-2 text-sm">
                    {r.preferences.categories && r.preferences.categories.length > 0 && (
                      <p className="text-white/80">
                        <span className="font-semibold">الفئات:</span> {r.preferences.categories.join(', ')}
                      </p>
                    )}
                    {r.preferences.styles && r.preferences.styles.length > 0 && (
                      <p className="text-white/80">
                        <span className="font-semibold">الأنماط:</span> {r.preferences.styles.join(', ')}
                      </p>
                    )}
                    {r.preferences.colors && r.preferences.colors.length > 0 && (
                      <p className="text-white/80">
                        <span className="font-semibold">الألوان:</span> {r.preferences.colors.join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {r.budget && (
                  <p className="text-sm text-white/80 mt-2">
                    <span className="font-semibold">الميزانية:</span> {r.budget}
                  </p>
                )}

                {r.additionalNotes && (
                  <p className="text-sm text-white/80 mt-2">
                    <span className="font-semibold">ملاحظات:</span> {r.additionalNotes}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-white/60">
              لا توجد استبانات بعد
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.back()}
            className="text-white/60 hover:text-white transition"
          >
            ← العودة
          </button>
        </div>
      </div>
    </main>
  );
}
