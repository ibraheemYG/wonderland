import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Coupon } from '@/models/Coupon';

// GET - جلب الكوبونات
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    if (code) {
      // البحث عن كوبون محدد
      const coupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      }).lean() as { usageLimit?: number; usedCount?: number } | null;

      if (!coupon) {
        return NextResponse.json(
          { success: false, message: 'كود الخصم غير صالح أو منتهي' },
          { status: 404 }
        );
      }

      // تحقق من عدد الاستخدامات
      if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
        return NextResponse.json(
          { success: false, message: 'تم استنفاد عدد استخدامات هذا الكود' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: coupon,
      });
    }

    // جلب جميع الكوبونات (للأدمن)
    const query: any = {};
    if (activeOnly) {
      query.isActive = true;
      query.validUntil = { $gte: new Date() };
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch coupons', error: String(error) },
      { status: 500 }
    );
  }
}

// POST - إنشاء كوبون جديد
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { code, discountType, discountValue, validFrom, validUntil } = body;

    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // تحقق من عدم وجود الكود مسبقاً
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, message: 'كود الخصم موجود بالفعل' },
        { status: 400 }
      );
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: body.minOrderAmount,
      maxDiscount: body.maxDiscount,
      usageLimit: body.usageLimit,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      isActive: body.isActive !== false,
      applicableCategories: body.applicableCategories || [],
    });

    await coupon.save();

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء كود الخصم بنجاح',
      data: coupon,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create coupon', error: String(error) },
      { status: 500 }
    );
  }
}

// PUT - تحديث كوبون
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true }
    );

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث كود الخصم',
      data: coupon,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update coupon', error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - حذف كوبون
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const result = await Coupon.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف كود الخصم',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete coupon', error: String(error) },
      { status: 500 }
    );
  }
}
