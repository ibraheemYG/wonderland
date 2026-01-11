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

interface StatusHistory {
  status: string;
  date: string;
  note?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    city: string;
    area: string;
    street: string;
    building?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  statusHistory?: StatusHistory[];
  estimatedDelivery?: string;
  trackingNumber?: string;
  paymentMethod: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-500/20 text-yellow-400', icon: '⏳' },
  confirmed: { label: 'تم التأكيد', color: 'bg-blue-500/20 text-blue-400', icon: '✅' },
  processing: { label: 'قيد التجهيز', color: 'bg-purple-500/20 text-purple-400', icon: '📦' },
  shipped: { label: 'تم الشحن', color: 'bg-cyan-500/20 text-cyan-400', icon: '🚚' },
  delivered: { label: 'تم التوصيل', color: 'bg-green-500/20 text-green-400', icon: '🎉' },
  cancelled: { label: 'ملغي', color: 'bg-red-500/20 text-red-400', icon: '❌' },
};

const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const getStatusIndex = (status: string) => statusOrder.indexOf(status);

function OrdersContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedOrderId = searchParams.get('id');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/orders');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?userId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  useEffect(() => {
    if (selectedOrderId) {
      const order = orders.find(o => o._id === selectedOrderId);
      setSelectedOrder(order || null);
    } else {
      setSelectedOrder(null);
    }
  }, [selectedOrderId, orders]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground/70">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/products" className="text-foreground/60 hover:text-foreground text-sm mb-2 inline-flex items-center gap-1">
            ← العودة للتسوق
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-amber-400 to-orange-500 bg-clip-text text-transparent">📦 طلباتي</h1>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse glass-card rounded-2xl h-48"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <span className="text-6xl mb-4 block">📦</span>
            <h2 className="text-xl font-semibold text-foreground mb-2">لا توجد طلبات</h2>
            <p className="text-foreground/60 mb-6">لم تقم بأي طلبات بعد</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-amber-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition font-medium"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* قائمة الطلبات */}
            <div className="lg:col-span-2 space-y-4">
              {orders.map(order => {
                const status = statusConfig[order.status] || statusConfig.pending;
                return (
                  <Link
                    key={order._id}
                    href={`/orders?id=${order._id}`}
                    className={`block glass-card rounded-2xl p-6 hover:bg-white/15 transition ${
                      selectedOrderId === order._id ? 'border-2 border-primary shadow-lg shadow-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-foreground font-bold">#{order.orderNumber}</p>
                        <p className="text-foreground/50 text-sm">
                          {new Date(order.createdAt).toLocaleDateString('ar-IQ', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="w-12 h-12 glass-subtle rounded-lg overflow-hidden"
                        >
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 glass-subtle rounded-lg flex items-center justify-center text-foreground/60 text-sm">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-foreground/60 text-sm">{order.items.length} منتجات</p>
                      <p className="text-primary font-bold">{formatIQDFromUSD(order.total)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* تفاصيل الطلب المحدد */}
            <div className="lg:col-span-1">
              {selectedOrder ? (
                <div className="glass-card rounded-2xl p-6 sticky top-24">
                  <h2 className="text-lg font-semibold text-foreground mb-4">تفاصيل الطلب</h2>
                  
                  {/* شريط التتبع */}
                  {selectedOrder.status !== 'cancelled' && (
                    <div className="mb-6 glass-subtle rounded-xl p-4">
                      <p className="text-foreground/60 text-sm mb-4">حالة الطلب</p>
                      <div className="flex items-center justify-between relative">
                        {/* خط التقدم */}
                        <div className="absolute top-3 right-3 left-3 h-1 bg-white/10 rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${(getStatusIndex(selectedOrder.status) / (statusOrder.length - 1)) * 100}%` }}
                          />
                        </div>
                        
                        {statusOrder.map((status, index) => {
                          const isPast = index <= getStatusIndex(selectedOrder.status);
                          const isCurrent = index === getStatusIndex(selectedOrder.status);
                          
                          return (
                            <div key={status} className="relative z-10 flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                isPast ? 'bg-gradient-to-r from-primary to-amber-500 text-white' : 'bg-white/10 text-foreground/40'
                              } ${isCurrent ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''}`}>
                                {statusConfig[status]?.icon}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-2">
                        {statusOrder.map((status, index) => (
                          <span 
                            key={status} 
                            className={`text-[10px] ${
                              index <= getStatusIndex(selectedOrder.status) ? 'text-primary' : 'text-foreground/40'
                            }`}
                          >
                            {statusConfig[status]?.label.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* رقم التتبع */}
                  {selectedOrder.trackingNumber && (
                    <div className="mb-4 p-3 glass-subtle bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                      <p className="text-cyan-400 text-sm">
                        <span className="text-cyan-300/70">رقم التتبع:</span> {selectedOrder.trackingNumber}
                      </p>
                    </div>
                  )}

                  {/* التاريخ المتوقع */}
                  {selectedOrder.estimatedDelivery && selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                    <div className="mb-4 p-3 glass-subtle bg-primary/10 rounded-xl border border-primary/20">
                      <p className="text-primary text-sm">
                        <span className="text-primary/70">التوصيل المتوقع:</span>{' '}
                        {new Date(selectedOrder.estimatedDelivery).toLocaleDateString('ar-IQ', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">رقم الطلب</span>
                      <span className="text-foreground font-medium">#{selectedOrder.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">الحالة</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusConfig[selectedOrder.status]?.color}`}>
                        {statusConfig[selectedOrder.status]?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">التاريخ</span>
                      <span className="text-foreground text-sm">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('ar-IQ')}
                      </span>
                    </div>
                  </div>

                  {/* سجل التحديثات */}
                  {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                    <div className="border-t border-white/10 pt-4 mb-4">
                      <p className="text-foreground/60 text-sm mb-3">سجل التحديثات</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedOrder.statusHistory.slice().reverse().map((history, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                            <div>
                              <p className="text-foreground">{statusConfig[history.status]?.label}</p>
                              <p className="text-foreground/40">{new Date(history.date).toLocaleString('ar-IQ')}</p>
                              {history.note && <p className="text-foreground/60 mt-0.5">{history.note}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-4 mb-4">
                    <p className="text-foreground/60 text-sm mb-2">عنوان التوصيل</p>
                    <p className="text-foreground text-sm">
                      {selectedOrder.shippingAddress.city}، {selectedOrder.shippingAddress.area}
                    </p>
                    <p className="text-foreground/70 text-sm">
                      {selectedOrder.shippingAddress.street}
                      {selectedOrder.shippingAddress.building && ` - ${selectedOrder.shippingAddress.building}`}
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-4 mb-4">
                    <p className="text-foreground/60 text-sm mb-2">المنتجات</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-foreground">{item.quantity}x</span>
                          <span className="text-foreground/70 flex-1 truncate">{item.nameAr || item.name}</span>
                          <span className="text-primary">{formatIQDFromUSD(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">المجموع الفرعي</span>
                      <span className="text-foreground">{formatIQDFromUSD(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">التوصيل</span>
                      <span className="text-foreground">
                        {selectedOrder.shippingCost === 0 ? 'مجاني' : formatIQDFromUSD(selectedOrder.shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                      <span className="text-foreground">الإجمالي</span>
                      <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">{formatIQDFromUSD(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-6 text-center">
                  <span className="text-4xl mb-2 block">👆</span>
                  <p className="text-foreground/60">اختر طلباً لعرض تفاصيله</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function OrdersLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-foreground/70">جاري التحميل...</p>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersContent />
    </Suspense>
  );
}
