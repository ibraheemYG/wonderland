'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onUploadSuccess?: (url: string) => void;
  folder?: string;
  multiple?: boolean;
}

export default function ImageUpload({
  onUploadSuccess,
  folder = 'wonderland',
  multiple = false,
}: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUploadSuccess = (result: any) => {
    setIsUploading(false);
    const imageUrl = result.info.secure_url;
    setUploadedImage(imageUrl);
    setError('');
    
    if (onUploadSuccess) {
      onUploadSuccess(imageUrl);
    }
  };

  const handleUploadError = (error: any) => {
    setIsUploading(false);
    setError('فشل رفع الصورة. حاول مرة أخرى.');
    console.error('Upload error:', error);
  };

  return (
    <div className="w-full">
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'wonderland'}
        options={{
          folder: folder,
          multiple: multiple,
          sources: ['local', 'url'],
          maxFileSize: 5242880,
        }}
        onSuccess={handleUploadSuccess}
        onError={handleUploadError}
      >
        {({ open }: { open: () => void }) => (
          <button
            onClick={() => {
              setIsUploading(true);
              open();
            }}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition font-semibold disabled:opacity-50"
            disabled={isUploading}
          >
            {isUploading ? '⏳ جاري الرفع...' : '📤 رفع صورة'}
          </button>
        )}
      </CldUploadWidget>

      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-400 rounded-lg text-red-100 text-sm">
          {error}
        </div>
      )}

      {uploadedImage && (
        <div className="mt-6">
          <p className="text-white/70 text-sm mb-2">الصورة المرفوعة:</p>
          <div className="relative w-full h-64 rounded-lg overflow-hidden border border-white/20">
            <Image
              src={uploadedImage}
              alt="Uploaded"
              fill
              className="object-cover"
            />
          </div>
          <p className="text-white/50 text-xs mt-2 break-all">{uploadedImage}</p>
        </div>
      )}
    </div>
  );
}
