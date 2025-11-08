'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import Link from 'next/link';

export default function UploadPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleUploadSuccess = (url: string) => {
    setUploadedImages([...uploadedImages, url]);
    setSuccessMessage('✅ تم رفع الصورة بنجاح!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">📤 رفع الصور</h1>
          <p className="text-white/70">رفع صورك إلى السحابة مع Cloudinary</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-400 rounded-lg text-green-100">
            {successMessage}
          </div>
        )}

        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">رفع صورة جديدة</h2>
            <ImageUpload
              onUploadSuccess={handleUploadSuccess}
              folder="wonderland/products"
            />
          </div>

          {/* Uploaded Images */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">
              الصور المرفوعة ({uploadedImages.length})
            </h2>
            {uploadedImages.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {uploadedImages.map((url, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <p className="text-white/70 text-xs mb-2">صورة {index + 1}</p>
                    <p className="text-white/50 text-xs break-all font-mono">
                      {url}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-8">لا توجد صور مرفوعة</p>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-500/10 border border-blue-400/50 rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">💡 معلومات الخدمة</h3>
          <ul className="text-white/70 space-y-2">
            <li>✅ تخزين آمن على السحابة (Cloudinary)</li>
            <li>✅ دعم صيغ متعددة (JPG, PNG, WebP, etc)</li>
            <li>✅ حد أقصى 5MB لكل صورة</li>
            <li>✅ روابط دائمة وآمنة</li>
            <li>✅ تحسين تلقائي للصور</li>
          </ul>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-white/60 hover:text-white transition">
            ← العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
