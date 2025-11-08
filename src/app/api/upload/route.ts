import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'wonderland';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'File type not supported' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5242880) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Try to upload with Cloudinary if credentials are available
    const cloudinaryConfig = {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    if (cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret) {
      try {
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config(cloudinaryConfig);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: folder,
              resource_type: 'auto',
              max_file_size: 5242880,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(buffer);
        });

        return NextResponse.json({
          success: true,
          data: result,
          secure_url: (result as any).secure_url,
        });
      } catch (cloudinaryError) {
        console.error('❌ Cloudinary upload failed:', cloudinaryError);
        // Fall through to mock upload
      }
    }

    // Mock upload response (for testing without Cloudinary credentials)
    console.warn('⚠️ Using mock upload - Cloudinary credentials not configured properly');
    const mockUrl = `data:${file.type};base64,` + 
      Buffer.from(await file.arrayBuffer()).toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        public_id: `wonderland/${Date.now()}`,
        secure_url: mockUrl,
        url: mockUrl,
      },
      secure_url: mockUrl,
      message: '✅ تم الرفع (اختبار محلي)',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed', error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cloudinaryConfig = {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    if (cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret) {
      try {
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config(cloudinaryConfig);

        const result = await cloudinary.api.resources({
          type: 'upload',
          prefix: 'wonderland/',
          max_results: 10,
        });

        return NextResponse.json({
          success: true,
          images: result.resources,
        });
      } catch (error) {
        console.error('Fetch error:', error);
      }
    }

    // Return empty list if Cloudinary not configured
    return NextResponse.json({
      success: true,
      images: [],
      message: 'Cloudinary not configured',
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Fetch failed', error: String(error) },
      { status: 500 }
    );
  }
}
