import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limitParam = searchParams.get('limit');
    const category = searchParams.get('category');

    if (id) {
      // البحث بـ id المخصص أو _id الافتراضي من MongoDB
      let product = await Product.findOne({ id }).lean();
      
      // إذا لم يتم العثور عليه بـ id، جرب البحث بـ _id
      if (!product && mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id).lean();
      }
      
      if (!product) {
        console.log('❌ Product not found for id:', id);
        return NextResponse.json(
          { success: false, message: 'Product not found' },
          { status: 404 }
        );
      }

      console.log('✅ Product fetched by id:', id);

      return NextResponse.json({
        success: true,
        data: product,
      });
    }

    const query: Record<string, string> = {};
    if (category) {
      query.category = category;
    }

    // استخدام lean() للحصول على كائنات JavaScript عادية بدلاً من Mongoose documents
    // هذا أسرع بكثير لأنه يتجنب overhead الـ Mongoose
    let cursor = Product.find(query)
      .sort({ createdAt: -1 })
      .select('id _id name price imageUrl images category rating originalPrice') // جلب الحقول المطلوبة فقط
      .lean();

    if (limitParam) {
      const limit = Number(limitParam);
      if (!Number.isNaN(limit) && limit > 0) {
        cursor = cursor.limit(limit);
      }
    }

    const products = await cursor;
    
    // التأكد من أن كل منتج لديه id
    const productsWithId = products.map((p: any) => ({
      ...p,
      id: p.id || p._id?.toString(),
    }));

    console.log('✅ Products fetched from MongoDB:', productsWithId.length);

    // إضافة Cache headers لتسريع الطلبات المتكررة
    const response = NextResponse.json({
      success: true,
      data: productsWithId,
    });
    
    // Cache لمدة 60 ثانية مع إعادة التحقق في الخلفية
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return response;
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
      images: imagesArray,
      imageUrl: imagesArray[0] || body.imageUrl || undefined,
      mainImageIndex: typeof body.mainImageIndex === 'number' ? body.mainImageIndex : 0,
      videos: Array.isArray(body.videos) ? body.videos : [],
      threeD: body.threeD || undefined,
      sketchfabId: body.sketchfabId || undefined,
      category: body.category,
      description: body.description,
      descriptionAlign: body.descriptionAlign || 'right',
      rating: body.rating,
      originalPrice: body.originalPrice,
      isCustom: body.isCustom !== false,
      // الحقول الجديدة
      dimensions: body.dimensions ? {
        width: body.dimensions.width || undefined,
        height: body.dimensions.height || undefined,
        depth: body.dimensions.depth || undefined,
        unit: body.dimensions.unit || 'cm',
      } : undefined,
      bedroomPieces: body.bedroomPieces || undefined,
      weight: body.weight || undefined,
      material: body.material || undefined,
      color: body.color || undefined,
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

export async function PUT(request: NextRequest) {
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
    
    const body = await request.json();
    
    // البحث عن المنتج
    let product = await Product.findOne({ id });
    
    // إذا لم يتم العثور عليه بـ id، جرب البحث بـ _id
    if (!product && mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // تحديث الحقول
    const imagesArray = Array.isArray(body.images) && body.images.length > 0
      ? body.images
      : product.images;

    product.name = body.name || product.name;
    product.price = body.price ?? product.price;
    product.images = imagesArray;
    product.imageUrl = imagesArray[0] || product.imageUrl;
    product.mainImageIndex = typeof body.mainImageIndex === 'number' ? body.mainImageIndex : product.mainImageIndex;
    product.videos = Array.isArray(body.videos) ? body.videos : product.videos;
    product.threeD = body.threeD !== undefined ? body.threeD : product.threeD;
    product.sketchfabId = body.sketchfabId !== undefined ? body.sketchfabId : product.sketchfabId;
    
    console.log('📥 Received videos:', body.videos, 'threeD:', body.threeD);
    console.log('📦 Saving videos:', product.videos, 'threeD:', product.threeD);
    product.category = body.category || product.category;
    product.description = body.description !== undefined ? body.description : product.description;
    product.quantity = body.quantity ?? product.quantity;
    product.discount = body.discount ?? product.discount;
    
    // تحديث الحقول الإضافية
    if (body.dimensions) {
      product.dimensions = {
        width: body.dimensions.width || undefined,
        height: body.dimensions.height || undefined,
        depth: body.dimensions.depth || undefined,
        unit: body.dimensions.unit || 'cm',
      };
    }
    if (body.bedroomPieces !== undefined) {
      product.bedroomPieces = body.bedroomPieces;
    }
    product.descriptionAlign = body.descriptionAlign !== undefined ? body.descriptionAlign : product.descriptionAlign;
    product.weight = body.weight !== undefined ? body.weight : product.weight;
    product.material = body.material !== undefined ? body.material : product.material;
    product.color = body.color !== undefined ? body.color : product.color;
    
    await product.save();
    
    console.log('✅ Product updated:', id);
    
    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product', error: String(error) },
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
