import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
// @ts-ignore
import webpush from 'web-push';

// إعداد Web Push
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@wonderland.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// نموذج الاشتراكات
const PushSubscriptionSchema = new mongoose.Schema({
  userId: String,
  userRole: String,
  subscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String,
    },
  },
  createdAt: Date,
});

const PushSubscription = mongoose.models.PushSubscription || 
  mongoose.model('PushSubscription', PushSubscriptionSchema);

// POST - إرسال إشعار
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, message, url, targetRole, targetUserId, type } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'title and message are required' },
        { status: 400 }
      );
    }

    // بناء query للمستهدفين
    const query: any = {};
    if (targetRole) query.userRole = targetRole;
    if (targetUserId) query.userId = targetUserId;

    // جلب الاشتراكات
    const subscriptions = await PushSubscription.find(query).lean();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'لا يوجد مشتركين',
        sent: 0,
      });
    }

    // بيانات الإشعار
    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: type || 'notification',
      data: { url: url || '/admin-app', type },
    });

    // إرسال الإشعارات
    const results = await Promise.allSettled(
      subscriptions.map(async (sub: any) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          return { success: true, userId: sub.userId };
        } catch (error: any) {
          // إذا انتهت صلاحية الاشتراك، احذفه
          if (error.statusCode === 410 || error.statusCode === 404) {
            await PushSubscription.deleteOne({ _id: sub._id });
          }
          return { success: false, userId: sub.userId, error: error.message };
        }
      })
    );

    const successful = results.filter(
      (r) => r.status === 'fulfilled' && (r.value as any).success
    ).length;

    return NextResponse.json({
      success: true,
      message: `تم إرسال ${successful} إشعار`,
      sent: successful,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send notification', error: String(error) },
      { status: 500 }
    );
  }
}
