import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order, { generateOrderNumber } from '@/models/Order';
import Notification from '@/models/Notification';
import { Coupon } from '@/models/Coupon';

// GET - جلب الطلبات
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');
    const isAdmin = searchParams.get('isAdmin') === 'true';
    const status = searchParams.get('status');

    // جلب طلب واحد
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return NextResponse.json({ success: false, message: 'الطلب غير موجود' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: order });
    }

    // جلب كل الطلبات (للأدمن)
    if (isAdmin) {
      const query: any = {};
      if (status) query.status = status;
      
      const orders = await Order.find(query).sort({ createdAt: -1 });
      const stats = {
        total: await Order.countDocuments(),
        pending: await Order.countDocuments({ status: 'pending' }),
        confirmed: await Order.countDocuments({ status: 'confirmed' }),
        processing: await Order.countDocuments({ status: 'processing' }),
        shipped: await Order.countDocuments({ status: 'shipped' }),
        delivered: await Order.countDocuments({ status: 'delivered' }),
        cancelled: await Order.countDocuments({ status: 'cancelled' }),
      };
      return NextResponse.json({ success: true, data: orders, stats });
    }

    // جلب طلبات المستخدم
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId مطلوب' }, { status: 400 });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST - إنشاء طلب جديد
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      subtotal,
      discount = 0,
      discountReason,
      couponCode,
      couponDiscount = 0,
      shippingCost = 0,
      total,
      paymentMethod = 'cash_on_delivery',
      notes,
    } = body;

    // التحقق من البيانات المطلوبة
    if (!userId || !customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'جميع البيانات مطلوبة' },
        { status: 400 }
      );
    }

    // إنشاء الطلب
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      subtotal,
      discount,
      discountReason,
      couponCode,
      couponDiscount,
      shippingCost,
      total,
      paymentMethod,
      notes,
    });

    // زيادة عدد استخدام الكوبون إذا تم استخدامه
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    // إرسال إشعار للأدمن
    // نحتاج جلب كل الأدمنز وإرسال إشعار لكل واحد
    // هنا نفترض أن الأدمن له userId معين أو نستخدم طريقة أخرى
    await Notification.create({
      userId: 'admin', // يمكن تغييرها لإرسال لكل الأدمنز
      title: '🛒 طلب جديد!',
      message: `طلب جديد #${order.orderNumber} من ${customerName} بقيمة ${total.toLocaleString()} د.ع`,
      type: 'order',
      link: `/admin/orders?id=${order._id}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        total,
      },
    });

    return NextResponse.json(
      { success: true, data: order, message: 'تم إنشاء الطلب بنجاح' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT - تحديث حالة الطلب
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { orderId, status, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'orderId مطلوب' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

    if (!order) {
      return NextResponse.json({ success: false, message: 'الطلب غير موجود' }, { status: 404 });
    }

    // إرسال إشعار للمستخدم عند تغيير الحالة
    const statusMessages: Record<string, string> = {
      confirmed: 'تم تأكيد طلبك',
      processing: 'طلبك قيد التجهيز',
      shipped: 'تم شحن طلبك',
      delivered: 'تم توصيل طلبك',
      cancelled: 'تم إلغاء طلبك',
    };

    if (status && statusMessages[status]) {
      await Notification.create({
        userId: order.userId,
        title: `📦 تحديث الطلب #${order.orderNumber}`,
        message: statusMessages[status],
        type: 'order',
        link: `/orders?id=${order._id}`,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status,
        },
      });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE - حذف طلب
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'id مطلوب' }, { status: 400 });
    }

    await Order.findByIdAndDelete(orderId);

    return NextResponse.json({ success: true, message: 'تم حذف الطلب' });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
