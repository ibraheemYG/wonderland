'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SketchfabViewerProps {
  modelId: string;
  autostart?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

export default function SketchfabViewer({ 
  modelId, 
  autostart = true,
  onLoad,
  onError 
}: SketchfabViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [modelId]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    const errorMsg = 'فشل تحميل النموذج ثلاثي الأبعاد';
    setError(errorMsg);
    onError?.(errorMsg);
  };

  // رابط Sketchfab Embed مع إعدادات محسنة
  const embedUrl = `https://sketchfab.com/models/${modelId}/embed?autostart=${autostart ? 1 : 0}&preload=1&ui_theme=dark&ui_infos=0&ui_watermark=0&ui_watermark_link=0`;

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-900 rounded-xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">جاري تحميل النموذج 3D...</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
          <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        title="Sketchfab 3D Viewer"
        src={embedUrl}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        onLoad={handleLoad}
        onError={handleError}
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}

// مكون للبحث عن نماذج Sketchfab
export interface SketchfabModel {
  uid: string;
  name: string;
  thumbnails: {
    images: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  };
  viewerUrl: string;
  user: {
    displayName: string;
    username: string;
  };
  viewCount: number;
  likeCount: number;
  isDownloadable: boolean;
}

interface SketchfabSearchProps {
  onSelectModel: (model: SketchfabModel) => void;
  category?: string;
}

export function SketchfabSearch({ onSelectModel, category = 'furniture' }: SketchfabSearchProps) {
  const [searchQuery, setSearchQuery] = useState(category);
  const [models, setModels] = useState<SketchfabModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchModels = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // استخدام Sketchfab API للبحث
      const response = await fetch(
        `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(query)}&downloadable=false&sort_by=-viewCount&count=12`
      );
      
      if (!response.ok) {
        throw new Error('فشل في البحث');
      }
      
      const data = await response.json();
      setModels(data.results || []);
    } catch (err) {
      console.error('Sketchfab search error:', err);
      setError('فشل في البحث عن النماذج');
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // البحث الافتراضي عند التحميل
    searchModels(category);
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchModels(searchQuery);
  };

  const getThumbnail = (model: SketchfabModel) => {
    const images = model.thumbnails?.images || [];
    // اختيار صورة متوسطة الحجم
    const medium = images.find(img => img.width >= 200 && img.width <= 400);
    return medium?.url || images[0]?.url || '';
  };

  return (
    <div className="space-y-6">
      {/* شريط البحث */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن نماذج 3D (مثال: sofa, bed, table)"
          className="flex-1 px-4 py-3 bg-secondary border border-secondary rounded-xl text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>

      {/* فلاتر سريعة */}
      <div className="flex flex-wrap gap-2">
        {['furniture', 'sofa', 'bed', 'table', 'chair', 'lamp', 'decoration', 'kitchen'].map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setSearchQuery(tag);
              searchModels(tag);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              searchQuery === tag
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            {tag === 'furniture' && '🪑 أثاث'}
            {tag === 'sofa' && '🛋️ أريكة'}
            {tag === 'bed' && '🛏️ سرير'}
            {tag === 'table' && '🪑 طاولة'}
            {tag === 'chair' && '💺 كرسي'}
            {tag === 'lamp' && '💡 إضاءة'}
            {tag === 'decoration' && '🏺 ديكور'}
            {tag === 'kitchen' && '🍳 مطبخ'}
          </button>
        ))}
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
          {error}
        </div>
      )}

      {/* شبكة النماذج */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {models.map((model) => (
          <button
            key={model.uid}
            onClick={() => onSelectModel(model)}
            className="group relative bg-secondary rounded-xl overflow-hidden border border-secondary hover:border-primary transition-all hover:shadow-xl"
          >
            <div className="aspect-square relative">
              {getThumbnail(model) && (
                <img
                  src={getThumbnail(model)}
                  alt={model.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-white text-sm font-medium truncate">{model.name}</p>
                <p className="text-white/60 text-xs">by {model.user?.displayName || 'Unknown'}</p>
              </div>
            </div>
            {/* أيقونة 3D */}
            <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-full">
              3D
            </div>
            {/* إحصائيات */}
            <div className="absolute top-2 left-2 flex items-center gap-2 text-white/80 text-xs">
              <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                {model.viewCount > 1000 ? `${(model.viewCount / 1000).toFixed(1)}k` : model.viewCount}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* رسالة عدم وجود نتائج */}
      {!loading && models.length === 0 && !error && (
        <div className="text-center py-12 text-foreground/60">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>لم يتم العثور على نماذج. جرب كلمات بحث مختلفة.</p>
        </div>
      )}

      {/* تحميل */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}
