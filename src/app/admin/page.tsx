'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export type ProductCategory = 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'decor' | 'appliances' | 'sale' | 'furnishings';

export interface ProductRecord {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;
  description?: string;
  rating?: number;
  originalPrice?: number;
  isCustom?: boolean;
}

// Mock useAuth for admin page since context might not be initialized
const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  React.useEffect(() => {
    try {
      const adminList = JSON.parse(localStorage.getItem('wonderland_admins') || '[]');
      const currentUser = JSON.parse(localStorage.getItem('wonderland_current_user') || 'null');
      setUser(currentUser);
      setIsAdmin(currentUser && adminList.includes(currentUser.email));
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, []);
  
  return { user, logout: () => {}, isAdmin, isLoading };
};

const STORAGE_KEY = 'wonderland_custom_products';

const categoryOptions: Array<{ label: string; value: ProductCategory }> = [
  { label: 'غرف المعيشة', value: 'living-room' },
  { label: 'غرف النوم', value: 'bedroom' },
  { label: 'المطابخ', value: 'kitchen' },
  { label: 'الحمامات', value: 'bathroom' },
  { label: 'الديكور', value: 'decor' },
  { label: 'الأجهزة', value: 'appliances' },
  { label: 'عروض خاصة', value: 'sale' },
  { label: 'المفروشات', value: 'furnishings' },
];

function loadCustomProducts(): ProductRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProductRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read custom products', error);
    return [];
  }
}

function persistCustomProducts(products: ProductRecord[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Failed to persist custom products', error);
  }
}

