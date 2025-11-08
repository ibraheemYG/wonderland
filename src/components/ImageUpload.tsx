'use client';

import { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const file = files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5242880) {
      setError('حجم الملف أكبر من 5MB');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل رفع الصورة');
      }

      const data = await response.json();
      const imageUrl = data.secure_url;
      
      setUploadedImage(imageUrl);
      setIsUploading(false);

      if (onUploadSuccess) {
        onUploadSuccess(imageUrl);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setIsUploading(false);
      setError('فشل رفع الصورة. حاول مرة أخرى.');
      console.error('Upload error:', err);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition font-semibold disabled:opacity-50"
        disabled={isUploading}
      >
        {isUploading ? '⏳ جاري الرفع...' : '📤 رفع صورة'}
      </button>

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
