'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface ProductGalleryProps {
  images: string[];
  videos?: string[];
  name: string;
}

export default function ProductGallery({ images, videos = [], name }: ProductGalleryProps) {
  // دمج الصور والفيديوهات في قائمة واحدة
  const mediaItems: MediaItem[] = [
    ...images.map(url => ({ type: 'image' as const, url })),
    ...videos.map(url => ({ type: 'video' as const, url })),
  ];
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const active = mediaItems[activeIndex] ?? mediaItems[0];

  // إغلاق بـ Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        setZoom(1);
      }
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % mediaItems.length);
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, mediaItems.length]);

  // منع التمرير عند فتح Lightbox
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  const openLightbox = () => {
    setIsLightboxOpen(true);
    setZoom(1);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoom(1);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % mediaItems.length);
    setZoom(1);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    setZoom(1);
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => (prev === 1 ? 2 : 1));
  };

  return (
    <>
      <div className="space-y-4">
        {/* العنصر الرئيسي - صورة أو فيديو */}
        <div 
          onClick={active?.type === 'image' ? openLightbox : undefined}
          className={`relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 group ${active?.type === 'image' ? 'cursor-zoom-in' : ''}`}
        >
          {active?.type === 'video' ? (
            <video
              ref={videoRef}
              src={active.url}
              controls
              className="w-full h-full object-cover"
              poster={images[0]}
            >
              متصفحك لا يدعم تشغيل الفيديو
            </video>
          ) : (
            <>
              <Image src={active?.url || images[0]} alt={name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
              {/* أيقونة التكبير */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-900/90 p-3 rounded-full shadow-lg">
                  <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* الصور والفيديوهات المصغرة */}
        {mediaItems.length > 1 && (
          <div className="grid grid-cols-5 gap-3">
            {mediaItems.map((item, idx) => (
              <button
                key={`${item.url}-${idx}`}
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  idx === activeIndex ? 'border-primary shadow-lg ring-2 ring-primary/30' : 'border-transparent hover:border-primary/40'
                }`}
                aria-label={item.type === 'video' ? `عرض الفيديو ${idx + 1}` : `عرض الصورة ${idx + 1}`}
                type="button"
              >
                {item.type === 'video' ? (
                  <div className="relative w-full h-full bg-gray-800">
                    <video src={item.url} className="w-full h-full object-cover" muted />
                    {/* أيقونة الفيديو */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <Image src={item.url} alt={`${name} ${idx + 1}`} fill sizes="120px" className="object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* زر الإغلاق */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="إغلاق"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* عداد الوسائط */}
          <div className="absolute top-4 left-4 z-50 bg-white/10 px-4 py-2 rounded-full text-white text-sm">
            {activeIndex + 1} / {mediaItems.length}
          </div>

          {/* أزرار التحكم */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
            <button
              onClick={toggleZoom}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label={zoom === 1 ? 'تكبير' : 'تصغير'}
            >
              {zoom === 1 ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              )}
            </button>
          </div>

          {/* زر السابق */}
          {mediaItems.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="العنصر السابق"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* زر التالي */}
          {mediaItems.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="الصورة التالية"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* العنصر الكبير - صورة أو فيديو */}
          <div 
            className={`relative w-full h-full max-w-5xl max-h-[85vh] m-4 transition-transform duration-300 ${active?.type === 'image' ? (zoom === 2 ? 'cursor-zoom-out' : 'cursor-zoom-in') : ''}`}
            onClick={active?.type === 'image' ? toggleZoom : undefined}
          >
            {active?.type === 'video' ? (
              <video
                src={active.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            ) : (
              <Image
                src={active?.url || images[0]}
                alt={name}
                fill
                sizes="100vw"
                className={`object-contain transition-transform duration-300 ${zoom === 2 ? 'scale-150' : 'scale-100'}`}
                priority
              />
            )}
          </div>

          {/* المصغرات في الأسفل */}
          {mediaItems.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/50 p-2 rounded-xl">
              {mediaItems.map((item, idx) => (
                <button
                  key={`lightbox-${item.url}-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(idx);
                    setZoom(1);
                  }}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activeIndex ? 'border-white shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {item.type === 'video' ? (
                    <div className="relative w-full h-full bg-gray-800">
                      <video src={item.url} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <Image src={item.url} alt={`${name} ${idx + 1}`} fill sizes="64px" className="object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
