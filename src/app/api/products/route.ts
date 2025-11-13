import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';

export async function GET() {
  try {
    await connectDB();
    
    const products = await Product.find().sort({ createdAt: -1 });
    
    console.log('✅ Products fetched from MongoDB:', products.length);
    
    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: name, price, category' },
        { status: 400 }
      );
    }
    
    // التحقق من عدم وجود منتج بنفس الـ ID
    if (body.id) {
      const existing = await Product.findOne({ id: body.id });
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Product with this ID already exists' },
          { status: 400 }
        );
      }
    }
    
    const imagesArray = Array.isArray(body.images) && body.images.length > 0
      ? body.images
      : (body.imageUrl ? [body.imageUrl] : []);

    const newProduct = new Product({
      id: body.id || Date.now().toString(),
      name: body.name,
      price: body.price,
      imageUrl: imagesArray[0] || body.imageUrl || undefined,
      images: imagesArray,
      mainImageIndex: typeof body.mainImageIndex === 'number' ? body.mainImageIndex : 0,
      videos: Array.isArray(body.videos) ? body.videos : [],
      threeD: body.threeD || undefined,
      category: body.category,
      description: body.description,
      rating: body.rating,
      originalPrice: body.originalPrice,
      isCustom: body.isCustom !== false,
    });
    
    await newProduct.save();
    
    console.log('✅ Product created:', newProduct.id);
    
    return NextResponse.json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    const result = await Product.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Product deleted:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product', error: String(error) },
      { status: 500 }
    );
  }
}
