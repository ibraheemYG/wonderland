'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ProductGallery from '@/components/product/ProductGallery';
import { formatIQDFromUSD } from '@/utils/currency';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import SketchfabViewer from '@/components/product/SketchfabViewer';

interface Dimensions {
  width?: number;
  height?: number;
  depth?: number;
  unit?: 'cm' | 'inch';
}

interface BedroomPieces {
  bed?: Dimensions;
  wardrobe?: Dimensions;
  nightstand?: Dimensions;
  dresser?: Dimensions;
  desk?: Dimensions;
  mirror?: Dimensions;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  rating?: number;
  originalPrice?: number;
  category: string;
  description?: string;
  descriptionAlign?: 'right' | 'left' | 'center';
  images?: string[];
  videos?: string[];
  threeD?: string;
  sketchfabId?: string;
  dimensions?: Dimensions;
  bedroomPieces?: BedroomPieces;
  weight?: number;
  material?: string;
  color?: string;
}

interface ProductDetailsClientProps {
  productId: string;
}

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductDetailsClient({ productId }: ProductDetailsClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState({ total: 0, averageRating: 0 });
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', images: [] as string[] });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products?id=${productId}`, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'لم يتم العثور على المنتج');
        }
        const json = await res.json();
        console.log('📦 Product data:', json.data);
        setProduct(json.data ?? null);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('❌ Error loading product:', err);
        setError(err.message || 'تعذر تحميل المنتج');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [productId]);

  // جلب التقييمات
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
          setReviewStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    fetchReviews();
  }, [productId]);

  // رفع صور المراجعة
  const handleUploadReviewImages = async (files: FileList) => {
    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files).slice(0, 3)) { // حد أقصى 3 صور
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            uploadedUrls.push(data.url);
          }
        }
      }

      setNewReview(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls].slice(0, 3),
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('فشل في رفع الصور');
    } finally {
      setUploadingImages(false);
    }
  };

  // إرسال تقييم جديد
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('يرجى تسجيل الدخول لإضافة تقييم');
      router.push('/login');
      return;
    }

    if (!newReview.comment.trim()) {
      alert('يرجى كتابة تعليق');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userId: user.id || user.email,
          userName: user.name || user.email?.split('@')[0],
          userEmail: user.email,
          rating: newReview.rating,
          comment: newReview.comment,
          images: newReview.images,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setReviews(prev => [data.data, ...prev]);
        setReviewStats(prev => ({
          total: prev.total + 1,
          averageRating: ((prev.averageRating * prev.total) + newReview.rating) / (prev.total + 1),
        }));
        setNewReview({ rating: 5, comment: '', images: [] });
        alert('تم إضافة تقييمك بنجاح! 🎉');
      } else {
        alert(data.message || 'فشل في إضافة التقييم');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('حدث خطأ في إرسال التقييم');
    } finally {
      setSubmittingReview(false);
    }
  };

  // حذف تقييم
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('هل أنت متأكد من حذف تقييمك؟')) return;

    try {
      const res = await fetch(`/api/reviews?id=${reviewId}&userId=${user?.id || user?.email}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      if (data.success) {
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        setReviewStats(prev => ({
          total: Math.max(0, prev.total - 1),
          averageRating: prev.total > 1 
            ? ((prev.averageRating * prev.total) - reviews.find(r => r._id === reviewId)!.rating) / (prev.total - 1)
            : 0,
        }));
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const gallery = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    if (product?.imageUrl) {
      return [product.imageUrl];
    }
    return [
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800',
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?w=800',
    ];
  }, [product]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-foreground/60">جاري تحميل تفاصيل المنتج...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-lg mx-auto text-center bg-secondary/40 border border-secondary/60 rounded-2xl p-10">
          <h1 className="text-3xl font-bold text-foreground mb-4">المنتج غير متوفر</h1>
          <p className="text-foreground/70 mb-6">{error ?? 'عذراً، لم نتمكن من العثور على هذا المنتج.'}</p>
          <Link
            href="/products"
            className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-6 rounded-lg"
          >
            العودة إلى المنتجات
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="mb-6 text-sm text-foreground/70">
        <Link href="/">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category}`}>المنتجات</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={gallery} videos={product.videos} name={product.name} />

        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
          
          {product.rating && (
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating!) ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="text-foreground/70">({product.rating} / 5)</span>
            </div>
          )}

          <div className="flex items-baseline gap-4">
            <p className="text-3xl font-extrabold text-primary">{formatIQDFromUSD(product.price)}</p>
            {product.originalPrice && (
              <p className="text-lg line-through text-foreground/50">
                {formatIQDFromUSD(product.originalPrice)}
              </p>
            )}
          </div>

          <p 
            className="text-foreground/80 leading-8"
            style={{ textAlign: product.descriptionAlign || 'right' }}
            dir="auto"
          >
            {product.description ?? 'منتج عالي الجودة بتفاصيل عصرية وخامات مختارة بعناية ليمنح منزلك مظهراً أنيقاً ووظائف عملية.'}
          </p>

          {/* تفاصيل المنتج */}
          <div className="bg-secondary/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-secondary pb-2">مواصفات المنتج</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* اللون */}
              {product.color && (
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">🎨</span>
                  <div>
                    <p className="text-foreground/60">اللون</p>
                    <p className="font-medium text-foreground">{product.color}</p>
                  </div>
                </div>
              )}

              {/* الخامة */}
              {product.material && (
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">🪵</span>
                  <div>
                    <p className="text-foreground/60">الخامة</p>
                    <p className="font-medium text-foreground">{product.material}</p>
                  </div>
                </div>
              )}

              {/* الوزن */}
              {product.weight && (
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">⚖️</span>
                  <div>
                    <p className="text-foreground/60">الوزن</p>
                    <p className="font-medium text-foreground">{product.weight} كجم</p>
                  </div>
                </div>
              )}

              {/* الأبعاد */}
              {product.dimensions && (product.dimensions.width || product.dimensions.height || product.dimensions.depth) && (
                <div className="flex items-center gap-3 col-span-2">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">📐</span>
                  <div>
                    <p className="text-foreground/60">الأبعاد</p>
                    <p className="font-medium text-foreground">
                      {[
                        product.dimensions.width && `العرض: ${product.dimensions.width}`,
                        product.dimensions.height && `الارتفاع: ${product.dimensions.height}`,
                        product.dimensions.depth && `العمق: ${product.dimensions.depth}`
                      ].filter(Boolean).join(' × ')} {product.dimensions.unit || 'سم'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* أبعاد قطع غرفة النوم */}
            {product.category === 'bedroom' && product.bedroomPieces && (
              <div className="mt-4 pt-4 border-t border-secondary">
                <h4 className="text-md font-semibold text-foreground mb-3 flex items-center gap-2">
                  🛏️ أبعاد القطع
                </h4>
                <div className="grid gap-3">
                  {product.bedroomPieces.bed && (product.bedroomPieces.bed.width || product.bedroomPieces.bed.height) && (
                    <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
                      <span className="text-lg">🛏️</span>
                      <div className="flex-1">
                        <p className="text-foreground/60 text-sm">السرير</p>
                        <p className="font-medium text-foreground text-sm">
                          {[
                            product.bedroomPieces.bed.width && `${product.bedroomPieces.bed.width}`,
                            product.bedroomPieces.bed.height && `${product.bedroomPieces.bed.height}`,
                            product.bedroomPieces.bed.depth && `${product.bedroomPieces.bed.depth}`
                          ].filter(Boolean).join(' × ')} سم
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {product.bedroomPieces.wardrobe && (product.bedroomPieces.wardrobe.width || product.bedroomPieces.wardrobe.height) && (
                    <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
                      <span className="text-lg">🚪</span>
                      <div className="flex-1">
                        <p className="text-foreground/60 text-sm">الخزانة</p>
                        <p className="font-medium text-foreground text-sm">
                          {[
                            product.bedroomPieces.wardrobe.width && `${product.bedroomPieces.wardrobe.width}`,
                            product.bedroomPieces.wardrobe.height && `${product.bedroomPieces.wardrobe.height}`,
                            product.bedroomPieces.wardrobe.depth && `${product.bedroomPieces.wardrobe.depth}`
                          ].filter(Boolean).join(' × ')} سم
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {product.bedroomPieces.nightstand && (product.bedroomPieces.nightstand.width || product.bedroomPieces.nightstand.height) && (
                    <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
                      <span className="text-lg">🪑</span>
                      <div className="flex-1">
                        <p className="text-foreground/60 text-sm">الكومودينو</p>
                        <p className="font-medium text-foreground text-sm">
                          {[
                            product.bedroomPieces.nightstand.width && `${product.bedroomPieces.nightstand.width}`,
                            product.bedroomPieces.nightstand.height && `${product.bedroomPieces.nightstand.height}`,
                            product.bedroomPieces.nightstand.depth && `${product.bedroomPieces.nightstand.depth}`
                          ].filter(Boolean).join(' × ')} سم
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {product.bedroomPieces.dresser && (product.bedroomPieces.dresser.width || product.bedroomPieces.dresser.height) && (
                    <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
                      <span className="text-lg">💄</span>
                      <div className="flex-1">
                        <p className="text-foreground/60 text-sm">التسريحة</p>
                        <p className="font-medium text-foreground text-sm">
                          {[
                            product.bedroomPieces.dresser.width && `${product.bedroomPieces.dresser.width}`,
                            product.bedroomPieces.dresser.height && `${product.bedroomPieces.dresser.height}`,
                            product.bedroomPieces.dresser.depth && `${product.bedroomPieces.dresser.depth}`
                          ].filter(Boolean).join(' × ')} سم
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {product.bedroomPieces.desk && (product.bedroomPieces.desk.width || product.bedroomPieces.desk.height) && (
                    <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
                      <span className="text-lg">📚</span>
                      <div className="flex-1">
                        <p className="text-foreground/60 text-sm">الميز/المكتب</p>
                        <p className="font-medium text-foreground text-sm">
                          {[
                            product.bedroomPieces.desk.width && `${product.bedroomPieces.desk.width}`,
                            product.bedroomPieces.desk.height && `${product.bedroomPieces.desk.height}`,
                            product.bedroomPieces.desk.depth && `${product.bedroomPieces.desk.depth}`
                          ].filter(Boolean).join(' × ')} سم
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {product.bedroomPieces.mirror && (product.bedroomPieces.mirror.width || product.bedroomPieces.mirror.height) && (
                    <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
                      <span className="text-lg">🪞</span>
                      <div className="flex-1">
                        <p className="text-foreground/60 text-sm">المرآة</p>
                        <p className="font-medium text-foreground text-sm">
                          {[
                            product.bedroomPieces.mirror.width && `${product.bedroomPieces.mirror.width}`,
                            product.bedroomPieces.mirror.height && `${product.bedroomPieces.mirror.height}`,
                            product.bedroomPieces.mirror.depth && `${product.bedroomPieces.mirror.depth}`
                          ].filter(Boolean).join(' × ')} سم
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* رسالة إذا لم تكن هناك مواصفات */}
            {!product.color && !product.material && !product.weight && !product.dimensions && (
              <p className="text-foreground/50 text-sm text-center py-2">لا توجد مواصفات إضافية متاحة لهذا المنتج</p>
            )}
          </div>

          {/* عرض نموذج Sketchfab ثلاثي الأبعاد */}
          {product.sketchfabId && (
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-6 space-y-4 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-foreground border-b border-secondary pb-2 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">🎨</span>
                معاينة ثلاثية الأبعاد
              </h3>
              <SketchfabViewer modelId={product.sketchfabId} />
              <p className="text-foreground/60 text-sm text-center">
                💡 يمكنك تدوير النموذج وتكبيره باستخدام الماوس
              </p>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => addToCart({
                ...product,
                imageUrl: product.images?.[0] || product.imageUrl || '/placeholder.png'
              })}
              className="flex-1 min-w-[200px] bg-gradient-to-r from-primary to-amber-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-xl transform hover:scale-[1.02]"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                أضف إلى السلة
              </span>
            </button>
            <button
              onClick={() => router.push(`/try-3d?productId=${product.id}`)}
              className="glass-button bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:from-purple-600 hover:to-fuchsia-600 font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/30"
            >
              🎯 جرب في 3D
            </button>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            متابعة التسوق
          </Link>
        </section>
      </div>

      {/* قسم التعليقات والتقييمات */}
      <section className="mt-16 border-t border-secondary pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">💬 التعليقات والتقييمات</h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(reviewStats.averageRating) ? 'fill-current' : 'fill-gray-300'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-foreground/70">
                {reviewStats.averageRating.toFixed(1)} ({reviewStats.total} تقييم)
              </span>
            </div>
          </div>
        </div>

        {/* نموذج إضافة تقييم */}
        <div className="bg-secondary/30 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">✍️ أضف تقييمك</h3>
          
          {user ? (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* اختيار التقييم */}
              <div>
                <label className="block text-foreground/70 text-sm mb-2">تقييمك</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-8 h-8 ${star <= newReview.rating ? 'text-amber-400 fill-current' : 'text-gray-300 fill-current'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* التعليق */}
              <div>
                <label className="block text-foreground/70 text-sm mb-2">تعليقك</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-4 py-3 bg-background border border-secondary rounded-xl text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary resize-none h-24"
                  placeholder="شاركنا رأيك في هذا المنتج..."
                  dir="auto"
                  maxLength={1000}
                />
              </div>

              {/* رفع صور المراجعة */}
              <div>
                <label className="block text-foreground/70 text-sm mb-2">📷 إضافة صور (اختياري - حد أقصى 3)</label>
                <div className="flex flex-wrap gap-2">
                  {newReview.images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20">
                      <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setNewReview(prev => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== idx),
                        }))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {newReview.images.length < 3 && (
                    <label className="w-20 h-20 border-2 border-dashed border-secondary rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && handleUploadReviewImages(e.target.files)}
                        disabled={uploadingImages}
                      />
                      {uploadingImages ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="text-foreground/50 text-2xl">+</span>
                      )}
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingReview || !newReview.comment.trim() || uploadingImages}
                className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'جاري الإرسال...' : '📤 إرسال التقييم'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-foreground/60 mb-4">يجب تسجيل الدخول لإضافة تقييم</p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all"
              >
                🔐 تسجيل الدخول
              </Link>
            </div>
          )}
        </div>

        {/* قائمة التعليقات */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-secondary/20 rounded-2xl">
              <span className="text-5xl mb-4 block">💭</span>
              <p className="text-foreground/60">لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-secondary/20 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {review.userName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{review.userName}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'fill-gray-300'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-foreground/50 text-xs">
                          {new Date(review.createdAt).toLocaleDateString('ar-IQ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* زر الحذف لصاحب التقييم */}
                  {user && (user.id === review.userId || user.email === review.userId) && (
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-red-400 hover:text-red-500 text-sm"
                    >
                      🗑️ حذف
                    </button>
                  )}
                </div>
                
                <p className="text-foreground/80 leading-relaxed mb-3" dir="auto">
                  {review.comment}
                </p>

                {/* صور المراجعة */}
                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {review.images.map((image: string, idx: number) => (
                      <a 
                        key={idx} 
                        href={image} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-20 h-20 rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition"
                      >
                        <img 
                          src={image} 
                          alt={`صورة المراجعة ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
