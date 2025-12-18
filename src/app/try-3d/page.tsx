'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { formatIQDFromUSD } from '@/utils/currency';

// تحميل عارض 3D بشكل متأخر
const ThreeDViewer = dynamic(() => import('@/components/product/ThreeDViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 dark:text-gray-400">جاري تحميل العارض...</p>
      </div>
    </div>
  ),
});

interface Product {
  _id: string;
  id: string;
  name: string;
  nameAr?: string;
  images: string[];
  price: number;
  category?: string;
  threeD?: string;
  sketchfabId?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
}

function Try3DContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('productId');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`/api/products?id=${productId}`);
        const data = await res.json();
        if (data.data) {
          setProduct(data.data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>العودة</span>
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">جرّب في غرفتك</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            تجربة تفاعلية
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            صمم غرفتك بأسلوبك
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            اختر من بين خيارين لتجربة الأثاث: مخطط الغرفة التفاعلي أو معاينة المنتج بدقة عالية
          </p>
        </div>

        {/* Options Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Room Planner Card */}
          <Link href="/room-planner" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-full">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-32 h-32 text-white/90" viewBox="0 0 100 100" fill="none">
                    <path d="M10 70 L50 90 L90 70 L50 50 Z" fill="currentColor" fillOpacity="0.3"/>
                    <path d="M10 70 L10 30 L50 50 L50 90 Z" fill="currentColor" fillOpacity="0.5"/>
                    <path d="M50 50 L50 10 L90 30 L90 70 Z" fill="currentColor" fillOpacity="0.4"/>
                    <rect x="55" y="55" width="25" height="15" rx="2" fill="currentColor" fillOpacity="0.8"/>
                    <rect x="20" y="60" width="20" height="12" rx="2" fill="currentColor" fillOpacity="0.7"/>
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium">
                  سحب وإفلات
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      مخطط الغرفة
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">2D تفاعلي</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  أدخل أبعاد غرفتك واسحب المنتجات لترتيبها بالشكل المثالي
                </p>
                <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    سريع وخفيف
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    تدوير وتغيير الحجم
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    حساب السعر الإجمالي
                  </li>
                </ul>
              </div>
            </div>
          </Link>

          {/* AR View Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 h-full">
            <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-600 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-32 h-32 text-white/90" viewBox="0 0 100 100" fill="none">
                  <rect x="25" y="10" width="50" height="80" rx="8" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2"/>
                  <rect x="30" y="18" width="40" height="60" rx="2" fill="currentColor" fillOpacity="0.2"/>
                  <g transform="translate(40, 35)">
                    <path d="M10 0 L20 5 L20 15 L10 20 L0 15 L0 5 Z" fill="currentColor" fillOpacity="0.6"/>
                    <path d="M10 0 L10 10 L0 15 L0 5 Z" fill="currentColor" fillOpacity="0.8"/>
                    <path d="M10 0 L10 10 L20 15 L20 5 Z" fill="currentColor" fillOpacity="0.4"/>
                  </g>
                  <path d="M35 25 L35 30 L40 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M65 25 L65 30 L60 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M35 70 L35 65 L40 65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M65 70 L65 65 L60 65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium">
                قريباً
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    الواقع المعزز AR
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">للهواتف الذكية</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                استخدم كاميرا هاتفك لمشاهدة الأثاث في مكانه الحقيقي
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                <p className="text-purple-700 dark:text-purple-300 text-sm font-medium">
                  🚀 هذه الميزة قيد التطوير
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Model Viewer - يظهر إذا كان للمنتج ملف 3D */}
        {product?.threeD && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                معاينة النموذج في غرفة افتراضية
              </h3>
              <p className="text-white/80 text-sm mt-1">شاهد المنتج بشكل ثلاثي الأبعاد - قم بتدويره بإصبعك أو الماوس</p>
            </div>
            <div className="aspect-[16/9] md:aspect-[16/9]">
              <ThreeDViewer 
                modelUrl={product.threeD} 
                showRoom={true} 
                poster={product.images?.[0]}
              />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    اسحب للتدوير
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    عجلة الماوس للتكبير
                  </span>
                </div>
              </div>
              
              {/* أزرار الإجراءات */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/room-planner?addProduct=${product.id || product._id}&threeD=${encodeURIComponent(product.threeD)}&name=${encodeURIComponent(product.name)}&image=${encodeURIComponent(product.images?.[0] || '')}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all text-sm font-semibold shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  إضافة إلى مخطط الغرفة
                </Link>
                <a
                  href={product.threeD}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-xl transition-colors text-sm font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  تحميل
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Product Preview */}
        {product && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">المنتج المحدد</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-4">
                  <img
                    src={product.images?.[selectedImage] || '/placeholder.jpg'}
                    alt={product.nameAr || product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                          selectedImage === idx
                            ? 'border-blue-500'
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:w-2/3">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.nameAr || product.name}
                </h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  {formatIQDFromUSD(product.price)}
                </p>
                {product.dimensions && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">الأبعاد</p>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-xs text-gray-400">العرض</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{product.dimensions.width} سم</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">الارتفاع</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{product.dimensions.height} سم</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">العمق</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{product.dimensions.depth} سم</p>
                      </div>
                    </div>
                  </div>
                )}
                <Link
                  href="/room-planner"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  <span>جرّب في مخطط الغرفة</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '⚡', title: 'سريع', desc: 'أداء عالي' },
            { icon: '📱', title: 'متجاوب', desc: 'جميع الأجهزة' },
            { icon: '🎨', title: 'مرن', desc: 'تخصيص كامل' },
            { icon: '💰', title: 'مجاني', desc: 'بدون رسوم' },
          ].map((feature, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-700">
              <span className="text-3xl mb-2 block">{feature.icon}</span>
              <p className="font-semibold text-gray-900 dark:text-white">{feature.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// Loading component
function Try3DLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
      </div>
    </div>
  );
}

// Main export with Suspense
export default function Try3DPage() {
  return (
    <Suspense fallback={<Try3DLoading />}>
      <Try3DContent />
    </Suspense>
  );
}
