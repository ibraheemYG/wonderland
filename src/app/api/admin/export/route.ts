import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { Product } from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'orders';
    const format = searchParams.get('format') || 'csv';

    let data: string;
    let filename: string;

    if (type === 'orders') {
      const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
      
      // إنشاء CSV للطلبات
      const headers = [
        'رقم الطلب',
        'اسم العميل',
        'الهاتف',
        'البريد',
        'المدينة',
        'المنطقة',
        'العنوان',
        'المجموع الفرعي',
        'الخصم',
        'التوصيل',
        'الإجمالي',
        'الحالة',
        'طريقة الدفع',
        'حالة الدفع',
        'التاريخ',
        'المنتجات',
      ];

      const statusMap: Record<string, string> = {
        pending: 'قيد الانتظار',
        confirmed: 'تم التأكيد',
        processing: 'قيد التجهيز',
        shipped: 'تم الشحن',
        delivered: 'تم التوصيل',
        cancelled: 'ملغي',
      };

      const paymentMap: Record<string, string> = {
        cash_on_delivery: 'الدفع عند الاستلام',
        online: 'دفع إلكتروني',
      };

      const paymentStatusMap: Record<string, string> = {
        pending: 'معلق',
        paid: 'مدفوع',
        failed: 'فشل',
      };

      const rows = orders.map(order => [
        order.orderNumber,
        order.customerName,
        order.customerPhone,
        order.customerEmail,
        order.shippingAddress?.city || '',
        order.shippingAddress?.area || '',
        order.shippingAddress?.street || '',
        order.subtotal?.toString() || '0',
        order.discount?.toString() || '0',
        order.shippingCost?.toString() || '0',
        order.total?.toString() || '0',
        statusMap[order.status] || order.status,
        paymentMap[order.paymentMethod] || order.paymentMethod,
        paymentStatusMap[order.paymentStatus] || order.paymentStatus,
        new Date(order.createdAt).toLocaleDateString('ar-IQ'),
        (order.items || []).map((item: { name: string; quantity: number }) => 
          `${item.name} (${item.quantity})`
        ).join(' | '),
      ]);

      data = [headers.join(','), ...rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )].join('\n');
      
      filename = `orders_${new Date().toISOString().slice(0, 10)}.csv`;

    } else if (type === 'products') {
      const products = await Product.find({}).lean();
      
      const headers = [
        'معرف المنتج',
        'الاسم',
        'الفئة',
        'السعر',
        'الكمية',
        'حد التنبيه',
        'SKU',
        'الخصم',
        'الوصف',
        'المادة',
        'اللون',
        'الوزن',
        'العرض',
        'الارتفاع',
        'العمق',
        '3D',
        'تاريخ الإضافة',
      ];

      const categoryMap: Record<string, string> = {
        'living-room': 'غرف المعيشة',
        'bedroom': 'غرف النوم',
        'kitchen': 'المطابخ',
        'bathroom': 'الحمامات',
        'decor': 'الديكور',
        'appliances': 'الأجهزة',
        'sale': 'عروض خاصة',
        'furnishings': 'المفروشات',
      };

      const rows = products.map(product => [
        product.id,
        product.name,
        categoryMap[product.category] || product.category,
        product.price?.toString() || '0',
        product.quantity?.toString() || '0',
        product.lowStockThreshold?.toString() || '5',
        product.sku || '',
        product.discount?.toString() || '0',
        product.description || '',
        product.material || '',
        product.color || '',
        product.weight?.toString() || '',
        product.dimensions?.width?.toString() || '',
        product.dimensions?.height?.toString() || '',
        product.dimensions?.depth?.toString() || '',
        product.threeD ? 'نعم' : 'لا',
        new Date(product.createdAt).toLocaleDateString('ar-IQ'),
      ]);

      data = [headers.join(','), ...rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )].join('\n');
      
      filename = `products_${new Date().toISOString().slice(0, 10)}.csv`;

    } else if (type === 'inventory') {
      // تقرير المخزون
      const products = await Product.find({}).lean();
      
      const headers = [
        'معرف المنتج',
        'الاسم',
        'الفئة',
        'SKU',
        'الكمية المتاحة',
        'حد التنبيه',
        'الحالة',
        'السعر',
        'قيمة المخزون',
      ];

      const categoryMap: Record<string, string> = {
        'living-room': 'غرف المعيشة',
        'bedroom': 'غرف النوم',
        'kitchen': 'المطابخ',
        'bathroom': 'الحمامات',
        'decor': 'الديكور',
        'appliances': 'الأجهزة',
        'sale': 'عروض خاصة',
        'furnishings': 'المفروشات',
      };

      const rows = products.map(product => {
        const quantity = product.quantity || 0;
        const threshold = product.lowStockThreshold || 5;
        let status = 'متوفر';
        if (quantity === 0) status = 'نفد';
        else if (quantity <= threshold) status = 'منخفض';

        return [
          product.id,
          product.name,
          categoryMap[product.category] || product.category,
          product.sku || '',
          quantity.toString(),
          threshold.toString(),
          status,
          product.price?.toString() || '0',
          (quantity * (product.price || 0)).toString(),
        ];
      });

      // إضافة صف الإجمالي
      const totalValue = products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.price || 0)), 0);
      const totalItems = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
      rows.push(['', 'الإجمالي', '', '', totalItems.toString(), '', '', '', totalValue.toString()]);

      data = [headers.join(','), ...rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )].join('\n');
      
      filename = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;

    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // إضافة BOM للدعم العربي في Excel
    const bom = '\uFEFF';
    const csvContent = bom + data;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
