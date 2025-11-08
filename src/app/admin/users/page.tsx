'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UsersPage() {
  const { user, isAdmin, getAllUsers } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
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
      setUsers(getAllUsers());
    }
  }, [mounted, isAdmin, getAllUsers]);

  if (!mounted || !user || !isAdmin()) {
    return null;
  }

  const downloadCSV = () => {
    const headers = ['الاسم', 'البريد الإلكتروني', 'الدور', 'رقم الهاتف', 'الدولة'];
    const data = users.map(u => [
      u.name || '-',
      u.email || '-',
      u.role === 'admin' ? 'أدمن' : 'مستخدم',
      u.phone || '-',
      u.country || '-',
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">👥 إدارة المستخدمين</h1>
            <p className="text-white/60">إجمالي المستخدمين: {users.length}</p>
          </div>
          <button
            onClick={downloadCSV}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
          >
            📥 تحميل CSV
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-right text-white font-semibold">الاسم</th>
                  <th className="px-6 py-4 text-right text-white font-semibold">البريد الإلكتروني</th>
                  <th className="px-6 py-4 text-right text-white font-semibold">الدور</th>
                  <th className="px-6 py-4 text-right text-white font-semibold">الهاتف</th>
                  <th className="px-6 py-4 text-right text-white font-semibold">الدولة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.length > 0 ? (
                  users.map((u, index) => (
                    <tr key={index} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-white/80">{u.name || '-'}</td>
                      <td className="px-6 py-4 text-white/80">{u.email || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin' 
                            ? 'bg-red-500/30 text-red-200' 
                            : 'bg-blue-500/30 text-blue-200'
                        }`}>
                          {u.role === 'admin' ? 'أدمن' : 'مستخدم'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/80">{u.phone || '-'}</td>
                      <td className="px-6 py-4 text-white/80">{u.country || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/60">
                      لا توجد مستخدمين بعد
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
