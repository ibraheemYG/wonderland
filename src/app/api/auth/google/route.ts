import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 400 }
      );
    }

    // Verify token with Google
    const response = await fetch('https://oauth2.googleapis.com/tokeninfo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `id_token=${token}`,
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const googleData = await response.json();

    const userData = {
      id: Math.floor(Math.random() * 10000),
      username: googleData.email?.split('@')[0] || 'google-user',
      name: googleData.name || 'Google User',
      email: googleData.email,
      role: 'user' as const,
      googleAuth: true,
    };

    return NextResponse.json({
      success: true,
      user: userData,
      email: googleData.email,
      name: googleData.name,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return Google Client ID for client-side use
    return NextResponse.json({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error' },
      { status: 500 }
    );
  }
}
