'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Ticket, Plus, Trash2, Edit2, X, Check, Calendar, Percent, DollarSign } from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export default function CouponsPage() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: '',
    validUntil: '',
    isActive: true,
  });

  useEffect(() => {
    if (!isAuthLoading && (!user || !isAdmin())) {
      router.push('/');
      return;
    }
    fetchCoupons();
  }, [user, router, isAuthLoading, isAdmin]);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      const json = await res.json();
      if (json.success) {
        setCoupons(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';
      const body = editingCoupon 
        ? { id: editingCoupon._id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        fetchCoupons();
        resetForm();
      } else {
        alert(json.message);
      }
    } catch (error) {
      console.error('Failed to save coupon:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;

    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchCoupons();
      }
    } catch (error) {
      console.error('Failed to delete coupon:', error);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit || 0,
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil.split('T')[0],
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      usageLimit: 0,
      validFrom: '',
      validUntil: '',
      isActive: true,
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: coupon._id, isActive: !coupon.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        fetchCoupons();
      }
    } catch (error) {
      console.error('Failed to toggle coupon:', error);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !isAdmin()) return null;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Ticket className="w-8 h-8 text-purple-500" />
              إدارة كوبونات الخصم
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {coupons.length} كوبون
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            كوبون جديد
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCoupon ? 'تعديل الكوبون' : 'كوبون جديد'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    كود الخصم
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    placeholder="SAVE20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      نوع الخصم
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="percentage">نسبة مئوية %</option>
                      <option value="fixed">مبلغ ثابت</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      قيمة الخصم
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      الحد الأدنى للطلب
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      أقصى خصم
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    عدد مرات الاستخدام (0 = غير محدود)
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    min="0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      تاريخ البدء
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      تاريخ الانتهاء
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                    كوبون فعال
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    {editingCoupon ? 'حفظ التعديلات' : 'إنشاء الكوبون'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Coupons List */}
        {loading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              لا توجد كوبونات
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              أنشئ كوبون خصم جديد للعملاء
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {coupons.map((coupon) => {
              const isExpired = new Date(coupon.validUntil) < new Date();
              const isExhausted = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
              
              return (
                <div
                  key={coupon._id}
                  className={`bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-2 transition-all ${
                    !coupon.isActive || isExpired || isExhausted
                      ? 'border-gray-200 dark:border-gray-700 opacity-60'
                      : 'border-purple-200 dark:border-purple-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        coupon.discountType === 'percentage' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      }`}>
                        {coupon.discountType === 'percentage' ? (
                          <Percent className="w-6 h-6" />
                        ) : (
                          <DollarSign className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                            {coupon.code}
                          </h3>
                          {!coupon.isActive && (
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">معطل</span>
                          )}
                          {isExpired && (
                            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded">منتهي</span>
                          )}
                          {isExhausted && (
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-0.5 rounded">مستنفد</span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {coupon.discountType === 'percentage' 
                            ? `خصم ${coupon.discountValue}%`
                            : `خصم ${coupon.discountValue.toLocaleString()} د.ع`
                          }
                          {coupon.minOrderAmount ? ` • حد أدنى ${coupon.minOrderAmount.toLocaleString()} د.ع` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(coupon.validUntil).toLocaleDateString('ar-IQ')}</span>
                      </div>
                      <div>
                        استخدام: {coupon.usedCount}/{coupon.usageLimit || '∞'}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(coupon)}
                          className={`p-2 rounded-lg transition-colors ${
                            coupon.isActive 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={coupon.isActive ? 'تعطيل' : 'تفعيل'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
