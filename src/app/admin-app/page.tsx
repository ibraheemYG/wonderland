'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// VAPID Public Key - يجب أن تتطابق مع المفتاح في .env
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

interface Product {
  _id: string;
  name: string;
  nameAr: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  isActive: boolean;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  createdAt: string;
}

interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

type Tab = 'home' | 'products' | 'orders' | 'add' | 'settings';

// تحويل VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function AdminApp() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // حالة الإشعارات
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // تسجيل Service Worker وتفعيل الإشعارات
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        setSwRegistration(registration);
        // التحقق من حالة الإشعارات الحالية
        registration.pushManager.getSubscription().then((subscription) => {
          setNotificationsEnabled(!!subscription);
        });
      });
      
      // التحقق من إذن الإشعارات
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // تفعيل الإشعارات
  const enableNotifications = useCallback(async () => {
    if (!swRegistration || !user) return;

    try {
      // طلب إذن الإشعارات
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== 'granted') {
        alert('يجب السماح بالإشعارات لتفعيل هذه الميزة');
        return;
      }

      // الاشتراك في Push
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // إرسال الاشتراك للخادم
      const res = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userRole: user.role,
          subscription: subscription.toJSON(),
        }),
      });

      if (res.ok) {
        setNotificationsEnabled(true);
        // إرسال إشعار تجريبي
        new Notification('✅ تم تفعيل الإشعارات', {
          body: 'ستصلك الإشعارات الآن على هذا الجهاز',
          icon: '/icons/icon-192.png',
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('حدث خطأ في تفعيل الإشعارات');
    }
  }, [swRegistration, user]);

  // إلغاء الإشعارات
  const disableNotifications = useCallback(async () => {
    if (!swRegistration || !user) return;

    try {
      const subscription = await swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      await fetch(`/api/push-subscribe?userId=${user.id}`, {
        method: 'DELETE',
      });

      setNotificationsEnabled(false);
    } catch (error) {
      console.error('Error disabling notifications:', error);
    }
  }, [swRegistration, user]);

  // التحقق من صلاحيات الأدمن
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin())) {
      router.push('/login?redirect=/admin-app');
    }
  }, [user, isAdmin, isLoading, router]);

  // جلب البيانات
  useEffect(() => {
    if (user && isAdmin()) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders?isAdmin=true'),
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      if (productsData.success) setProducts(productsData.data || []);
      if (ordersData.success) {
        setOrders(ordersData.data || []);
        // حساب الإحصائيات
        const allOrders = ordersData.data || [];
        setStats({
          totalProducts: productsData.data?.length || 0,
          totalOrders: allOrders.length,
          pendingOrders: allOrders.filter((o: Order) => o.status === 'pending').length,
          totalRevenue: allOrders
            .filter((o: Order) => o.status === 'delivered')
            .reduce((sum: number, o: Order) => sum + o.total, 0),
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // تحديث حالة الطلب
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // تحديث المنتج
  const toggleProductActive = async (productId: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, isActive: !isActive }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // فلترة المنتجات
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nameAr.includes(searchQuery)
  );

  // فلترة الطلبات
  const filteredOrders = orders.filter(o =>
    o.orderNumber.includes(searchQuery) ||
    o.customerName.includes(searchQuery) ||
    o.customerPhone.includes(searchQuery)
  );

  if (isLoading || !user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white/70">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      processing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      shipped: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      processing: 'قيد التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
    };
    return texts[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl">
              ⚙️
            </div>
            <div>
              <h1 className="font-bold text-lg">Wonderland</h1>
              <p className="text-xs text-white/50">لوحة التحكم</p>
            </div>
          </div>
          <button 
            onClick={fetchData}
            className="p-2 rounded-xl bg-white/10 active:bg-white/20"
          >
            🔄
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {(activeTab === 'products' || activeTab === 'orders') && (
        <div className="px-4 py-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'products' ? 'ابحث عن منتج...' : 'ابحث عن طلب...'}
              className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="px-4 py-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Home Tab */}
            {activeTab === 'home' && (
              <div className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
                    <p className="text-amber-400/70 text-xs mb-1">إجمالي المنتجات</p>
                    <p className="text-3xl font-bold text-amber-400">{stats?.totalProducts || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-4">
                    <p className="text-blue-400/70 text-xs mb-1">إجمالي الطلبات</p>
                    <p className="text-3xl font-bold text-blue-400">{stats?.totalOrders || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-2xl p-4">
                    <p className="text-yellow-400/70 text-xs mb-1">طلبات معلقة</p>
                    <p className="text-3xl font-bold text-yellow-400">{stats?.pendingOrders || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4">
                    <p className="text-green-400/70 text-xs mb-1">الإيرادات</p>
                    <p className="text-2xl font-bold text-green-400">{(stats?.totalRevenue || 0).toLocaleString()}</p>
                    <p className="text-green-400/50 text-xs">د.ع</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h2 className="font-bold mb-3 flex items-center gap-2">
                    <span>⚡</span> إجراءات سريعة
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-center active:scale-95 transition"
                    >
                      <span className="text-2xl block mb-1">🛍️</span>
                      <span className="text-sm">المنتجات</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl text-center active:scale-95 transition"
                    >
                      <span className="text-2xl block mb-1">📦</span>
                      <span className="text-sm">الطلبات</span>
                    </button>
                    <button 
                      onClick={() => router.push('/admin/products')}
                      className="p-4 bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-xl text-center active:scale-95 transition"
                    >
                      <span className="text-2xl block mb-1">➕</span>
                      <span className="text-sm">إضافة منتج</span>
                    </button>
                    <button 
                      onClick={() => router.push('/admin/coupons')}
                      className="p-4 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl text-center active:scale-95 transition"
                    >
                      <span className="text-2xl block mb-1">🎫</span>
                      <span className="text-sm">الكوبونات</span>
                    </button>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h2 className="font-bold mb-3 flex items-center gap-2">
                    <span>🕐</span> آخر الطلبات
                  </h2>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map(order => (
                      <div key={order._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className="font-medium text-sm">#{order.orderNumber}</p>
                          <p className="text-xs text-white/50">{order.customerName}</p>
                        </div>
                        <div className="text-left">
                          <p className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-center text-white/50 py-4">لا توجد طلبات</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/60 text-sm">{filteredProducts.length} منتج</p>
                  <button 
                    onClick={() => router.push('/admin/products')}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-sm font-medium active:scale-95 transition"
                  >
                    ➕ إضافة
                  </button>
                </div>
                {filteredProducts.map(product => (
                  <div 
                    key={product._id} 
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl"
                  >
                    <div className="w-16 h-16 rounded-xl bg-white/10 overflow-hidden flex-shrink-0">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.nameAr || product.name}</p>
                      <p className="text-amber-400 text-sm">{product.price.toLocaleString()} د.ع</p>
                      <p className="text-white/50 text-xs">المخزون: {product.stock}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => toggleProductActive(product._id, product.isActive)}
                        className={`px-3 py-1 rounded-lg text-xs ${
                          product.isActive 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {product.isActive ? 'مفعّل' : 'معطّل'}
                      </button>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="text-center text-white/50 py-10">لا توجد منتجات</p>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-3">
                <p className="text-white/60 text-sm mb-2">{filteredOrders.length} طلب</p>
                {filteredOrders.map(order => (
                  <div 
                    key={order._id} 
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold">#{order.orderNumber}</p>
                        <p className="text-white/50 text-xs">
                          {new Date(order.createdAt).toLocaleDateString('ar-IQ')}
                        </p>
                      </div>
                      <p className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div>
                        <p className="text-white/70">{order.customerName}</p>
                        <p className="text-white/50 text-xs" dir="ltr">{order.customerPhone}</p>
                      </div>
                      <p className="text-amber-400 font-bold">{order.total.toLocaleString()} د.ع</p>
                    </div>
                    {/* Status Actions */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="flex gap-2 flex-wrap">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order._id, 'confirmed')}
                              className="flex-1 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs active:scale-95"
                            >
                              تأكيد ✓
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order._id, 'cancelled')}
                              className="py-2 px-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs active:scale-95"
                            >
                              إلغاء
                            </button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'processing')}
                            className="flex-1 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs active:scale-95"
                          >
                            بدء التجهيز 📦
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'shipped')}
                            className="flex-1 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs active:scale-95"
                          >
                            تم الشحن 🚚
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'delivered')}
                            className="flex-1 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-xs active:scale-95"
                          >
                            تم التوصيل ✓
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <p className="text-center text-white/50 py-10">لا توجد طلبات</p>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                {/* الإشعارات */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h2 className="font-bold mb-4 flex items-center gap-2">
                    <span>🔔</span> الإشعارات
                  </h2>
                  <div className="space-y-3">
                    {'serviceWorker' in (typeof navigator !== 'undefined' ? navigator : {}) && 'PushManager' in (typeof window !== 'undefined' ? window : {}) ? (
                      <>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div>
                            <p className="font-medium">إشعارات الطلبات</p>
                            <p className="text-white/50 text-xs">
                              {notificationsEnabled ? 'مفعّلة ✓' : 'غير مفعّلة'}
                            </p>
                          </div>
                          <button
                            onClick={notificationsEnabled ? disableNotifications : enableNotifications}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                              notificationsEnabled
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30 active:bg-red-500/30'
                                : 'bg-green-500/20 text-green-400 border border-green-500/30 active:bg-green-500/30'
                            }`}
                          >
                            {notificationsEnabled ? 'إلغاء' : 'تفعيل'}
                          </button>
                        </div>
                        {notificationPermission === 'denied' && (
                          <p className="text-red-400 text-xs p-2 bg-red-500/10 rounded-lg">
                            ⚠️ تم حظر الإشعارات. يرجى تفعيلها من إعدادات المتصفح.
                          </p>
                        )}
                        {notificationsEnabled && (
                          <p className="text-green-400/70 text-xs">
                            ✅ ستصلك إشعارات عند وصول طلبات جديدة
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-white/50 text-sm">
                        الإشعارات غير مدعومة على هذا المتصفح
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h2 className="font-bold mb-4 flex items-center gap-2">
                    <span>👤</span> الحساب
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl">
                        {user?.name?.[0] || '👤'}
                      </div>
                      <div>
                        <p className="font-medium">{user?.name || 'الأدمن'}</p>
                        <p className="text-white/50 text-xs">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h2 className="font-bold mb-4 flex items-center gap-2">
                    <span>🔗</span> روابط سريعة
                  </h2>
                  <div className="space-y-2">
                    <button 
                      onClick={() => router.push('/admin/dashboard')}
                      className="w-full p-3 bg-white/5 rounded-xl text-right flex items-center justify-between active:bg-white/10"
                    >
                      <span>لوحة التحكم الكاملة</span>
                      <span>←</span>
                    </button>
                    <button 
                      onClick={() => router.push('/admin/users')}
                      className="w-full p-3 bg-white/5 rounded-xl text-right flex items-center justify-between active:bg-white/10"
                    >
                      <span>إدارة المستخدمين</span>
                      <span>←</span>
                    </button>
                    <button 
                      onClick={() => router.push('/admin/surveys')}
                      className="w-full p-3 bg-white/5 rounded-xl text-right flex items-center justify-between active:bg-white/10"
                    >
                      <span>الاستبيانات</span>
                      <span>←</span>
                    </button>
                    <button 
                      onClick={() => router.push('/admin/reports')}
                      className="w-full p-3 bg-white/5 rounded-xl text-right flex items-center justify-between active:bg-white/10"
                    >
                      <span>التقارير</span>
                      <span>←</span>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/')}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white/70 active:bg-white/10"
                >
                  🏠 العودة للموقع
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/10 px-2 py-2 z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {[
            { id: 'home', icon: '🏠', label: 'الرئيسية' },
            { id: 'products', icon: '🛍️', label: 'المنتجات' },
            { id: 'orders', icon: '📦', label: 'الطلبات' },
            { id: 'settings', icon: '⚙️', label: 'الإعدادات' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as Tab);
                setSearchQuery('');
              }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
                activeTab === tab.id 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'text-white/50 active:bg-white/10'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
