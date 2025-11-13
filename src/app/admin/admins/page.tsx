'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminRecord {
  _id: string;
  email: string;
  name?: string;
  role: 'admin' | 'super-admin';
  createdAt: string;
}

export default function AdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const response = await fetch('/api/admin');
      if (response.ok) {
        const result = await response.json();
        setAdmins(result.data || []);
        console.log('✅ Admins loaded from MongoDB:', result.data?.length || 0);
      } else {
        console.error('Failed to fetch admins');
        setAdmins([]);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!adminEmail.trim()) {
      setFeedback('ادخل البريد الالكتروني');
      return;
    }

    setIsSubmitting(true);
    setFeedback('جاري الاتصال بالخادم...');
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          name: adminName || adminEmail,
          role: 'admin',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAdmins((prev) => [result.data, ...prev]);
        setAdminEmail('');
        setAdminName('');
        setFeedback('✅ تم اضافة المسؤول بنجاح!');
      } else {
        const error = await response.json();
        setFeedback('❌ ' + (error.message || 'فشل في الاتصال'));
        console.error('Error response:', error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setFeedback('❌ خطأ في الاتصال بالخادم. تأكد من أن الخادم يعمل.');
    }
    setIsSubmitting(false);
  };

  const handleDeleteAdmin = async (id: string) => {
    try {
      const response = await fetch(`/api/admin?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setAdmins((prev) => prev.filter((item) => item._id !== id));
        setFeedback('✅ تم حذف المسؤول!');
      } else {
        setFeedback('❌ فشل الحذف');
      }
    } catch (error) {
      setFeedback('❌ خطأ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">جاري التحميل...</div>
          <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full mx-auto"></div>
          <p className="text-white/60 text-sm mt-4">قد يستغرق الاتصال بـ MongoDB قليلاً...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">👥 ادارة المسؤولين</h1>
            <p className="text-white/60">عدد المسؤولين: {admins.length}</p>
          </div>
          <button
            onClick={loadAdmins}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
          >
            🔄 تحديث
          </button>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 text-green-200 text-sm">
            {feedback}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Admins List */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">قائمة المسؤولين</h2>
            {admins.length === 0 ? (
              <p className="text-white/60">لا يوجد مسؤولين</p>
            ) : (
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div
                    key={admin._id}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 flex items-center justify-between hover:bg-white/15 transition"
                  >
                    <div>
                      <p className="text-white font-semibold">{admin.email}</p>
                      {admin.name && admin.name !== admin.email && (
                        <p className="text-white/60 text-sm">{admin.name}</p>
                      )}
                      <p className="text-white/40 text-xs mt-2">
                        {new Date(admin.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAdmin(admin._id)}
                      className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded hover:bg-red-500/30 transition"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Admin Form */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">اضافة مسؤول جديد</h2>
            <form onSubmit={handleAddAdmin} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  البريد الالكتروني
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white text-sm focus:border-white focus:outline-none focus:bg-white/10 transition"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  الاسم (اختياري)
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white text-sm focus:border-white focus:outline-none focus:bg-white/10 transition"
                  placeholder="احمد محمد"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 transition"
              >
                {isSubmitting ? 'جاري الاضافة...' : 'اضافة مسؤول'}
              </button>
            </form>
          </div>
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
