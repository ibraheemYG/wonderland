'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface ThreeDViewerProps {
  modelUrl: string;
  showRoom?: boolean;
  poster?: string;
}

export default function ThreeDViewer({ modelUrl, showRoom = true, poster }: ThreeDViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // التحقق إذا كان model-viewer محمل مسبقاً
    if (typeof window !== 'undefined' && customElements.get('model-viewer')) {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (scriptLoaded && containerRef.current) {
      const modelViewer = containerRef.current.querySelector('model-viewer');
      if (modelViewer) {
        modelViewer.addEventListener('load', () => setIsLoading(false));
        modelViewer.addEventListener('error', () => {
          setError('فشل تحميل النموذج');
          setIsLoading(false);
        });
      }
    }
  }, [scriptLoaded, modelUrl]);

  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-100 to-amber-50 dark:from-gray-800 dark:to-gray-900">
        <p className="text-gray-500 dark:text-gray-400">لا يوجد ملف 3D</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-6">
        <p className="text-gray-700 dark:text-gray-300 text-center mb-2">تعذر تحميل النموذج</p>
        <a
          href={modelUrl}
          download
          target="_blank"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          تحميل الملف
        </a>
      </div>
    );
  }

  return (
    <>
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
        onLoad={() => setScriptLoaded(true)}
      />
      
      <div ref={containerRef} className="w-full h-full relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-100 to-amber-50 dark:from-gray-800 dark:to-gray-900 z-10">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">جاري تحميل النموذج...</p>
            </div>
          </div>
        )}
        
        {scriptLoaded && (
          // @ts-expect-error - model-viewer is a custom web component
          <model-viewer
            src={modelUrl}
            poster={poster || ''}
            alt="3D Model"
            auto-rotate
            camera-controls
            touch-action="pan-y"
            interaction-prompt="none"
            shadow-intensity="1"
            shadow-softness="1"
            exposure="1"
            environment-image="neutral"
            style={{
              width: '100%',
              height: '100%',
              background: showRoom 
                ? 'linear-gradient(180deg, #e0f2fe 0%, #fef3c7 100%)' 
                : 'transparent',
            } as React.CSSProperties}
          />
        )}
      </div>
    </>
  );
}