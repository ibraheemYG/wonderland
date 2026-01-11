import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Wishlist } from '@/models/Wishlist';

// GET - جلب قائمة المفضلة للمستخدم
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

    const wishlist = await Wishlist.findOne({ userId }).lean() as { items?: { productId: string; addedAt: Date }[] } | null;

    return NextResponse.json({
      success: true,
      data: wishlist?.items || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wishlist', error: String(error) },
      { status: 500 }
    );
  }
}

// POST - إضافة منتج للمفضلة
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, message: 'userId and productId are required' },
        { status: 400 }
      );
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        items: [{ productId, addedAt: new Date() }],
      });
    } else {
      // تحقق من عدم وجود المنتج مسبقاً
      const exists = wishlist.items.some((item: any) => item.productId === productId);
      if (exists) {
        return NextResponse.json({
          success: false,
          message: 'المنتج موجود بالفعل في المفضلة',
        });
      }
      wishlist.items.push({ productId, addedAt: new Date() });
    }

    await wishlist.save();

    return NextResponse.json({
      success: true,
      message: 'تمت الإضافة للمفضلة',
      data: wishlist.items,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to add to wishlist', error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - حذف منتج من المفضلة
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, message: 'userId and productId are required' },
        { status: 400 }
      );
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return NextResponse.json(
        { success: false, message: 'Wishlist not found' },
        { status: 404 }
      );
    }

    wishlist.items = wishlist.items.filter((item: any) => item.productId !== productId);
    await wishlist.save();

    return NextResponse.json({
      success: true,
      message: 'تم الحذف من المفضلة',
      data: wishlist.items,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to remove from wishlist', error: String(error) },
      { status: 500 }
    );
  }
}
