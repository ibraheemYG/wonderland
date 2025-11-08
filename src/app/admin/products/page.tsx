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
}

const CATEGORIES = ['sofa', 'bed', 'kitchen', 'bathroom', 'decorations', 'furnishings', 'appliances', 'sale'];

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
      const stored = localStorage.getItem('wonderland_products');
      if (stored) {
        setProducts(JSON.parse(stored));
      }
    }
  }, [mounted, isAdmin]);

  if (!mounted || !user || !isAdmin()) {
    return null;
  }

  const handleAddImage = (url: string) => {
    setForm(prev => ({
      ...prev,
      images: [...prev.images, url],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || form.images.length === 0) {
      alert('يرجى ملء جميع الحقول المطلوبة وإضافة صورة واحدة على الأقل');
      return;
    }

    const newProduct: Product = {
      id: `product_${Date.now()}`,
      name: form.name,
      category: form.category,
      price: parseFloat(form.price.toString()),
      quantity: parseInt(form.quantity.toString()),
      discount: form.discount ? parseFloat(form.discount.toString()) : 0,
      description: form.description,
      images: form.images,
    };

    const updated = [...products, newProduct];
    setProducts(updated);
    localStorage.setItem('wonderland_products', JSON.stringify(updated));
    
    // إعادة تعيين النموذج
    setForm({
      name: '',
      category: 'sofa',
      price: 0,
      quantity: 0,
      discount: 0,
      description: '',
      images: [],
    });
    
    alert('✅ تم إضافة المنتج بنجاح!');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('هل تأكد من حذف هذا المنتج؟')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem('wonderland_products', JSON.stringify(updated));
    }
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
                    <option key={cat} value={cat}>{cat}</option>
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
              folder="wonderland/products"
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
                        className="w-full h-40 object-cover rounded-lg border border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6">📦 المنتجات المضافة ({products.length})</h2>
          
          {products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition">
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
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
