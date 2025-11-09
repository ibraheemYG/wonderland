'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SurveyResponse {
  name: string;
  email: string;
  preferences: string[];
  budget: string;
  timestamp: number;
}

export default function SurveysPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!user || !isAdmin())) {
      router.push('/login');
    }
  }, [user, isAdmin, router, mounted]);

  useEffect(() => {
    if (mounted && isAdmin()) {
      const stored = localStorage.getItem('survey_responses');
      console.log('📋 Loading surveys...');
      console.log('Stored survey data:', stored);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log('✅ Surveys loaded:', parsed);
          setResponses(parsed);
        } catch (error) {
          console.error('❌ Failed to parse surveys:', error);
          setResponses([]);
        }
      } else {
        console.log('⚠️ No surveys found in localStorage');
        setResponses([]);
      }
    }
  }, [mounted, isAdmin]);

  if (!mounted || !user || !isAdmin()) {
    return null;
  }

  const downloadCSV = () => {
    const headers = ['الاسم', 'البريد الإلكتروني', 'الميزانية', 'التفضيلات', 'التاريخ'];
    const data = responses.map(r => [
      r.name,
      r.email,
      r.budget,
      r.preferences.join('، '),
      new Date(r.timestamp).toLocaleDateString('ar-SA'),
    ]);

    let csv = headers.join(',') + '\n';
    data.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'surveys.csv';
    link.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📋 إدارة الاستبيانات</h1>
            <p className="text-white/60">عدد الإجابات: {responses.length}</p>
          </div>
          <button
            onClick={downloadCSV}
            disabled={responses.length === 0}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold"
          >
            📥 تحميل CSV
          </button>
        </div>

        {/* Responses Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-right text-white font-semibold">الاسم</th>
                  <th className="px-6 py-4 text-right text-white font-semibold">البريد الإلكتروني</th>
                  <th className="px-6 py-4 text-right text-white font-semibold">الميزانية</th>
                  <th className="px-6 py-4 text-right text-white font-semibold">التفضيلات</th>
                  <th className="px-6 py-4 text-right text-white font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {responses.length > 0 ? (
                  responses.map((r, index) => (
                    <tr key={index} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-white/80">{r.name}</td>
                      <td className="px-6 py-4 text-white/80">{r.email}</td>
                      <td className="px-6 py-4 text-white/80">{r.budget}</td>
                      <td className="px-6 py-4 text-white/80 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {r.preferences.map((pref, i) => (
                            <span key={i} className="bg-blue-500/30 text-blue-200 px-2 py-1 rounded text-xs">
                              {pref}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm">
                        {new Date(r.timestamp).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/60">
                      لا توجد إجابات بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link href="/admin/dashboard" className="text-white/60 hover:text-white transition">
            ← العودة إلى لوحة التحكم
          </Link>
        </div>
      </div>
    </main>
  );
}
