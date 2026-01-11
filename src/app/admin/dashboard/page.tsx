'use client';

import { useAuth } from '@/context/AuthContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const { analytics, getMostVisitedPages, getAverageSessionDuration } = useAnalytics();
  const router = useRouter();
  const [isSmall, setIsSmall] = useState(false);
  const [remoteStats, setRemoteStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // التحقق من أن المستخدم هو أدمن
  useEffect(() => {
    if (!isAuthLoading && (!user || !isAdmin())) {
      router.push('/login');
    }
  }, [user, isAdmin, router, isAuthLoading]);

  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    // fetch admin stats from server
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const json = await res.json();
          setRemoteStats(json.data);
        } else {
          setRemoteStats({ error: `Status ${res.status}` });
        }
      } catch (e) {
        setRemoteStats({ error: String(e) });
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, []);

  if (isAuthLoading || !user || !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-lg text-foreground/70">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  const mostVisitedPages = getMostVisitedPages();
  const avgDuration = getAverageSessionDuration();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">⚙️ لوحة التحكم</h1>
          <p className="text-foreground/60">أهلاً بك يا {user?.name || 'المستخدم'}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Visitors */}
          <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground/70 text-sm font-medium">إجمالي الزوار</h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-4xl font-bold text-foreground">{analytics.totalVisitors}</p>
            <p className="text-foreground/50 text-xs mt-2">منذ بدء التطبيق</p>
          </div>

          {/* Active Visitors */}
          <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground/70 text-sm font-medium">الزوار النشطين</h3>
              <span className="text-2xl">🟢</span>
            </div>
            <p className="text-4xl font-bold text-green-400">{analytics.activeVisitors}</p>
            <p className="text-foreground/50 text-xs mt-2">الآن</p>
          </div>

          {/* Total Page Views */}
          <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground/70 text-sm font-medium">إجمالي مرات التصفح</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-4xl font-bold text-foreground">
              {Object.values(analytics.pageViews).reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-foreground/50 text-xs mt-2">صفحات</p>
          </div>

          {/* Average Session Duration */}
          <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground/70 text-sm font-medium">متوسط الجلسة</h3>
              <span className="text-2xl">⏱️</span>
            </div>
            <p className="text-4xl font-bold text-foreground">{avgDuration}s</p>
            <p className="text-foreground/50 text-xs mt-2">ثانية</p>
          </div>
        </div>

        {/* Most Visited Pages */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">📈 الصفحات الأكثر زيارة</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {mostVisitedPages.length > 0 ? (
                mostVisitedPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 glass-subtle rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary">{index + 1}</span>
                      <span className="text-foreground/80">{page.page}</span>
                    </div>
                    <span className="text-foreground/60 text-sm font-semibold">{page.visits} زيارة</span>
                  </div>
                ))
              ) : (
                <p className="text-foreground/60 text-center py-6">لا توجد بيانات بعد</p>
              )}
            </div>
          </div>
          
          {/* Remote Stats */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">🔍 إحصائيات النظام (الخادم)</h2>
            {loadingStats ? (
              <p className="text-foreground/60">جارٍ جلب البيانات...</p>
            ) : !remoteStats ? (
              <p className="text-foreground/60">لا توجد بيانات</p>
            ) : remoteStats.error ? (
              <pre className="text-red-400 text-sm">{JSON.stringify(remoteStats.error)}</pre>
            ) : (
              <div className="space-y-3 text-sm text-foreground/80">
                <div>
                  <strong>MongoDB:</strong>
                  {remoteStats.mongo?.stats ? (
                    <div className="mt-2 text-xs text-foreground/70">
                      <div>قاعدة البيانات: {remoteStats.mongo.dbName}</div>
                      <div>حجم (bytes): {remoteStats.mongo.stats.storageSize}</div>
                      <div>عدد الـ collections: {Object.keys(remoteStats.counts || {}).length}</div>
                      <div>مجموع الوثائق (تقريبي): {String(Object.values(remoteStats.counts || {}).reduce((a: any,b: any)=> typeof a === 'number' && typeof b === 'number' ? a + b : a, 0))}</div>
                    </div>
                  ) : (
                    <div className="text-foreground/60">لا توجد معلومات عن MongoDB</div>
                  )}
                </div>

                <div>
                  <strong>Cloudinary:</strong>
                  <div className="mt-2 text-xs text-foreground/70">
                    {remoteStats.cloudinary?.available === false ? (
                      <div>Cloudinary غير مُعدّ</div>
                    ) : remoteStats.cloudinary?.error ? (
                      <pre className="text-red-400">{JSON.stringify(remoteStats.cloudinary)}</pre>
                    ) : (
                      <div>{JSON.stringify(remoteStats.cloudinary).slice(0, 400)}{String(remoteStats.cloudinary).length > 400 ? '…' : ''}</div>
                    )}
                  </div>
                </div>

                <div>
                  <strong>Render:</strong>
                  <div className="mt-2 text-xs text-foreground/70">
                    {remoteStats.render?.available === false ? (
                      <div>Render API key غير مُعدّ</div>
                    ) : remoteStats.render?.error ? (
                      <pre className="text-red-400">{JSON.stringify(remoteStats.render)}</pre>
                    ) : (
                      <div className="space-y-1">
                        <div>خدمات: {remoteStats.render.services?.length || 0}</div>
                        {remoteStats.render.services?.slice(0,3).map((s: any, idx: number) => (
                          <div key={idx} className="text-xs text-foreground/60">
                            • {s.name} — آخر نشر: {s.recentDeploy?.createdAt || 'غير متوفر'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">⚡ الإجراءات السريعة</h2>
            {!isSmall ? (
              <div className="space-y-3">
                <Link href="/admin/users" className="block w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition font-semibold text-center shadow-lg shadow-blue-500/30">
                  👥 إدارة المستخدمين
                </Link>
                <Link href="/admin/surveys" className="block w-full p-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white rounded-xl transition font-semibold text-center shadow-lg shadow-purple-500/30">
                  📋 إدارة الاستبيانات
                </Link>
                <Link href="/admin/products" className="block w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition font-semibold text-center shadow-lg shadow-green-500/30">
                  🛍️ إدارة المنتجات
                </Link>
                <Link href="/admin/admins" className="block w-full p-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl transition font-semibold text-center shadow-lg shadow-red-500/30">
                  🔐 إدارة الأدمن
                </Link>
                <Link href="/admin/reports" className="block w-full p-4 bg-gradient-to-r from-primary to-amber-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl transition font-semibold text-center shadow-lg shadow-primary/30">
                  📊 تقارير المبيعات
                </Link>
                <Link href="/admin/coupons" className="block w-full p-4 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white rounded-xl transition font-semibold text-center shadow-lg shadow-pink-500/30">
                  🎫 إدارة الكوبونات
                </Link>
              </div>
            ) : (
              <div>
                <label className="block text-foreground/70 mb-2">القائمة</label>
                <select
                  className="w-full p-3 rounded-xl glass-input text-foreground"
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
                  <option value="/admin/reports">📊 تقارير المبيعات</option>
                  <option value="/admin/coupons">🎫 إدارة الكوبونات</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className="glass-card rounded-2xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">📥 تصدير البيانات</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <a
              href="/api/admin/export?type=orders"
              download
              className="flex items-center justify-center gap-2 p-4 glass-subtle bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl transition"
            >
              <span>📦</span>
              <span>تصدير الطلبات</span>
            </a>
            <a
              href="/api/admin/export?type=products"
              download
              className="flex items-center justify-center gap-2 p-4 glass-subtle bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl transition"
            >
              <span>🛍️</span>
              <span>تصدير المنتجات</span>
            </a>
            <a
              href="/api/admin/export?type=inventory"
              download
              className="flex items-center justify-center gap-2 p-4 glass-subtle bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-xl transition"
            >
              <span>📊</span>
              <span>تقرير المخزون</span>
            </a>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-foreground/60 hover:text-foreground transition">
            ← العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
