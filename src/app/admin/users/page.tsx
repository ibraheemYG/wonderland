'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserSurvey {
  preferences?: {
    categories?: string[];
    styles?: string[];
    colors?: string[];
  };
  budget?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  role: 'user' | 'admin';
  survey?: UserSurvey | null;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  'أرائك': '🛋️',
  'أسرة': '🛏️',
  'مطبخ': '🍳',
  'حمام': '🚿',
  'ديكور': '🖼️',
  'أثاث': '🪑',
  'أجهزة': '📺',
  'خصومات': '🏷️',
};

export default function UsersPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (!user || !isAdmin()) {
      router.push('/login');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const downloadCSV = () => {
    const headers = ['الاسم', 'البريد الإلكتروني', 'الدور', 'رقم الهاتف', 'الاستبيان', 'تاريخ التسجيل'];
    const data = users.map(u => [
      u.name || '-',
      u.email || '-',
      u.role === 'admin' ? 'أدمن' : 'مستخدم',
      u.phone || '-',
      u.survey ? 'نعم ✅' : 'لا',
      new Date(u.createdAt).toLocaleDateString('ar-IQ'),
    ]);

    let csv = headers.join(',') + '\n';
    data.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'users.csv';
    link.click();
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
          <p className="text-white/70">جاري تحميل المستخدمين...</p>
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
            <h1 className="text-2xl font-bold text-white">👥 إدارة المستخدمين</h1>
            <p className="text-white/60 text-sm mt-1">
              إجمالي المستخدمين: {users.length} | 
              <span className="text-green-400 mr-2"> أكملوا الاستبيان: {users.filter(u => u.survey).length}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm"
            >
              📥 تحميل CSV
            </button>
            <Link href="/admin/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm">
              ← لوحة التحكم
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
              {users.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="text-5xl mb-4 block">👥</span>
                  <p className="text-white/60">لا توجد مستخدمين حتى الآن</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {users.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full text-right p-4 hover:bg-white/5 transition ${
                        selectedUser?._id === u._id ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                            {u.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-white font-medium">{u.name || 'بدون اسم'}</p>
                            <p className="text-white/50 text-sm">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {u.survey && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs">
                              استبيان ✅
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-lg text-xs ${
                            u.role === 'admin' 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {u.role === 'admin' ? 'أدمن' : 'مستخدم'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex flex-wrap gap-1">
                          {u.survey?.preferences?.categories?.slice(0, 4).map((cat, i) => (
                            <span key={i} className="text-lg" title={cat}>
                              {categoryLabels[cat] || '📦'}
                            </span>
                          ))}
                        </div>
                        <p className="text-white/40 text-xs">
                          {new Date(u.createdAt).toLocaleDateString('ar-IQ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="lg:col-span-1">
            {selectedUser ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sticky top-24 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">تفاصيل المستخدم</h2>
                  <button
                    onClick={() => handleDeleteUser(selectedUser._id)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition"
                  >
                    🗑️ حذف
                  </button>
                </div>

                {/* معلومات المستخدم */}
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                      {selectedUser.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-white font-medium text-lg">{selectedUser.name}</p>
                      <p className="text-white/50 text-sm">{selectedUser.email}</p>
                    </div>
                  </div>
                  {selectedUser.phone && (
                    <p className="text-white/70 text-sm">📞 {selectedUser.phone}</p>
                  )}
                  {selectedUser.country && (
                    <p className="text-white/70 text-sm">🌍 {selectedUser.country}</p>
                  )}
                  <p className="text-white/50 text-xs">
                    📅 انضم: {new Date(selectedUser.createdAt).toLocaleString('ar-IQ')}
                  </p>
                </div>

                {/* الاستبيان */}
                {selectedUser.survey ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-3">
                    <p className="text-green-400 font-bold">🎁 أكمل الاستبيان - خصم 10%</p>
                    
                    {selectedUser.survey.preferences?.categories && selectedUser.survey.preferences.categories.length > 0 && (
                      <div>
                        <p className="text-white/60 text-xs mb-1">الفئات المفضلة:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedUser.survey.preferences.categories.map((cat, i) => (
                            <span key={i} className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                              {categoryLabels[cat] || ''} {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedUser.survey.budget && (
                      <div>
                        <p className="text-white/60 text-xs mb-1">الميزانية:</p>
                        <p className="text-yellow-400 text-sm">💰 {selectedUser.survey.budget}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <p className="text-white/50">لم يكمل الاستبيان بعد</p>
                  </div>
                )}

                {/* أزرار */}
                <div className="flex gap-2 pt-2">
                  {selectedUser.phone && (
                    <a
                      href={`tel:${selectedUser.phone}`}
                      className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-center text-sm hover:bg-green-500/30 transition"
                    >
                      📞 اتصال
                    </a>
                  )}
                  <a
                    href={`mailto:${selectedUser.email}`}
                    className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-center text-sm hover:bg-blue-500/30 transition"
                  >
                    ✉️ بريد
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
                <span className="text-5xl mb-4 block">👆</span>
                <p className="text-white/60">اختر مستخدماً لعرض تفاصيله</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
