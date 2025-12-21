'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatIQDFromUSD } from '@/utils/currency';

const iraqiCities = [
  'بغداد',
  'البصرة',
  'الموصل',
  'أربيل',
  'النجف',
  'كربلاء',
  'الحلة',
  'الناصرية',
  'الديوانية',
  'السماوة',
  'الكوت',
  'العمارة',
  'الرمادي',
  'بعقوبة',
  'كركوك',
  'السليمانية',
  'دهوك',
  'تكريت',
  'سامراء',
];

function CheckoutContent() {
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    city: '',
    area: '',
    street: '',
    building: '',
    notes: '',
    paymentMethod: 'cash_on_delivery',
  });

  // إذا المستخدم غير مسجل، أعد توجيهه لتسجيل الدخول
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, router]);

  // ملء البيانات من حساب المستخدم
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || user.email?.split('@')[0] || '',
      }));
    }
  }, [user]);

  // إذا السلة فارغة
  useEffect(() => {
    if (cartItems.length === 0 && !success) {
      router.push('/products');
    }
  }, [cartItems, router, success]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // بغداد: توصيل مجاني، باقي المدن: 75,000 دينار
  const SHIPPING_COST = 75000; // تكلفة التوصيل بالدينار
  const shippingCost = formData.city === 'بغداد' ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost; // الإجمالي بالدينار

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    // التحقق من البيانات
    if (!formData.customerName.trim()) {
      setError('الرجاء إدخال الاسم');
      return;
    }
    if (!formData.customerPhone.trim()) {
      setError('الرجاء إدخال رقم الهاتف');
      return;
    }
    if (!formData.city) {
      setError('الرجاء اختيار المدينة');
      return;
    }
    if (!formData.area.trim()) {
      setError('الرجاء إدخال المنطقة');
      return;
    }
    if (!formData.street.trim()) {
      setError('الرجاء إدخال الشارع');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        userId: user.id,
        customerName: formData.customerName,
        customerEmail: user.email || '',
        customerPhone: formData.customerPhone,
        shippingAddress: {
          city: formData.city,
          area: formData.area,
          street: formData.street,
          building: formData.building,
          notes: formData.notes,
        },
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          nameAr: item.nameAr,
          price: item.price, // السعر بالدينار
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setOrderNumber(data.data.orderNumber);
        clearCart();
      } else {
        setError(data.message || 'حدث خطأ أثناء إنشاء الطلب');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">تم تأكيد طلبك! 🎉</h1>
          <p className="text-white/70 mb-4">رقم الطلب: <span className="text-primary font-bold">{orderNumber}</span></p>
          <p className="text-white/60 text-sm mb-6">
            سيتم التواصل معك قريباً لتأكيد الطلب وترتيب التوصيل
          </p>
          <div className="space-y-3">
            <Link
              href="/orders"
              className="block w-full py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition font-medium"
            >
              تتبع طلباتي
            </Link>
            <Link
              href="/products"
              className="block w-full py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition font-medium"
            >
              متابعة التسوق
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/products" className="text-white/60 hover:text-white text-sm mb-2 inline-flex items-center gap-1">
            ← العودة للتسوق
          </Link>
          <h1 className="text-3xl font-bold text-white">إتمام الطلب</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* نموذج البيانات */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* معلومات التواصل */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>👤</span> معلومات التواصل
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">الاسم الكامل *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="أدخل اسمك"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">رقم الهاتف *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      placeholder="07XX XXX XXXX"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* عنوان التوصيل */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>📍</span> عنوان التوصيل
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">المدينة *</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="" className="bg-slate-800">اختر المدينة</option>
                      {iraqiCities.map(city => (
                        <option key={city} value={city} className="bg-slate-800">{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">المنطقة/الحي *</label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="مثال: المنصور، الكرادة..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">الشارع *</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="اسم أو رقم الشارع"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">البناية/الشقة</label>
                    <input
                      type="text"
                      name="building"
                      value={formData.building}
                      onChange={handleChange}
                      placeholder="رقم البناية أو الشقة (اختياري)"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-white/70 text-sm mb-2">ملاحظات إضافية</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="أي تعليمات خاصة للتوصيل..."
                    rows={2}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>

              {/* طريقة الدفع */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>💳</span> طريقة الدفع
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">الدفع عند الاستلام</p>
                      <p className="text-white/50 text-sm">ادفع نقداً عند استلام الطلب</p>
                    </div>
                    <span className="text-2xl">💵</span>
                  </label>
                </div>
              </div>

              {/* رسالة الخطأ */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* زر الإرسال - للموبايل */}
              <button
                type="submit"
                disabled={loading}
                className="lg:hidden w-full py-4 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition font-bold text-lg"
              >
                {loading ? 'جاري المعالجة...' : `تأكيد الطلب - ${total.toLocaleString('ar-IQ')} د.ع`}
              </button>
            </form>
          </div>

          {/* ملخص الطلب */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">ملخص الطلب</h2>
              
              {/* المنتجات */}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.nameAr || item.name}</p>
                      <p className="text-white/50 text-xs">الكمية: {item.quantity}</p>
                      <p className="text-primary text-sm">{formatIQDFromUSD(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-white/70">
                  <span>المجموع الفرعي</span>
                  <span>{subtotal.toLocaleString('ar-IQ')} د.ع</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>التوصيل {formData.city && `(${formData.city})`}</span>
                  <span className={shippingCost === 0 ? 'text-green-400' : ''}>
                    {shippingCost === 0 ? '🎉 مجاني' : `${shippingCost.toLocaleString('ar-IQ')} د.ع`}
                  </span>
                </div>
                {formData.city === 'بغداد' && (
                  <p className="text-green-400/70 text-xs">✨ التوصيل مجاني داخل بغداد!</p>
                )}
                {formData.city && formData.city !== 'بغداد' && (
                  <p className="text-white/50 text-xs">📍 تكلفة التوصيل خارج بغداد: 75,000 د.ع</p>
                )}
                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                  <span>الإجمالي</span>
                  <span className="text-primary">{total.toLocaleString('ar-IQ')} د.ع</span>
                </div>
              </div>

              {/* زر الإرسال - للديسكتوب */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="hidden lg:block w-full mt-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition font-bold text-lg"
              >
                {loading ? 'جاري المعالجة...' : 'تأكيد الطلب'}
              </button>

              <p className="text-white/40 text-xs text-center mt-4">
                بالضغط على تأكيد الطلب، أنت توافق على شروط الاستخدام وسياسة الخصوصية
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function CheckoutLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/70">جاري التحميل...</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}
