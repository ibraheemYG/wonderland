import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

// GET - جلب إشعارات المستخدم
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('isAdmin') === 'true';
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId مطلوب' }, { status: 400 });
    }

    // إذا كان أدمن، جلب إشعارات الأدمن
    const queryUserId = isAdmin ? 'admin' : userId;
    const query: any = { userId: queryUserId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ userId: queryUserId, read: false });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST - إنشاء إشعار جديد
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, title, message, type, link, data } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { success: false, message: 'userId, title, message مطلوبين' },
        { status: 400 }
      );
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || 'system',
      link,
      data,
    });

    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT - تحديث حالة القراءة
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { notificationId, userId, markAllRead, isAdmin } = body;

    if (markAllRead && userId) {
      // تحديث كل الإشعارات كمقروءة
      const queryUserId = isAdmin ? 'admin' : userId;
      await Notification.updateMany(
        { userId: queryUserId, read: false },
        { read: true }
      );
      return NextResponse.json({ success: true, message: 'تم تحديث جميع الإشعارات' });
    }

    if (!notificationId) {
      return NextResponse.json({ success: false, message: 'notificationId مطلوب' }, { status: 400 });
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ success: false, message: 'الإشعار غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: notification });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE - حذف إشعار
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json({ success: false, message: 'id مطلوب' }, { status: 400 });
    }

    await Notification.findByIdAndDelete(notificationId);

    return NextResponse.json({ success: true, message: 'تم حذف الإشعار' });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
