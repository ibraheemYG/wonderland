import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { UserPoints } from '@/models/UserPoints';

// نسبة النقاط: 1 نقطة لكل 1000 دينار
const POINTS_PER_1000_IQD = 1;
// قيمة النقطة عند الاستبدال: 100 دينار لكل نقطة
const IQD_PER_POINT = 100;

// GET - جلب نقاط المستخدم
export async function GET(request: NextRequest) {
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

    const existingPoints = await UserPoints.findOne({ userId }).lean() as { 
      userId: string; 
      totalPoints: number; 
      lifetimePoints: number; 
      transactions: unknown[] 
    } | null;

    const userPointsData = existingPoints || {
      userId,
      totalPoints: 0,
      lifetimePoints: 0,
      transactions: [],
    };

    return NextResponse.json({
      success: true,
      data: {
        ...userPointsData,
        pointsValue: userPointsData.totalPoints * IQD_PER_POINT,
        pointsPerOrder: POINTS_PER_1000_IQD,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch points', error: String(error) },
      { status: 500 }
    );
  }
}

// POST - إضافة/استبدال نقاط
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { userId, type, points, description, orderId, orderAmount } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { success: false, message: 'userId and type are required' },
        { status: 400 }
      );
    }

    let userPoints = await UserPoints.findOne({ userId });

    if (!userPoints) {
      userPoints = new UserPoints({
        userId,
        totalPoints: 0,
        lifetimePoints: 0,
        transactions: [],
      });
    }

    let pointsToAdd = points;
    let transactionDescription = description;

    if (type === 'earned') {
      // حساب النقاط من مبلغ الطلب
      if (orderAmount) {
        pointsToAdd = Math.floor(orderAmount / 1000) * POINTS_PER_1000_IQD;
        transactionDescription = description || `نقاط من طلب #${orderId}`;
      }
      userPoints.totalPoints += pointsToAdd;
      userPoints.lifetimePoints += pointsToAdd;
    } else if (type === 'redeemed') {
      // استبدال النقاط
      if (userPoints.totalPoints < points) {
        return NextResponse.json(
          { success: false, message: 'رصيد النقاط غير كافٍ' },
          { status: 400 }
        );
      }
      userPoints.totalPoints -= points;
      pointsToAdd = -points;
      transactionDescription = description || 'استبدال نقاط';
    } else if (type === 'expired') {
      userPoints.totalPoints = Math.max(0, userPoints.totalPoints - points);
      pointsToAdd = -points;
    }

    userPoints.transactions.push({
      type,
      points: Math.abs(pointsToAdd),
      description: transactionDescription,
      orderId,
      createdAt: new Date(),
    });

    await userPoints.save();

    return NextResponse.json({
      success: true,
      message: type === 'earned' ? `تم إضافة ${pointsToAdd} نقطة` : `تم استبدال ${points} نقطة`,
      data: {
        totalPoints: userPoints.totalPoints,
        lifetimePoints: userPoints.lifetimePoints,
        pointsValue: userPoints.totalPoints * IQD_PER_POINT,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update points', error: String(error) },
      { status: 500 }
    );
  }
}
