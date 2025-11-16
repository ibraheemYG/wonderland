'use client';

import { useAuth } from '@/context/AuthContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const { analytics, getMostVisitedPages, getAverageSessionDuration } = useAnalytics();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // التحقق من أن المستخدم هو أدمن
  useEffect(() => {
    if (mounted && (!user || !isAdmin())) {
      router.push('/login');
    }
  }, [user, isAdmin, router, mounted]);

  if (!mounted || !user || !isAdmin()) {
    return null;
  }

  const mostVisitedPages = getMostVisitedPages();
  const avgDuration = getAverageSessionDuration();
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">⚙️ لوحة التحكم</h1>
          <p className="text-white/60">أهلاً بك يا {user.name}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Visitors */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg hover:border-white/40 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/70 text-sm font-medium">إجمالي الزوار</h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-4xl font-bold text-white">{analytics.totalVisitors}</p>
            <p className="text-white/50 text-xs mt-2">منذ بدء التطبيق</p>
          </div>

          {/* Active Visitors */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg hover:border-white/40 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/70 text-sm font-medium">الزوار النشطين</h3>
              <span className="text-2xl">🟢</span>
            </div>
            <p className="text-4xl font-bold text-green-400">{analytics.activeVisitors}</p>
            <p className="text-white/50 text-xs mt-2">الآن</p>
          </div>

          {/* Total Page Views */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg hover:border-white/40 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/70 text-sm font-medium">إجمالي مرات التصفح</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-4xl font-bold text-white">
              {Object.values(analytics.pageViews).reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-white/50 text-xs mt-2">صفحات</p>
          </div>

          {/* Average Session Duration */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg hover:border-white/40 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/70 text-sm font-medium">متوسط الجلسة</h3>
              <span className="text-2xl">⏱️</span>
            </div>
            <p className="text-4xl font-bold text-white">{avgDuration}s</p>
            <p className="text-white/50 text-xs mt-2">ثانية</p>
          </div>
        </div>

        {/* Most Visited Pages */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">📈 الصفحات الأكثر زيارة</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {mostVisitedPages.length > 0 ? (
                mostVisitedPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-blue-400">{index + 1}</span>
                      <span className="text-white/80">{page.page}</span>
                    </div>
                    <span className="text-white/60 text-sm font-semibold">{page.visits} زيارة</span>
                  </div>
                ))
              ) : (
                <p className="text-white/60 text-center py-6">لا توجد بيانات بعد</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">⚡ الإجراءات السريعة</h2>
            {!isSmall ? (
              <div className="space-y-3">
                <Link href="/admin/users" className="block w-full p-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition font-semibold text-center">
                  👥 إدارة المستخدمين
                </Link>
                <Link href="/admin/surveys" className="block w-full p-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg transition font-semibold text-center">
                  📋 إدارة الاستبيانات
                </Link>
                <Link href="/admin/products" className="block w-full p-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg transition font-semibold text-center">
                  🛍️ إدارة المنتجات
                </Link>
                <Link href="/admin/admins" className="block w-full p-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition font-semibold text-center">
                  🔐 إدارة الأدمن
                </Link>
              </div>
            ) : (
              <div>
                <label className="block text-white/70 mb-2">القائمة</label>
                <select
                  className="w-full p-3 rounded-lg bg-background border border-white/20 text-white"
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) router.push(v);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>اختر إجراء</option>
                  <option value="/admin/users">👥 إدارة المستخدمين</option>
                  <option value="/admin/surveys">📋 إدارة الاستبيانات</option>
                  <option value="/admin/products">🛍️ إدارة المنتجات</option>
                  <option value="/admin/admins">🔐 إدارة الأدمن</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-white/60 hover:text-white transition">
            ← العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
