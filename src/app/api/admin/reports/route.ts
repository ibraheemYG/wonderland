import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { Product } from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    // حساب التاريخ بناءً على الفترة
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        previousStartDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }

    // جلب الطلبات للفترة الحالية
    const currentOrders = await Order.find({
      createdAt: { $gte: startDate },
      status: { $ne: 'cancelled' },
    }).lean();

    // جلب الطلبات للفترة السابقة (لحساب النمو)
    const previousOrders = await Order.find({
      createdAt: { $gte: previousStartDate, $lt: startDate },
      status: { $ne: 'cancelled' },
    }).lean();

    // حساب إجمالي المبيعات
    const totalSales = currentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const previousSales = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // حساب نسبة النمو
    const salesGrowth = previousSales > 0 
      ? ((totalSales - previousSales) / previousSales) * 100 
      : totalSales > 0 ? 100 : 0;

    // إجمالي الطلبات
    const totalOrders = currentOrders.length;

    // متوسط قيمة الطلب
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // عدد العملاء الفريدين
    const uniqueCustomers = new Set(currentOrders.map(order => order.userId)).size;

    // عدد المنتجات
    const totalProducts = await Product.countDocuments();

    // المبيعات اليومية
    const salesByDayMap = new Map<string, { sales: number; orders: number }>();
    const daysToShow = period === 'week' ? 7 : period === 'month' ? 30 : 12;
    
    // تهيئة الأيام
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      if (period === 'year') {
        date.setMonth(date.getMonth() - i);
        const key = date.toISOString().slice(0, 7); // YYYY-MM
        salesByDayMap.set(key, { sales: 0, orders: 0 });
      } else {
        date.setDate(date.getDate() - i);
        const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
        salesByDayMap.set(key, { sales: 0, orders: 0 });
      }
    }

    // تجميع المبيعات
    currentOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const key = period === 'year' 
        ? date.toISOString().slice(0, 7)
        : date.toISOString().slice(0, 10);
      
      const existing = salesByDayMap.get(key);
      if (existing) {
        existing.sales += order.total || 0;
        existing.orders += 1;
      }
    });

    const salesByDay = Array.from(salesByDayMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    // المبيعات حسب الفئة
    const categoryMap = new Map<string, { sales: number; count: number }>();
    currentOrders.forEach(order => {
      (order.items || []).forEach((item: { category?: string; price: number; quantity: number }) => {
        const category = item.category || 'other';
        const existing = categoryMap.get(category) || { sales: 0, count: 0 };
        existing.sales += item.price * item.quantity;
        existing.count += item.quantity;
        categoryMap.set(category, existing);
      });
    });

    // جلب فئات المنتجات إذا لم تكن موجودة في الطلبات
    const productIds = new Set<string>();
    currentOrders.forEach(order => {
      (order.items || []).forEach((item: { productId: string }) => {
        productIds.add(item.productId);
      });
    });

    const products = await Product.find({ id: { $in: Array.from(productIds) } }).lean();
    const productCategoryMap = new Map(products.map(p => [p.id, p.category]));

    // إعادة حساب مع الفئات الصحيحة
    const categorySalesMap = new Map<string, { sales: number; count: number }>();
    currentOrders.forEach(order => {
      (order.items || []).forEach((item: { productId: string; price: number; quantity: number }) => {
        const category = productCategoryMap.get(item.productId) || 'other';
        const existing = categorySalesMap.get(category) || { sales: 0, count: 0 };
        existing.sales += item.price * item.quantity;
        existing.count += item.quantity;
        categorySalesMap.set(category, existing);
      });
    });

    const salesByCategory = Array.from(categorySalesMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.sales - a.sales);

    // أفضل المنتجات مبيعاً
    const productSalesMap = new Map<string, { name: string; sales: number; quantity: number }>();
    currentOrders.forEach(order => {
      (order.items || []).forEach((item: { productId: string; name: string; nameAr?: string; price: number; quantity: number }) => {
        const existing = productSalesMap.get(item.productId) || { 
          name: item.nameAr || item.name, 
          sales: 0, 
          quantity: 0 
        };
        existing.sales += item.price * item.quantity;
        existing.quantity += item.quantity;
        productSalesMap.set(item.productId, existing);
      });
    });

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // آخر الطلبات
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formattedRecentOrders = recentOrders.map(order => ({
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      date: order.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        totalProducts,
        totalCustomers: uniqueCustomers,
        averageOrderValue,
        salesGrowth,
        salesByDay,
        salesByCategory,
        topProducts,
        recentOrders: formattedRecentOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
