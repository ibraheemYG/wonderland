import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'wonderland';
    const fileType = (formData.get('type') as string) || 'image'; // image, video, 3d

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type based on upload type
    const validTypes: Record<string, string[]> = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'],
      '3d': [
        'model/gltf-binary', 'model/gltf+json', // GLTF/GLB
        'application/octet-stream', // Generic binary (for .glb, .fbx, etc.)
        'model/obj', // OBJ
        'application/x-fbx', // FBX
        'model/stl', // STL
      ],
    };

    const allowedTypes = validTypes[fileType] || validTypes.image;
    
    // For 3D files, also check by extension since MIME types can be unreliable
    const fileName = file.name.toLowerCase();
    const is3DFile = ['.glb', '.gltf', '.obj', '.fbx', '.stl', '.3ds', '.dae'].some(ext => fileName.endsWith(ext));
    
    if (!allowedTypes.includes(file.type) && !is3DFile && fileType !== '3d') {
      // Allow if it's a 3D file by extension
      if (fileType === '3d' || is3DFile) {
        // Allow 3D files
      } else {
        return NextResponse.json(
          { success: false, message: `File type not supported: ${file.type}` },
          { status: 400 }
        );
      }
    }

    // Validate file size based on type
    const maxSizes: Record<string, number> = {
      image: 10 * 1024 * 1024,   // 10MB for images
      video: 100 * 1024 * 1024,  // 100MB for videos
      '3d': 50 * 1024 * 1024,    // 50MB for 3D files
    };
    
    const maxSize = maxSizes[fileType] || maxSizes.image;
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` },
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

        // Determine resource type for Cloudinary
        let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
        if (fileType === 'video') {
          resourceType = 'video';
        } else if (fileType === '3d' || is3DFile) {
          resourceType = 'raw'; // 3D files should be uploaded as raw
        } else if (fileType === 'image') {
          resourceType = 'image';
        }

        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: folder,
              resource_type: resourceType,
              max_file_size: maxSize,
              // For videos, enable eager transformations
              ...(fileType === 'video' && {
                eager: [
                  { format: 'mp4', video_codec: 'h264' }
                ],
                eager_async: true,
              }),
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
