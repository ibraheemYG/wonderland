import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Survey } from '@/models/Survey';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');
    
    // التحقق من وجود استبيان للمستخدم
    if (email || userId) {
      const query: any = {};
      if (email) query.email = email;
      if (userId) query.userId = userId;
      
      const survey = await Survey.findOne(query);
      return NextResponse.json({
        success: true,
        hasSurvey: !!survey,
        data: survey,
      });
    }
    
    // جلب كل الاستبيانات (للأدمن)
    const surveys = await Survey.find().sort({ createdAt: -1 });
    
    console.log('✅ Surveys fetched from MongoDB:', surveys.length);
    
    return NextResponse.json({
      success: true,
      data: surveys,
    });
  } catch (error) {
    console.error('❌ Error fetching surveys:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch surveys', error: String(error) },
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
    
    const survey = new Survey({
      email: body.email,
      preferences: body.preferences || { categories: [], styles: [], colors: [] },
      budget: body.budget,
      timeline: body.timeline,
      additionalNotes: body.additionalNotes,
    });
    
    const savedSurvey = await survey.save();
    
    console.log('✅ Survey created:', savedSurvey._id);
    
    return NextResponse.json({
      success: true,
      data: savedSurvey,
    });
  } catch (error) {
    console.error('❌ Error creating survey:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create survey', error: String(error) },
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
    
    const deletedSurvey = await Survey.findByIdAndDelete(id);
    
    if (!deletedSurvey) {
      return NextResponse.json(
        { success: false, message: 'Survey not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Survey deleted:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Survey deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting survey:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete survey', error: String(error) },
      { status: 500 }
    );
  }
}
