import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Survey } from '@/models/Survey';

// GET - جلب المستخدمين
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    // جلب مستخدم واحد
    if (email || userId) {
      const query: any = {};
      if (email) query.email = email;
      if (userId) query._id = userId;
      
      const user = await User.findOne(query);
      
      // جلب استبيان المستخدم إن وجد
      let survey = null;
      if (user?.email) {
        survey = await Survey.findOne({ email: user.email });
      }
      
      return NextResponse.json({
        success: true,
        data: user,
        survey,
      });
    }

    // جلب كل المستخدمين (للأدمن)
    const users = await User.find().sort({ createdAt: -1 });
    
    // جلب الاستبيانات لكل المستخدمين
    const emails = users.map(u => u.email);
    const surveys = await Survey.find({ email: { $in: emails } });
    
    // ربط الاستبيانات بالمستخدمين
    const usersWithSurveys = users.map(user => {
      const userSurvey = surveys.find(s => s.email === user.email);
      return {
        ...user.toObject(),
        survey: userSurvey || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: usersWithSurveys,
      total: users.length,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST - إنشاء أو تحديث مستخدم
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, name, phone, country, googleId, furniturePreferences } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }

    // التحقق إذا المستخدم موجود
    let user = await User.findOne({ email });

    if (user) {
      // تحديث المستخدم
      user = await User.findOneAndUpdate(
        { email },
        { 
          name: name || user.name,
          phone: phone || user.phone,
          country: country || user.country,
          googleId: googleId || user.googleId,
          furniturePreferences: furniturePreferences || user.furniturePreferences,
        },
        { new: true }
      );
    } else {
      // إنشاء مستخدم جديد
      user = await User.create({
        email,
        name: name || email.split('@')[0],
        phone,
        country,
        googleId,
        furniturePreferences,
        role: 'user',
      });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT - تحديث دور المستخدم
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ success: false, message: 'userId و role مطلوبين' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE - حذف مستخدم
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'id مطلوب' }, { status: 400 });
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true, message: 'تم حذف المستخدم' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
