import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Admin } from '@/models/Admin';

export async function GET() {
  try {
    await connectDB();
    
    const admins = await Admin.find().sort({ createdAt: -1 });
    
    console.log('✅ Admins fetched from MongoDB:', admins.length);
    
    return NextResponse.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error('❌ Error fetching admins:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admins', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }
    
    // التحقق من عدم وجود admin بنفس البريد الإلكتروني
    const existingAdmin = await Admin.findOne({ email: body.email });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin with this email already exists' },
        { status: 400 }
      );
    }
    
    const admin = new Admin({
      email: body.email,
      role: body.role || 'admin',
      name: body.name,
    });
    
    const savedAdmin = await admin.save();
    
    console.log('✅ Admin created:', savedAdmin._id);
    
    return NextResponse.json({
      success: true,
      data: savedAdmin,
    });
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create admin', error: String(error) },
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
        { success: false, message: 'ID is required' },
        { status: 400 }
      );
    }
    
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    
    if (!deletedAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Admin deleted:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting admin:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete admin', error: String(error) },
      { status: 500 }
    );
  }
}
