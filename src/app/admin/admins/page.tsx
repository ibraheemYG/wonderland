'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminsPage() {
  const { user, isAdmin, getAdminList, addAdmin, removeAdmin } = useAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');

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
      setAdmins(getAdminList());
    }
  }, [mounted, isAdmin, getAdminList]);

  if (!mounted || !user || !isAdmin()) {
    return null;
  }

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      alert('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    if (addAdmin(newAdminEmail)) {
      setAdmins(getAdminList());
      setNewAdminEmail('');
      alert('✅ تم إضافة الأدمن بنجاح!');
    } else {
      alert('❌ فشل إضافة الأدمن أو قد يكون موجود بالفعل');
    }
  };

  const handleRemoveAdmin = (email: string) => {
    if (email === 'ibraheem2016b@gmail.com') {
      alert('❌ لا يمكن حذف الأدمن الرئيسي');
      return;
    }

    if (confirm(`هل تأكد من حذف ${email} من الأدمن؟`)) {
      if (removeAdmin(email)) {
        setAdmins(getAdminList());
        alert('✅ تم حذف الأدمن بنجاح!');
      } else {
        alert('❌ فشل حذف الأدمن');
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-white mb-12">🔐 إدارة الأدمن</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Add Admin Form */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">➕ إضافة أدمن جديد</h2>
            
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">البريد الإلكتروني (Google)</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  placeholder="admin@gmail.com"
                />
              </div>

              <p className="text-white/60 text-xs">
                ℹ️ سيتم منح صلاحيات الأدمن عند دخول المستخدم بهذا البريد الإلكتروني عبر Google
              </p>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition font-semibold"
              >
                ✅ إضافة أدمن
              </button>
            </form>
          </div>

          {/* Info Card */}
          <div className="bg-blue-500/10 border border-blue-400/50 rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-blue-300 mb-4">💡 معلومات مهمة</h3>
            <ul className="text-white/70 space-y-2 text-sm">
              <li>✅ الأدمن الرئيسي: <span className="font-semibold">ibraheem2016b@gmail.com</span></li>
              <li>✅ لا يمكن حذف الأدمن الرئيسي</li>
              <li>✅ الأدمن يستطيع إضافة وحذف أدمن آخرين</li>
              <li>✅ الأدمن لديه صلاحية كاملة على الموقع</li>
            </ul>
          </div>
        </div>

        {/* Admins List */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6">👑 قائمة الأدمن ({admins.length})</h2>
          
          {admins.length > 0 ? (
            <div className="space-y-3">
              {admins.map((adminEmail, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="text-white font-medium">{adminEmail}</p>
                      {adminEmail === 'ibraheem2016b@gmail.com' && (
                        <p className="text-yellow-400 text-xs">👑 الأدمن الرئيسي</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveAdmin(adminEmail)}
                    disabled={adminEmail === 'ibraheem2016b@gmail.com'}
                    className="px-4 py-2 bg-red-600/30 hover:bg-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-red-200 rounded transition font-medium"
                  >
                    🗑️ حذف
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">لا يوجد أدمن</p>
          )}
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
