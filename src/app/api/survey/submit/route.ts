import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Survey } from '@/models/Survey';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const surveyData = await request.json();

    // التحقق من البيانات المطلوبة - على الأقل email
    if (!surveyData.email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const newSurvey = new Survey({
      userId: surveyData.userId,
      userName: surveyData.name,
      email: surveyData.email,
      preferences: {
        categories: surveyData.furnitureType || [],
        styles: surveyData.styles || [],
        colors: surveyData.colors || [],
      },
      budget: surveyData.budget,
      timeline: surveyData.timeline,
      additionalNotes: surveyData.appWishlist || surveyData.mainConcern,
    });

    const savedSurvey = await newSurvey.save();

    console.log('✅ Survey saved to MongoDB:', savedSurvey._id);

    return NextResponse.json(
      {
        success: true,
        message: 'Survey saved successfully',
        surveyId: savedSurvey._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Survey submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}
