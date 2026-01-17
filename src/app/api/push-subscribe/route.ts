import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

// نموذج بسيط لحفظ اشتراكات الإشعارات
import mongoose from 'mongoose';

const PushSubscriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userRole: { type: String, default: 'admin' },
  subscription: {
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  createdAt: { type: Date, default: Date.now },
});

const PushSubscription = mongoose.models.PushSubscription || 
  mongoose.model('PushSubscription', PushSubscriptionSchema);

// POST - حفظ اشتراك جديد
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { userId, subscription, userRole } = body;

    if (!userId || !subscription) {
      return NextResponse.json(
        { success: false, message: 'userId and subscription are required' },
        { status: 400 }
      );
    }

    // حذف الاشتراك القديم إن وجد
    await PushSubscription.deleteMany({ userId });

    // إنشاء اشتراك جديد
    const newSubscription = await PushSubscription.create({
      userId,
      userRole: userRole || 'admin',
      subscription,
    });

    return NextResponse.json({
      success: true,
      message: 'تم تفعيل الإشعارات بنجاح',
      data: newSubscription,
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save subscription', error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - إلغاء الاشتراك
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }

    await PushSubscription.deleteMany({ userId });

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء الإشعارات',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}

// GET - جلب الاشتراكات (للأدمن فقط)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const query: any = {};
    if (role) query.userRole = role;

    const subscriptions = await PushSubscription.find(query).lean();

    return NextResponse.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
