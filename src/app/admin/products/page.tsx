'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  discount?: number;
  description: string;
  images: string[];
  mainImageIndex?: number;
  videos?: string[];
  threeD?: string;
}

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: 'living-room', label: 'غرف المعيشة' },
  { value: 'bedroom', label: 'غرف النوم' },
  { value: 'kitchen', label: 'المطابخ' },
  { value: 'bathroom', label: 'الحمامات' },
  { value: 'decor', label: 'الديكور' },
  { value: 'appliances', label: 'الأجهزة' },
  { value: 'sale', label: 'عروض خاصة' },
  { value: 'furnishings', label: 'المفروشات' },
];

export default function ProductsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'sofa',
    price: 0,
    quantity: 0,
    discount: 0,
    description: '',
    images: [] as string[],
    mainImageIndex: 0,
    videos: [] as string[],
    threeD: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!user || !isAdmin())) {
      router.push('/login');
    }
  }, [user, isAdmin, router, mounted]);

  useEffect(() => {
    if (mounted && isAdmin()) {
      const load = async () => {
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const json = await res.json();
            setProducts(json.data || []);
            return;
          }
        } catch (err) {
          console.error('Failed to load products from API:', err);
        }
      };
      load();
    }
  }, [mounted, isAdmin]);

  if (!mounted || !user || !isAdmin()) {
    return null;
  }

  const handleAddImage = (url: string) => {
    setForm(prev => ({
      ...prev,
      images: [...prev.images, url],
      mainImageIndex: prev.images.length === 0 ? 0 : prev.mainImageIndex,
    }));
  };

  const handleAddVideo = (url: string) => {
    setForm(prev => ({ ...prev, videos: [...prev.videos, url] }));
  };

  const handleAdd3D = (url: string) => {
    setForm(prev => ({ ...prev, threeD: url }));
  };

  const handleRemoveImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      mainImageIndex: prev.mainImageIndex >= prev.images.length - 1 ? 0 : prev.mainImageIndex,
    }));
  };

  const setMainImage = (index: number) => {
    setForm(prev => ({ ...prev, mainImageIndex: index }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || form.images.length === 0) {
      alert('يرجى ملء جميع الحقول المطلوبة وإضافة صورة واحدة على الأقل');
      return;
    }

    (async () => {
      try {
        const payload = {
          name: form.name,
          category: form.category,
          price: parseFloat(form.price.toString()),
          quantity: parseInt(form.quantity.toString()),
          discount: form.discount ? parseFloat(form.discount.toString()) : 0,
          description: form.description,
          images: form.images,
          mainImageIndex: form.mainImageIndex,
          videos: form.videos,
          threeD: form.threeD,
        };

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || 'Failed to save product');
        }

        const saved = json.data;
        // normalize saved product
        const productItem: Product = {
          id: saved.id || saved._id || `product_${Date.now()}`,
          name: saved.name,
          category: saved.category,
          price: saved.price,
          quantity: saved.quantity || 0,
          discount: saved.originalPrice ? saved.originalPrice : 0,
          description: saved.description || '',
          images: saved.images || (saved.imageUrl ? [saved.imageUrl] : []),
          mainImageIndex: saved.mainImageIndex || 0,
          videos: saved.videos || [],
          threeD: saved.threeD || '',
        };

        setProducts(prev => [productItem, ...prev]);

        // إعادة تعيين النموذج
        setForm({
          name: '',
          category: 'sofa',
          price: 0,
          quantity: 0,
          discount: 0,
          description: '',
          images: [],
          mainImageIndex: 0,
          videos: [],
          threeD: '',
        });

        alert('✅ تم إضافة المنتج بنجاح!');
      } catch (err: any) {
        console.error('Failed to save product:', err);
        alert('❌ فشل في حفظ المنتج: ' + (err.message || err));
      }
    })();
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm('هل تأكد من حذف هذا المنتج؟')) return;
    (async () => {
      try {
        const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to delete');
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert('❌ فشل في حذف المنتج');
      }
    })();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-white mb-12">🛍️ إدارة المنتجات</h1>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Add Product Form */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg h-fit sticky top-8">
            <h2 className="text-2xl font-bold text-white mb-6">➕ إضافة منتج جديد</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">اسم المنتج</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  placeholder="مثال: كرسي مريح"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">القسم</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                >
                  {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">السعر</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: e.target.value as any})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">الكمية</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({...form, quantity: e.target.value as any})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">الخصم (%)</label>
                <input
                  type="number"
                  value={form.discount}
                  onChange={(e) => setForm({...form, discount: e.target.value as any})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">الوصف</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 resize-none h-24"
                  placeholder="وصف المنتج..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg transition font-semibold"
              >
                ✅ إضافة المنتج
              </button>
            </form>
          </div>

          {/* Image Upload */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">📸 الصور</h2>
            
            <ImageUpload
              onUploadSuccess={handleAddImage}
              folder={`wonderland/products/${form.category}`}
              multiple={true}
              accept="image/*"
            />

            {/* Uploaded Images */}
            {form.images.length > 0 && (
              <div className="mt-8">
                <h3 className="text-white/70 text-sm font-medium mb-4">الصور المرفوعة ({form.images.length})</h3>
                <div className="grid grid-cols-2 gap-4">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Product ${idx}`}
                        className={`w-full h-40 object-cover rounded-lg border ${form.mainImageIndex === idx ? 'border-green-400' : 'border-white/20'}`}
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => setMainImage(idx)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                          title="اجعل هذه الصورة رئيسية"
                        >
                          ★
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
                          title="حذف"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Upload */}
            <div className="mt-8">
              <h3 className="text-white/70 text-sm font-medium mb-4">فيديوهات المنتج ({form.videos.length})</h3>
              <ImageUpload onUploadSuccess={handleAddVideo} folder="wonderland/products/videos" accept="video/*" />
              {form.videos.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-4">
                  {form.videos.map((v, i) => (
                    <video key={i} src={v} controls className="w-full h-48 object-cover rounded-lg" />
                  ))}
                </div>
              )}
            </div>

            {/* 3D Upload */}
            <div className="mt-8">
              <h3 className="text-white/70 text-sm font-medium mb-4">ملف ثلاثي الأبعاد (GLB/GLTF/OBJ)</h3>
              <ImageUpload onUploadSuccess={handleAdd3D} folder="wonderland/products/3d" accept=".glb,.gltf,.obj" />
              <div className="mt-3 text-white/60 text-sm">
                {form.threeD ? (
                  <a href={form.threeD} target="_blank" rel="noreferrer" className="underline">عرض ملف 3D</a>
                ) : (
                  <span>لم يتم رفع ملف ثلاثي الأبعاد بعد — سيتم عرض "قريباً 3D" تلقائياً في صفحة المنتج</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6">📦 المنتجات المضافة ({products.length})</h2>
          
          {products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition">
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[(product.mainImageIndex ?? 0) as number] || product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  {!product.images || product.images.length === 0 ? (
                    <div className="w-full h-48 flex items-center justify-center bg-white/5 text-white/60">لا توجد صورة</div>
                  ) : null}
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2">{product.name}</h3>
                    <p className="text-white/60 text-sm mb-3">{product.description.substring(0, 60)}...</p>
                    <div className="flex justify-between items-center text-sm text-white/70 mb-3">
                      <span>{product.price} د.ع</span>
                      <span>{product.quantity} قطعة</span>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="w-full py-2 bg-red-600/30 hover:bg-red-600/50 text-red-200 rounded transition font-medium"
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">لا توجد منتجات بعد</p>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link href="/admin/dashboard" className="text-white/60 hover:text-white transition">
            ← العودة إلى لوحة التحكم
          </Link>
        </div>
      </div>
    </main>
  );
}
