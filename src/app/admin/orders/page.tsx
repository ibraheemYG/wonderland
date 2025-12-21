'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatIQDFromUSD } from '@/utils/currency';

interface OrderItem {
  productId: string;
  name: string;
  nameAr?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    city: string;
    area: string;
    street: string;
    building?: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: 'قيد الانتظار', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '⏳' },
  confirmed: { label: 'تم التأكيد', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '✅' },
  processing: { label: 'قيد التجهيز', color: 'text-purple-400', bg: 'bg-purple-500/20', icon: '📦' },
  shipped: { label: 'تم الشحن', color: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: '🚚' },
  delivered: { label: 'تم التوصيل', color: 'text-green-400', bg: 'bg-green-500/20', icon: '🎉' },
  cancelled: { label: 'ملغي', color: 'text-red-400', bg: 'bg-red-500/20', icon: '❌' },
};

function AdminOrdersContent() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedOrderId = searchParams.get('id');

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user || !isAdmin()) {
      router.push('/login');
    }
  }, [user, isAdmin, router]);

  const fetchOrders = async () => {
    try {
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const res = await fetch(`/api/orders?isAdmin=true${statusParam}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin()) {
      fetchOrders();
    }
  }, [user, filter]);

  useEffect(() => {
    if (selectedOrderId) {
      const order = orders.find(o => o._id === selectedOrderId);
      setSelectedOrder(order || null);
    } else {
      setSelectedOrder(null);
    }
  }, [selectedOrderId, orders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">📦 إدارة الطلبات</h1>
            {stats && (
              <p className="text-white/60 text-sm mt-1">
                إجمالي الطلبات: {stats.total} | جديدة: {stats.pending}
              </p>
            )}
          </div>
          <Link href="/admin/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm">
            ← لوحة التحكم
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilter(filter === key ? 'all' : key)}
                className={`p-3 rounded-xl text-center transition ${
                  filter === key ? 'ring-2 ring-primary' : ''
                } ${config.bg}`}
              >
                <p className="text-2xl">{config.icon}</p>
                <p className={`text-lg font-bold ${config.color}`}>
                  {stats[key as keyof Stats] || 0}
                </p>
                <p className="text-white/60 text-xs">{config.label}</p>
              </button>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse h-24 bg-white/10 rounded-lg"></div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
                <span className="text-5xl mb-4 block">📦</span>
                <p className="text-white/60">لا توجد طلبات</p>
              </div>
            ) : (
              <>
                {/* قسم الطلبات الجديدة */}
                {orders.filter(o => o.status === 'pending').length > 0 && (
                  <div className="bg-yellow-500/10 backdrop-blur-md border border-yellow-500/30 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 bg-yellow-500/20 border-b border-yellow-500/30">
                      <h2 className="text-yellow-400 font-bold flex items-center gap-2">
                        <span className="animate-pulse">🔔</span>
                        طلبات جديدة ({orders.filter(o => o.status === 'pending').length})
                      </h2>
                    </div>
                    <div className="divide-y divide-yellow-500/20">
                      {orders.filter(o => o.status === 'pending').map(order => {
                        const status = statusConfig[order.status] || statusConfig.pending;
                        return (
                          <Link
                            key={order._id}
                            href={`/admin/orders?id=${order._id}`}
                            className={`block p-4 hover:bg-yellow-500/10 transition ${
                              selectedOrderId === order._id ? 'bg-yellow-500/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color}`}>
                                  {status.icon} {status.label}
                                </span>
                                <span className="text-white font-bold">#{order.orderNumber}</span>
                              </div>
                              <span className="text-primary font-bold">{formatIQDFromUSD(order.total)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <p className="text-white">{order.customerName}</p>
                                <p className="text-white/50">{order.customerPhone}</p>
                              </div>
                              <p className="text-white/40">
                                {new Date(order.createdAt).toLocaleDateString('ar-IQ')}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* قسم الطلبات الأخرى */}
                {orders.filter(o => o.status !== 'pending').length > 0 && (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                      <h2 className="text-white/80 font-bold flex items-center gap-2">
                        📋 طلبات سابقة ({orders.filter(o => o.status !== 'pending').length})
                      </h2>
                    </div>
                    <div className="divide-y divide-white/10">
                      {orders.filter(o => o.status !== 'pending').map(order => {
                        const status = statusConfig[order.status] || statusConfig.pending;
                        return (
                          <Link
                            key={order._id}
                            href={`/admin/orders?id=${order._id}`}
                            className={`block p-4 hover:bg-white/5 transition ${
                              selectedOrderId === order._id ? 'bg-white/10' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color}`}>
                                  {status.icon} {status.label}
                                </span>
                                <span className="text-white font-bold">#{order.orderNumber}</span>
                              </div>
                              <span className="text-primary font-bold">{formatIQDFromUSD(order.total)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <p className="text-white">{order.customerName}</p>
                                <p className="text-white/50">{order.customerPhone}</p>
                              </div>
                              <p className="text-white/40">
                                {new Date(order.createdAt).toLocaleDateString('ar-IQ')}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sticky top-24 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">#{selectedOrder.orderNumber}</h2>
                  <span className={`px-2 py-1 rounded-lg text-xs ${statusConfig[selectedOrder.status]?.bg} ${statusConfig[selectedOrder.status]?.color}`}>
                    {statusConfig[selectedOrder.status]?.label}
                  </span>
                </div>

                {/* تغيير الحالة */}
                <div>
                  <label className="text-white/60 text-sm mb-2 block">تغيير الحالة</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    disabled={updating}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  >
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <option key={key} value={key} className="bg-slate-800">
                        {config.icon} {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* معلومات العميل */}
                <div className="border-t border-white/10 pt-4">
                  <p className="text-white/60 text-sm mb-2">معلومات العميل</p>
                  <p className="text-white font-medium">{selectedOrder.customerName}</p>
                  <p className="text-white/70 text-sm">{selectedOrder.customerPhone}</p>
                  <p className="text-white/50 text-sm">{selectedOrder.customerEmail}</p>
                </div>

                {/* العنوان */}
                <div className="border-t border-white/10 pt-4">
                  <p className="text-white/60 text-sm mb-2">عنوان التوصيل</p>
                  <p className="text-white text-sm">
                    {selectedOrder.shippingAddress.city}، {selectedOrder.shippingAddress.area}
                  </p>
                  <p className="text-white/70 text-sm">
                    {selectedOrder.shippingAddress.street}
                    {selectedOrder.shippingAddress.building && ` - ${selectedOrder.shippingAddress.building}`}
                  </p>
                  {selectedOrder.shippingAddress.notes && (
                    <p className="text-white/50 text-xs mt-1">
                      ملاحظات: {selectedOrder.shippingAddress.notes}
                    </p>
                  )}
                </div>

                {/* المنتجات */}
                <div className="border-t border-white/10 pt-4">
                  <p className="text-white/60 text-sm mb-2">المنتجات ({selectedOrder.items.length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{item.nameAr || item.name}</p>
                          <p className="text-white/50 text-xs">{item.quantity} × {formatIQDFromUSD(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* الإجمالي */}
                <div className="border-t border-white/10 pt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">المجموع الفرعي</span>
                    <span className="text-white">{formatIQDFromUSD(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">التوصيل</span>
                    <span className="text-white">
                      {selectedOrder.shippingCost === 0 ? 'مجاني' : formatIQDFromUSD(selectedOrder.shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                    <span className="text-white">الإجمالي</span>
                    <span className="text-primary">{formatIQDFromUSD(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-2 pt-2">
                  <a
                    href={`tel:${selectedOrder.customerPhone}`}
                    className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-center text-sm hover:bg-green-500/30 transition"
                  >
                    📞 اتصال
                  </a>
                  <a
                    href={`https://wa.me/964${selectedOrder.customerPhone.replace(/^0/, '')}`}
                    target="_blank"
                    className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-center text-sm hover:bg-emerald-500/30 transition"
                  >
                    💬 واتساب
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
                <span className="text-5xl mb-4 block">👆</span>
                <p className="text-white/60">اختر طلباً لعرض تفاصيله</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function AdminOrdersLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/70">جاري التحميل...</p>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<AdminOrdersLoading />}>
      <AdminOrdersContent />
    </Suspense>
  );
}