export default function AdminPage() {
  const router = useRouter();
  const { user, logout, isAdmin, isLoading } = useAuth();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    price: '',
    imageUrl: '',
    category: 'living-room' as ProductCategory,
    originalPrice: '',
    rating: '5',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // فحص المصادقة
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  useEffect(() => {
    // تحميل المنتجات من API MongoDB
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const result = await response.json();
          setProducts(result.data || []);
          console.log('✅ Products loaded from MongoDB:', result.data?.length || 0);
        } else {
          // fallback to localStorage إذا فشل API
          setProducts(loadCustomProducts());
        }
      } catch (error) {
        console.error('Failed to load from API, using localStorage:', error);
        setProducts(loadCustomProducts());
      }
    };
    
    loadProducts();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.name.trim() || !formState.price) {
      setFeedback('الرجاء إدخال اسم المنتج والسعر.');
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const preferredImage = formState.imageUrl.trim() || filePreview;

    const newProduct = {
      name: formState.name,
      price: Number(formState.price),
      imageUrl:
        preferredImage || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
      category: formState.category,
      rating: Number(formState.rating) || undefined,
      originalPrice: formState.originalPrice ? Number(formState.originalPrice) : undefined,
      isCustom: true,
    };

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        const result = await response.json();
        const savedProduct = result.data;
        
        // تحويل الـ MongoDB format إلى format التطبيق
        const formattedProduct: ProductRecord = {
          id: savedProduct._id || savedProduct.id,
          name: savedProduct.name,
          price: savedProduct.price,
          imageUrl: savedProduct.imageUrl,
          category: savedProduct.category,
          description: savedProduct.description,
          rating: savedProduct.rating,
          originalPrice: savedProduct.originalPrice,
          isCustom: savedProduct.isCustom || true,
        };
        
        const updatedProducts = [formattedProduct, ...products];
        setProducts(updatedProducts);
        persistCustomProducts(updatedProducts);
        
        setFormState({
          name: '',
          price: '',
          imageUrl: '',
          category: formState.category,
          originalPrice: '',
          rating: '5',
        });
        setFilePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setFeedback('✅ تم إضافة المنتج بنجاح!');
      } else {
        const error = await response.json();
        setFeedback('❌ ' + (error.message || 'فشل في حفظ المنتج'));
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setFeedback('❌ فشل في حفظ المنتج');
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts((prev) => {
          const updated = prev.filter((item) => item.id !== id);
          persistCustomProducts(updated); // backup to localStorage
          return updated;
        });
        setFeedback('✅ تم حذف المنتج بنجاح!');
      } else {
        setFeedback('❌ فشل في حذف المنتج');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setFeedback('❌ خطأ في الحذف');
    }
  };

  const categoryCounts = useMemo(() => {
    const counts = products.reduce<Record<ProductCategory, number>>((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {
      'living-room': 0,
      kitchen: 0,
      bedroom: 0,
      bathroom: 0,
      decor: 0,
      appliances: 0,
      furnishings: 0,
      sale: 0,
    } as Record<ProductCategory, number>);
    
    console.log('📊 Category counts:', counts);
    return counts;
  }, [products]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFilePreview(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setFeedback('الرجاء اختيار ملف صورة صالح.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.onerror = () => {
      setFeedback('تعذر قراءة الصورة، حاول مرة أخرى.');
      setFilePreview(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-black/40 border-b border-white/10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white">لوحة التحكم - {user?.name}</h1>
            <button
              onClick={logout}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
      <section className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="mb-8 sm:mb-10 flex flex-col gap-4">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs text-foreground/60 mb-3">internal panel</p>
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">لوحة التحكم - إضافة المنتجات</h1>
            <p className="text-foreground/70 max-w-2xl text-sm sm:text-base">
              تبقى هذه الواجهة محلية حالياً، ويمكن ربطها لاحقاً بواجهة برمجية أو لوحة تحكم مستضافة. يتم حفظ البيانات في المتصفح فقط.
            </p>
          </div>
          <button
            onClick={() => router.push('/products')}
            className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors w-full sm:w-auto"
          >
            ← العودة إلى المنتجات
          </button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-secondary bg-secondary/60 p-4 sm:p-8 shadow-sm"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">إضافة منتج جديد</h2>
            <div className="grid gap-4 sm:gap-5">
              <div>
                <label className="mb-2 block text-xs sm:text-sm font-semibold text-foreground">اسم المنتج</label>
                <input
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-secondary bg-background px-3 sm:px-4 py-2 sm:py-3 text-foreground text-sm focus:border-primary focus:outline-none"
                  placeholder="مثال: مكتبة جدارية خشبية"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="mb-2 block text-xs sm:text-sm font-semibold text-foreground">السعر (USD)</label>
                  <input
                    name="price"
                    value={formState.price}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-secondary bg-background px-3 sm:px-4 py-2 sm:py-3 text-foreground text-sm focus:border-primary focus:outline-none"
                    placeholder="799"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs sm:text-sm font-semibold text-foreground">السعر قبل الخصم (اختياري)</label>
                  <input
                    name="originalPrice"
                    value={formState.originalPrice}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-secondary bg-background px-3 sm:px-4 py-2 sm:py-3 text-foreground text-sm focus:border-primary focus:outline-none"
                    placeholder="899"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="mb-2 block text-xs sm:text-sm font-semibold text-foreground">قسم العرض</label>
                  <select
                    name="category"
                    value={formState.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-secondary bg-background px-3 sm:px-4 py-2 sm:py-3 text-foreground text-sm focus:border-primary focus:outline-none"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs sm:text-sm font-semibold text-foreground">التقييم (من 5)</label>
                  <input
                    name="rating"
                    value={formState.rating}
                    onChange={handleChange}
                    type="number"
                    min="1"
                    max="5"
                    className="w-full rounded-xl border border-secondary bg-background px-3 sm:px-4 py-2 sm:py-3 text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs sm:text-sm font-semibold text-foreground">رابط الصورة (URL)</label>
                <input
                  name="imageUrl"
                  value={formState.imageUrl}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-secondary bg-background px-3 sm:px-4 py-2 sm:py-3 text-foreground text-sm focus:border-primary focus:outline-none"
                  placeholder="https://..."
                />
                <p className="mt-2 text-xs text-foreground/60">
                  استخدم رابطاً مباشراً للصورة. يمكن استبدال هذه الخطوة لاحقاً برفع الصور إلى مساحة الاستضافة الخاصة بك.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs sm:text-sm font-semibold text-foreground">أو حمل صورة محلياً</label>
                <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-secondary bg-background px-4 sm:px-6 py-6 sm:py-10 text-center text-xs sm:text-sm text-foreground/70 hover:border-primary hover:text-foreground transition-colors cursor-pointer">
                  <UploadIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  <span>اسحب وأفلت أو اختر ملف صورة من جهازك</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="mt-2 text-xs text-foreground/60">
                  يتم حفظ الصورة محلياً باستخدام المتصفح (Base64). للبيئة المستضافة ستحتاج إلى تكامل رفع ملفات حقيقي.
                </p>
                {filePreview && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-secondary bg-secondary/50">
                    <img src={filePreview} alt="معاينة الصورة" className="h-40 sm:h-48 w-full object-cover" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl bg-primary py-2 sm:py-3 text-base sm:text-lg font-semibold text-primary-foreground shadow-lg transition-transform duration-200 hover:scale-[1.01] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ المنتج'}
              </button>

              {feedback && <p className="text-xs sm:text-sm text-primary font-semibold">{feedback}</p>}
            </div>
          </form>

          <aside className="space-y-4 sm:space-y-6">
            <div className="rounded-3xl border border-secondary bg-secondary/40 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">المنتجات المضافة محلياً</h3>
              {products.length === 0 ? (
                <p className="text-foreground/60 text-xs sm:text-sm">
                  لم تتم إضافة أي منتجات بعد. كل عنصر تقوم بإضافته يظهر مباشرة في صفحة المتجر ويمكن حذفه أو تعديله مع ربطه لاحقاً بقاعدة بيانات حقيقية.
                </p>
              ) : (
                <ul className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                  {products.map((product) => (
                    <li key={product.id} className="rounded-2xl border border-secondary bg-background px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground text-sm truncate">{product.name}</p>
                          <p className="text-xs text-foreground/70 truncate">${product.price.toFixed(2)} • {categoryOptions.find((c) => c.value === product.category)?.label}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="flex-shrink-0 rounded-full bg-red-500/10 px-2 sm:px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition-colors whitespace-nowrap"
                        >
                          حذف
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-3xl border border-secondary bg-secondary/40 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">إحصائيات سريعة</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/70">
                {categoryOptions.map((option) => (
                  <li key={option.value} className="flex justify-between">
                    <span className="truncate">{option.label}</span>
                    <span className="flex-shrink-0">{categoryCounts[option.value]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
