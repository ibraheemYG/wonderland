import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Review } from '@/models/Review';
import { Product } from '@/models/Product';

// GET - جلب تقييمات منتج معين
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'productId مطلوب' },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .lean();

    // حساب متوسط التقييم
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return NextResponse.json({
      success: true,
      data: reviews,
      stats: {
        total: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - إضافة تقييم جديد
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { productId, userId, userName, userEmail, rating, comment, images } = body;

    // التحقق من البيانات المطلوبة
    if (!productId || !userId || !userName || !userEmail || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: 'جميع البيانات مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من صحة التقييم
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'التقييم يجب أن يكون بين 1 و 5' },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود تقييم سابق من نفس المستخدم
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'لقد قمت بتقييم هذا المنتج مسبقاً' },
        { status: 400 }
      );
    }

    // إنشاء التقييم
    const review = await Review.create({
      productId,
      userId,
      userName,
      userEmail,
      rating,
      comment,
      images: images || [],
    });

    // تحديث متوسط تقييم المنتج
    const allReviews = await Review.find({ productId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await Product.findOneAndUpdate(
      { id: productId },
      { rating: Math.round(averageRating * 10) / 10 }
    );

    return NextResponse.json({
      success: true,
      data: review,
      message: 'تم إضافة تقييمك بنجاح',
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    
    // معالجة خطأ التقييم المكرر
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'لقد قمت بتقييم هذا المنتج مسبقاً' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - حذف تقييم (للأدمن أو صاحب التقييم)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!reviewId) {
      return NextResponse.json(
        { success: false, message: 'id مطلوب' },
        { status: 400 }
      );
    }

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'التقييم غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من صلاحية الحذف (صاحب التقييم فقط)
    if (userId && review.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بحذف هذا التقييم' },
        { status: 403 }
      );
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(reviewId);

    // تحديث متوسط تقييم المنتج
    const remainingReviews = await Review.find({ productId });
    if (remainingReviews.length > 0) {
      const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / remainingReviews.length;
      await Product.findOneAndUpdate(
        { id: productId },
        { rating: Math.round(averageRating * 10) / 10 }
      );
    } else {
      await Product.findOneAndUpdate(
        { id: productId },
        { rating: 0 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف التقييم',
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
