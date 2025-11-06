import { SurveyResponse } from '@/data/survey';
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// مسار الملف الذي سيتم حفظ الاستبانات فيه
const SURVEYS_FILE = path.join(process.cwd(), 'public', 'surveys.json');

// قراءة الاستبانات الموجودة
function loadSurveys(): SurveyResponse[] {
  try {
    if (fs.existsSync(SURVEYS_FILE)) {
      const data = fs.readFileSync(SURVEYS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading surveys:', error);
  }
  return [];
}

// حفظ الاستبانات
function saveSurveys(surveys: SurveyResponse[]): boolean {
  try {
    const dir = path.dirname(SURVEYS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SURVEYS_FILE, JSON.stringify(surveys, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving surveys:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const surveyData = await request.json();

    // التحقق من البيانات المطلوبة
    if (!surveyData.furnitureType || !surveyData.purchaseFrequency) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // إنشاء استجابة جديدة
    const newSurvey: SurveyResponse = {
      id: `survey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...surveyData,
      timestamp: Date.now(),
      userAgent: request.headers.get('user-agent') || undefined,
    };

    // تحميل الاستبانات الموجودة
    const surveys = loadSurveys();

    // إضافة الاستبانة الجديدة
    surveys.push(newSurvey);

    // حفظ الاستبانات
    const saved = saveSurveys(surveys);

    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Failed to save survey' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Survey saved successfully',
        surveyId: newSurvey.id,
        totalSurveys: surveys.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Survey submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint لاسترجاع إحصائيات الاستبانات (للأدمن فقط)
export async function GET(request: NextRequest) {
  try {
    const surveys = loadSurveys();
    return NextResponse.json({
      success: true,
      totalSurveys: surveys.length,
      surveys: surveys,
    });
  } catch (error) {
    console.error('Error retrieving surveys:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve surveys' },
      { status: 500 }
    );
  }
}
