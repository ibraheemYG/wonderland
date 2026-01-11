'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currency';
import { TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, Users, Calendar, Download } from 'lucide-react';

interface SalesData {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  salesByDay: { date: string; sales: number; orders: number }[];
  salesByCategory: { category: string; sales: number; count: number }[];
  topProducts: { name: string; sales: number; quantity: number }[];
  recentOrders: { orderNumber: string; total: number; status: string; date: string }[];
  salesGrowth: number;
}

const categoryLabels: Record<string, string> = {
  'living-room': 'غرف المعيشة',
  'bedroom': 'غرف النوم',
  'kitchen': 'المطابخ',
  'bathroom': 'الحمامات',
  'decor': 'الديكور',
  'appliances': 'الأجهزة',
  'sale': 'عروض خاصة',
  'furnishings': 'المفروشات',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'قيد الانتظار', color: 'text-yellow-400' },
  confirmed: { label: 'تم التأكيد', color: 'text-blue-400' },
  processing: { label: 'قيد التجهيز', color: 'text-purple-400' },
  shipped: { label: 'تم الشحن', color: 'text-cyan-400' },
  delivered: { label: 'تم التوصيل', color: 'text-green-400' },
  cancelled: { label: 'ملغي', color: 'text-red-400' },
};

export default function ReportsPage() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (!isAuthLoading && (!user || !isAdmin())) {
      router.push('/login');
    }
  }, [user, isAdmin, isAuthLoading, router]);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?period=${period}`);
      if (res.ok) {
        const result = await res.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const maxSales = data?.salesByDay ? Math.max(...data.salesByDay.map(d => d.sales), 1) : 1;
  const maxCategorySales = data?.salesByCategory ? Math.max(...data.salesByCategory.map(c => c.sales), 1) : 1;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              📊 تقارير المبيعات
            </h1>
            <p className="text-white/60 mt-2">تحليل شامل لأداء المتجر</p>
          </div>
          <Link href="/admin/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm">
            ← لوحة التحكم
          </Link>
        </div>

        {/* فلتر الفترة */}
        <div className="flex gap-2 mb-8">
          {[
            { value: 'week', label: 'آخر أسبوع' },
            { value: 'month', label: 'آخر شهر' },
            { value: 'year', label: 'آخر سنة' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value as 'week' | 'month' | 'year')}
              className={`px-4 py-2 rounded-lg transition ${
                period === p.value
                  ? 'bg-primary text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white/10 rounded-2xl h-32" />
            ))}
          </div>
        ) : data ? (
          <>
            {/* الإحصائيات الرئيسية */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<DollarSign className="w-6 h-6" />}
                label="إجمالي المبيعات"
                value={formatCurrency(data.totalSales)}
                change={data.salesGrowth}
                color="green"
              />
              <StatCard
                icon={<ShoppingCart className="w-6 h-6" />}
                label="عدد الطلبات"
                value={data.totalOrders.toString()}
                color="blue"
              />
              <StatCard
                icon={<Package className="w-6 h-6" />}
                label="متوسط قيمة الطلب"
                value={formatCurrency(data.averageOrderValue)}
                color="purple"
              />
              <StatCard
                icon={<Users className="w-6 h-6" />}
                label="العملاء"
                value={data.totalCustomers.toString()}
                color="orange"
              />
            </div>

            {/* الرسم البياني للمبيعات اليومية */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                المبيعات اليومية
              </h2>
              <div className="h-64 flex items-end gap-2">
                {data.salesByDay.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative group">
                      <div
                        className="w-full bg-primary/80 rounded-t-lg transition-all hover:bg-primary cursor-pointer"
                        style={{ height: `${(day.sales / maxSales) * 200}px`, minHeight: '4px' }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <p className="font-bold">{formatCurrency(day.sales)}</p>
                        <p className="text-white/60">{day.orders} طلبات</p>
                      </div>
                    </div>
                    <span className="text-white/50 text-xs transform -rotate-45 origin-top">
                      {new Date(day.date).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* المبيعات حسب الفئة */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">📦 المبيعات حسب الفئة</h2>
                <div className="space-y-4">
                  {data.salesByCategory.map((cat, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-white">{categoryLabels[cat.category] || cat.category}</span>
                        <span className="text-primary font-bold">{formatCurrency(cat.sales)}</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all"
                          style={{ width: `${(cat.sales / maxCategorySales) * 100}%` }}
                        />
                      </div>
                      <p className="text-white/50 text-xs mt-1">{cat.count} منتج مباع</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* أفضل المنتجات مبيعاً */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">🏆 أفضل المنتجات مبيعاً</h2>
                <div className="space-y-3">
                  {data.topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-white/5 rounded-xl"
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-gray-400 text-gray-900' :
                        index === 2 ? 'bg-amber-700 text-amber-100' :
                        'bg-white/10 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-white font-medium line-clamp-1">{product.name}</p>
                        <p className="text-white/50 text-sm">{product.quantity} قطعة</p>
                      </div>
                      <span className="text-primary font-bold">{formatCurrency(product.sales)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* آخر الطلبات */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">🕐 آخر الطلبات</h2>
                <Link
                  href="/admin/orders"
                  className="text-primary hover:underline text-sm"
                >
                  عرض الكل ←
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-white/60 text-sm border-b border-white/10">
                      <th className="text-right py-3 px-4">رقم الطلب</th>
                      <th className="text-right py-3 px-4">التاريخ</th>
                      <th className="text-right py-3 px-4">المبلغ</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white font-mono">#{order.orderNumber}</td>
                        <td className="py-3 px-4 text-white/70">
                          {new Date(order.date).toLocaleDateString('ar-IQ')}
                        </td>
                        <td className="py-3 px-4 text-primary font-bold">{formatCurrency(order.total)}</td>
                        <td className="py-3 px-4">
                          <span className={statusLabels[order.status]?.color || 'text-white'}>
                            {statusLabels[order.status]?.label || order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60">لا توجد بيانات متاحة</p>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: number;
  color: 'green' | 'blue' | 'purple' | 'orange';
}) {
  const colors = {
    green: 'from-green-500/20 to-green-500/5 border-green-500/30',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
  };

  const iconColors = {
    green: 'text-green-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-md border rounded-2xl p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-white/10 ${iconColors[color]}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-white/60 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
