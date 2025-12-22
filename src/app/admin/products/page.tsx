'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface Dimensions {
  width?: number;
  height?: number;
  depth?: number;
  unit: 'cm' | 'inch';
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
  category: string;
  price: number;
  quantity: number;
  discount?: number;
  description: string;
  descriptionAlign?: 'right' | 'left' | 'center';
  images: string[];
  mainImageIndex?: number;
  videos?: string[];
  threeD?: string;
  sketchfabId?: string;
  dimensions?: Dimensions;
  bedroomPieces?: BedroomPieces;
  weight?: number;
  material?: string;
  color?: string;
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
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: 'living-room',
    price: 0,
    quantity: 0,
    discount: 0,
    description: '',
    descriptionAlign: 'right' as 'right' | 'left' | 'center',
    images: [] as string[],
    mainImageIndex: 0,
    videos: [] as string[],
    has3D: false,
    threeD: '',
    sketchfabId: '',
    dimensions: {
      width: 0,
      height: 0,
      depth: 0,
      unit: 'cm' as 'cm' | 'inch',
    },
    bedroomPieces: {
      bed: { width: 0, height: 0, depth: 0, unit: 'cm' as 'cm' | 'inch' },
      wardrobe: { width: 0, height: 0, depth: 0, unit: 'cm' as 'cm' | 'inch' },
      nightstand: { width: 0, height: 0, depth: 0, unit: 'cm' as 'cm' | 'inch' },
      dresser: { width: 0, height: 0, depth: 0, unit: 'cm' as 'cm' | 'inch' },
      desk: { width: 0, height: 0, depth: 0, unit: 'cm' as 'cm' | 'inch' },
      mirror: { width: 0, height: 0, depth: 0, unit: 'cm' as 'cm' | 'inch' },
    },
    weight: 0,
    material: '',
    color: '',
  });

  useEffect(() => {
    if (!isAuthLoading && (!user || !isAdmin())) {
      router.push('/login');
    }
  }, [user, isAdmin, router, isAuthLoading]);

  useEffect(() => {
    if (!isAuthLoading && user && isAdmin()) {
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
  }, [isAuthLoading, user, isAdmin]);

  if (isAuthLoading || !user || !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-lg">جارٍ التحميل...</p>
        </div>
      </div>
    );
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

  // رفع صور متعددة مع Drag & Drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploadProgress(0);
    const totalFiles = fileArray.length;
    let uploadedCount = 0;

    for (const file of fileArray) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // التحقق من حجم الملف (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`الملف ${file.name} أكبر من 5MB`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', `wonderland/products/${form.category}`);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          handleAddImage(data.secure_url);
        }
      } catch (err) {
        console.error('Upload error:', err);
      }

      uploadedCount++;
      setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
    }

    setUploadProgress(0);
    setDragActive(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }, [form.category]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || form.images.length === 0) {
      alert('يرجى ملء جميع الحقول المطلوبة وإضافة صورة واحدة على الأقل');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: parseFloat(form.price.toString()),
        quantity: parseInt(form.quantity.toString()),
        discount: form.discount ? parseFloat(form.discount.toString()) : 0,
        description: form.description,
        descriptionAlign: form.descriptionAlign,
        images: form.images,
        mainImageIndex: form.mainImageIndex,
        videos: form.videos,
        threeD: form.threeD,
        sketchfabId: form.sketchfabId || undefined,
        dimensions: {
          width: form.dimensions.width || undefined,
          height: form.dimensions.height || undefined,
          depth: form.dimensions.depth || undefined,
          unit: form.dimensions.unit,
        },
        bedroomPieces: form.category === 'bedroom' ? {
          bed: form.bedroomPieces.bed.width || form.bedroomPieces.bed.height ? form.bedroomPieces.bed : undefined,
          wardrobe: form.bedroomPieces.wardrobe.width || form.bedroomPieces.wardrobe.height ? form.bedroomPieces.wardrobe : undefined,
          nightstand: form.bedroomPieces.nightstand.width || form.bedroomPieces.nightstand.height ? form.bedroomPieces.nightstand : undefined,
          dresser: form.bedroomPieces.dresser.width || form.bedroomPieces.dresser.height ? form.bedroomPieces.dresser : undefined,
          desk: form.bedroomPieces.desk.width || form.bedroomPieces.desk.height ? form.bedroomPieces.desk : undefined,
          mirror: form.bedroomPieces.mirror.width || form.bedroomPieces.mirror.height ? form.bedroomPieces.mirror : undefined,
        } : undefined,
        weight: form.weight || undefined,
        material: form.material || undefined,
        color: form.color || undefined,
      };

      // تحديد إذا كان تعديل أو إضافة جديدة
      const isEditing = editingProduct !== null;
      const url = isEditing ? `/api/products?id=${editingProduct.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      console.log('📤 Sending product payload:', { videos: payload.videos, threeD: payload.threeD });

      const res = await fetch(url, {
        method,
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
        sketchfabId: saved.sketchfabId || '',
        dimensions: saved.dimensions,
        weight: saved.weight,
        material: saved.material,
        color: saved.color,
      };

      if (editingProduct) {
        // تحديث المنتج في القائمة
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? productItem : p));
        setEditingProduct(null);
        alert('✅ تم تحديث المنتج بنجاح!');
      } else {
        // إضافة منتج جديد
        setProducts(prev => [productItem, ...prev]);
        alert('✅ تم إضافة المنتج بنجاح!');
      }

      // إعادة تعيين النموذج
      setForm({
        name: '',
        category: 'living-room',
        price: 0,
        quantity: 0,
        discount: 0,
        description: '',
        descriptionAlign: 'right',
        images: [],
        mainImageIndex: 0,
        videos: [],
        has3D: false,
        threeD: '',
        sketchfabId: '',
        dimensions: { width: 0, height: 0, depth: 0, unit: 'cm' },
        bedroomPieces: {
          bed: { width: 0, height: 0, depth: 0, unit: 'cm' },
          wardrobe: { width: 0, height: 0, depth: 0, unit: 'cm' },
          nightstand: { width: 0, height: 0, depth: 0, unit: 'cm' },
          dresser: { width: 0, height: 0, depth: 0, unit: 'cm' },
          desk: { width: 0, height: 0, depth: 0, unit: 'cm' },
          mirror: { width: 0, height: 0, depth: 0, unit: 'cm' },
        },
        weight: 0,
        material: '',
        color: '',
      });
    } catch (err: any) {
      console.error('Failed to save product:', err);
      alert('❌ فشل في حفظ المنتج: ' + (err.message || err));
    } finally {
        setIsSubmitting(false);
      }
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

  // تحميل بيانات المنتج للتعديل
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity || 0,
      discount: product.discount || 0,
      description: product.description || '',
      descriptionAlign: product.descriptionAlign || 'right',
      images: product.images || [],
      mainImageIndex: product.mainImageIndex || 0,
      videos: product.videos || [],
      has3D: !!product.threeD,
      threeD: product.threeD || '',
      sketchfabId: product.sketchfabId || '',
      dimensions: {
        width: product.dimensions?.width || 0,
        height: product.dimensions?.height || 0,
        depth: product.dimensions?.depth || 0,
        unit: product.dimensions?.unit || 'cm',
      },
      bedroomPieces: {
        bed: { 
          width: product.bedroomPieces?.bed?.width || 0, 
          height: product.bedroomPieces?.bed?.height || 0, 
          depth: product.bedroomPieces?.bed?.depth || 0, 
          unit: product.bedroomPieces?.bed?.unit || 'cm' 
        },
        wardrobe: { 
          width: product.bedroomPieces?.wardrobe?.width || 0, 
          height: product.bedroomPieces?.wardrobe?.height || 0, 
          depth: product.bedroomPieces?.wardrobe?.depth || 0, 
          unit: product.bedroomPieces?.wardrobe?.unit || 'cm' 
        },
        nightstand: { 
          width: product.bedroomPieces?.nightstand?.width || 0, 
          height: product.bedroomPieces?.nightstand?.height || 0, 
          depth: product.bedroomPieces?.nightstand?.depth || 0, 
          unit: product.bedroomPieces?.nightstand?.unit || 'cm' 
        },
        dresser: { 
          width: product.bedroomPieces?.dresser?.width || 0, 
          height: product.bedroomPieces?.dresser?.height || 0, 
          depth: product.bedroomPieces?.dresser?.depth || 0, 
          unit: product.bedroomPieces?.dresser?.unit || 'cm' 
        },
        desk: { 
          width: product.bedroomPieces?.desk?.width || 0, 
          height: product.bedroomPieces?.desk?.height || 0, 
          depth: product.bedroomPieces?.desk?.depth || 0, 
          unit: product.bedroomPieces?.desk?.unit || 'cm' 
        },
        mirror: { 
          width: product.bedroomPieces?.mirror?.width || 0, 
          height: product.bedroomPieces?.mirror?.height || 0, 
          depth: product.bedroomPieces?.mirror?.depth || 0, 
          unit: product.bedroomPieces?.mirror?.unit || 'cm' 
        },
      },
      weight: product.weight || 0,
      material: product.material || '',
      color: product.color || '',
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // إلغاء التعديل
  const handleCancelEdit = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      category: 'living-room',
      price: 0,
      quantity: 0,
      discount: 0,
      description: '',
      descriptionAlign: 'right',
      images: [],
      mainImageIndex: 0,
      videos: [],
      has3D: false,
      threeD: '',
      sketchfabId: '',
      dimensions: { width: 0, height: 0, depth: 0, unit: 'cm' },
      bedroomPieces: {
        bed: { width: 0, height: 0, depth: 0, unit: 'cm' },
        wardrobe: { width: 0, height: 0, depth: 0, unit: 'cm' },
        nightstand: { width: 0, height: 0, depth: 0, unit: 'cm' },
        dresser: { width: 0, height: 0, depth: 0, unit: 'cm' },
        desk: { width: 0, height: 0, depth: 0, unit: 'cm' },
        mirror: { width: 0, height: 0, depth: 0, unit: 'cm' },
      },
      weight: 0,
      material: '',
      color: '',
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">🛍️ إدارة المنتجات</h1>
          <Link href="/admin/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm">
            ← لوحة التحكم
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Add/Edit Product Form */}
          <div className={`bg-gradient-to-br ${editingProduct ? 'from-amber-500/10 to-amber-500/5 border-amber-400/30' : 'from-white/10 to-white/5 border-white/20'} backdrop-blur-md border rounded-2xl p-6 md:p-8 shadow-xl`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className={`w-10 h-10 ${editingProduct ? 'bg-amber-500/20' : 'bg-green-500/20'} rounded-xl flex items-center justify-center`}>
                  {editingProduct ? '✏️' : '➕'}
                </span>
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
              {editingProduct && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  إلغاء التعديل
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* اسم المنتج */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">اسم المنتج *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all"
                  placeholder="مثال: خزانة ملابس فاخرة"
                  required
                />
              </div>

              {/* القسم */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">القسم *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-400 transition-all"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value} className="bg-slate-800">{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* السعر والكمية */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">السعر ($) *</label>
                  <input
                    type="number"
                    value={form.price || ''}
                    onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-400 transition-all"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">الكمية</label>
                  <input
                    type="number"
                    value={form.quantity || ''}
                    onChange={(e) => setForm({...form, quantity: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-400 transition-all"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* الخصم */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">الخصم (%)</label>
                <input
                  type="number"
                  value={form.discount || ''}
                  onChange={(e) => setForm({...form, discount: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-400 transition-all"
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>

              {/* الأبعاد */}
              <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
                <label className="block text-blue-300 text-sm font-medium mb-3 flex items-center gap-2">
                  📐 الأبعاد (اختياري)
                </label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-white/60 text-xs mb-1">العرض</label>
                    <input
                      type="number"
                      value={form.dimensions.width || ''}
                      onChange={(e) => setForm({...form, dimensions: {...form.dimensions, width: parseFloat(e.target.value) || 0}})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">الارتفاع</label>
                    <input
                      type="number"
                      value={form.dimensions.height || ''}
                      onChange={(e) => setForm({...form, dimensions: {...form.dimensions, height: parseFloat(e.target.value) || 0}})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">العمق</label>
                    <input
                      type="number"
                      value={form.dimensions.depth || ''}
                      onChange={(e) => setForm({...form, dimensions: {...form.dimensions, depth: parseFloat(e.target.value) || 0}})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <select
                  value={form.dimensions.unit}
                  onChange={(e) => setForm({...form, dimensions: {...form.dimensions, unit: e.target.value as 'cm' | 'inch'}})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="cm" className="bg-slate-800">سنتيمتر (cm)</option>
                  <option value="inch" className="bg-slate-800">إنش (inch)</option>
                </select>
              </div>

              {/* الوزن واللون والخامة */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">الوزن (كجم)</label>
                  <input
                    type="number"
                    value={form.weight || ''}
                    onChange={(e) => setForm({...form, weight: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-400"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">اللون</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({...form, color: e.target.value})}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-400"
                    placeholder="أبيض"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">الخامة</label>
                  <input
                    type="text"
                    value={form.material}
                    onChange={(e) => setForm({...form, material: e.target.value})}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-400"
                    placeholder="خشب"
                  />
                </div>
              </div>

              {/* الوصف مع التحكم بالمحاذاة */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-white/80 text-sm font-medium">الوصف</label>
                  <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setForm({...form, descriptionAlign: 'right'})}
                      className={`p-1.5 rounded transition-all ${form.descriptionAlign === 'right' ? 'bg-primary text-white' : 'text-white/50 hover:text-white'}`}
                      title="محاذاة لليمين"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({...form, descriptionAlign: 'center'})}
                      className={`p-1.5 rounded transition-all ${form.descriptionAlign === 'center' ? 'bg-primary text-white' : 'text-white/50 hover:text-white'}`}
                      title="محاذاة للوسط"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm2 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm-2 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm2 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({...form, descriptionAlign: 'left'})}
                      className={`p-1.5 rounded transition-all ${form.descriptionAlign === 'left' ? 'bg-primary text-white' : 'text-white/50 hover:text-white'}`}
                      title="محاذاة لليسار"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm-4 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-blue-400 resize-none h-28 transition-all"
                  placeholder="وصف تفصيلي للمنتج..."
                  style={{ textAlign: form.descriptionAlign }}
                  dir="auto"
                />
                <p className="text-white/40 text-xs mt-1">يدعم العربية والإنجليزية - اختر المحاذاة المناسبة</p>
              </div>

              {/* أبعاد قطع غرف النوم */}
              {form.category === 'bedroom' && (
                <div className="p-4 bg-purple-500/10 border border-purple-400/20 rounded-xl space-y-4">
                  <label className="block text-purple-300 text-sm font-medium flex items-center gap-2">
                    🛏️ أبعاد قطع غرفة النوم (اختياري)
                  </label>
                  
                  {/* السرير */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/70 text-sm mb-2 flex items-center gap-2">🛏️ السرير</p>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={form.bedroomPieces.bed.width || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, bed: {...form.bedroomPieces.bed, width: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="العرض"
                      />
                      <input
                        type="number"
                        value={form.bedroomPieces.bed.height || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, bed: {...form.bedroomPieces.bed, height: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="الارتفاع"
                      />
                      <input
                        type="number"
                        value={form.bedroomPieces.bed.depth || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, bed: {...form.bedroomPieces.bed, depth: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="العمق"
                      />
                    </div>
                  </div>

                  {/* الخزانة */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/70 text-sm mb-2 flex items-center gap-2">🚪 الخزانة</p>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={form.bedroomPieces.wardrobe.width || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, wardrobe: {...form.bedroomPieces.wardrobe, width: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="العرض"
                      />
                      <input
                        type="number"
                        value={form.bedroomPieces.wardrobe.height || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, wardrobe: {...form.bedroomPieces.wardrobe, height: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="الارتفاع"
                      />
                      <input
                        type="number"
                        value={form.bedroomPieces.wardrobe.depth || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, wardrobe: {...form.bedroomPieces.wardrobe, depth: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="العمق"
                      />
                    </div>
                  </div>

                  {/* الكومودينو */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/70 text-sm mb-2 flex items-center gap-2">🪑 الكومودينو</p>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={form.bedroomPieces.nightstand.width || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, nightstand: {...form.bedroomPieces.nightstand, width: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="العرض"
                      />
                      <input
                        type="number"
                        value={form.bedroomPieces.nightstand.height || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, nightstand: {...form.bedroomPieces.nightstand, height: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="الارتفاع"
                      />
                      <input
                        type="number"
                        value={form.bedroomPieces.nightstand.depth || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, nightstand: {...form.bedroomPieces.nightstand, depth: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="العمق"
                      />
                    </div>
                  </div>

                  {/* التسريحة */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/70 text-sm mb-2 flex items-center gap-2">💄 التسريحة</p>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={form.bedroomPieces.dresser.width || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, dresser: {...form.bedroomPieces.dresser, width: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="العرض"
                      />
                      <input
                        type="number"
                        value={form.bedroomPieces.dresser.height || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, dresser: {...form.bedroomPieces.dresser, height: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="الارتفاع"
                      />
                      <input
                        type="number"
                        value={form.bedroomPieces.dresser.depth || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, dresser: {...form.bedroomPieces.dresser, depth: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="العمق"
                      />
                    </div>
                  </div>

                  {/* الميز/المكتب */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/70 text-sm mb-2 flex items-center gap-2">📚 الميز/المكتب</p>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={form.bedroomPieces.desk.width || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, desk: {...form.bedroomPieces.desk, width: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="العرض"
                      />
                      <input
                        type="number"
                        value={form.bedroomPieces.desk.height || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, desk: {...form.bedroomPieces.desk, height: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="الارتفاع"
                      />
                      <input
                        type="number"
                        value={form.bedroomPieces.desk.depth || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, desk: {...form.bedroomPieces.desk, depth: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="العمق"
                      />
                    </div>
                  </div>

                  {/* المرآة */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/70 text-sm mb-2 flex items-center gap-2">🪞 المرآة</p>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={form.bedroomPieces.mirror.width || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, mirror: {...form.bedroomPieces.mirror, width: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="العرض"
                      />
                      <input
                        type="number"
                        value={form.bedroomPieces.mirror.height || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, mirror: {...form.bedroomPieces.mirror, height: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="الارتفاع"
                      />
                      <input
                        type="number"
                        value={form.bedroomPieces.mirror.depth || ''}
                        onChange={(e) => setForm({...form, bedroomPieces: {...form.bedroomPieces, mirror: {...form.bedroomPieces.mirror, depth: parseFloat(e.target.value) || 0}}})}
                        className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="العمق"
                      />
                    </div>
                  </div>

                  <p className="text-white/40 text-xs">جميع الأبعاد بالسنتيمتر (سم)</p>
                </div>
              )}

              {/* Sketchfab 3D Model */}
              <div className="p-4 bg-purple-500/10 border border-purple-400/20 rounded-xl">
                <label className="block text-purple-300 text-sm font-medium mb-3 flex items-center gap-2">
                  🎨 نموذج Sketchfab ثلاثي الأبعاد (اختياري)
                </label>
                <input
                  type="text"
                  value={form.sketchfabId}
                  onChange={(e) => setForm({...form, sketchfabId: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition-all"
                  placeholder="معرف النموذج من Sketchfab (مثال: abc123def456)"
                  dir="ltr"
                />
                <p className="text-white/50 text-xs mt-2">
                  💡 يمكنك الحصول على المعرف من رابط Sketchfab: sketchfab.com/3d-models/model-name-<span className="text-purple-300">abc123def456</span>
                </p>
                {form.sketchfabId && (
                  <div className="mt-3">
                    <a 
                      href={`https://sketchfab.com/3d-models/${form.sketchfabId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition-colors"
                    >
                      <span>👁️ معاينة النموذج على Sketchfab</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              {/* زر الإضافة/التحديث */}
              <button
                type="submit"
                disabled={isSubmitting || form.images.length === 0}
                className={`w-full py-4 bg-gradient-to-r ${editingProduct ? 'from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 shadow-amber-500/25' : 'from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 shadow-green-500/25'} text-white rounded-xl transition-all font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    جاري الحفظ...
                  </>
                ) : editingProduct ? (
                  <>✏️ تحديث المنتج</>
                ) : (
                  <>✅ إضافة المنتج</>
                )}
              </button>
              
              {form.images.length === 0 && (
                <p className="text-amber-400/80 text-xs text-center">⚠️ يرجى إضافة صورة واحدة على الأقل</p>
              )}
            </form>
          </div>

          {/* Image Upload Section */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">📸</span>
              الصور والوسائط
            </h2>
            
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                dragActive 
                  ? 'border-blue-400 bg-blue-500/20 scale-[1.02]' 
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all ${
                  dragActive ? 'bg-blue-500/30' : 'bg-white/10'
                }`}>
                  <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white/90 font-medium">اسحب الصور هنا أو انقر للاختيار</p>
                  <p className="text-white/50 text-sm mt-1">PNG, JPG, WEBP حتى 5MB لكل صورة</p>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && (
                <div className="absolute inset-0 bg-slate-900/80 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto relative">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" />
                        <circle 
                          cx="40" cy="40" r="36" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          fill="none" 
                          className="text-blue-400"
                          strokeDasharray={226}
                          strokeDashoffset={226 - (226 * uploadProgress / 100)}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-white font-bold">{uploadProgress}%</span>
                    </div>
                    <p className="text-white/70 mt-2">جاري الرفع...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded Images Grid */}
            {form.images.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white/80 text-sm font-medium">الصور المرفوعة</h3>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">{form.images.length} صورة</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <Image
                        src={img}
                        alt={`Product ${idx + 1}`}
                        fill
                        className={`object-cover rounded-xl border-2 transition-all ${
                          form.mainImageIndex === idx 
                            ? 'border-green-400 ring-2 ring-green-400/30' 
                            : 'border-white/10 group-hover:border-white/30'
                        }`}
                      />
                      {form.mainImageIndex === idx && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                          رئيسية
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setMainImage(idx); }}
                          className={`p-2.5 rounded-xl transition-all ${
                            form.mainImageIndex === idx
                              ? 'bg-green-500 text-white'
                              : 'bg-white/20 hover:bg-blue-500 text-white'
                          }`}
                          title="تعيين كصورة رئيسية"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                          className="p-2.5 bg-white/20 hover:bg-red-500 text-white rounded-xl transition-all"
                          title="حذف الصورة"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video & 3D Section */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Video Upload */}
                <div className="p-4 bg-purple-500/10 border border-purple-400/20 rounded-xl">
                  <h3 className="text-purple-300 text-sm font-medium mb-3 flex items-center gap-2">
                    🎬 فيديو المنتج
                    {form.videos.length > 0 && (
                      <span className="px-2 py-0.5 bg-purple-500/30 text-purple-200 text-xs rounded-full">{form.videos.length}</span>
                    )}
                  </h3>
                  <label className="block w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 text-sm text-center cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mov"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        // التحقق من حجم الملف (100MB)
                        if (file.size > 100 * 1024 * 1024) {
                          alert('حجم الفيديو أكبر من 100MB');
                          return;
                        }

                        // إظهار رسالة تحميل
                        const btn = e.target.parentElement;
                        if (btn) btn.innerHTML = '⏳ جاري رفع الفيديو...';

                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('folder', 'wonderland/products/videos');
                          formData.append('type', 'video');
                          
                          const res = await fetch('/api/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          
                          if (res.ok && data.secure_url) {
                            handleAddVideo(data.secure_url);
                            alert('✅ تم رفع الفيديو بنجاح!');
                          } else {
                            alert('❌ فشل رفع الفيديو: ' + (data.message || 'خطأ غير معروف'));
                          }
                        } catch (err) {
                          console.error('Video upload error:', err);
                          alert('❌ فشل رفع الفيديو');
                        }
                        
                        // إعادة الزر لحالته الأصلية
                        if (btn) btn.innerHTML = '📤 رفع فيديو';
                      }}
                    />
                    📤 رفع فيديو (MP4, WebM, MOV - حتى 100MB)
                  </label>
                  {form.videos.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {form.videos.map((v, i) => (
                        <div key={i} className="relative group">
                          <video src={v} controls className="w-full h-32 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, videos: prev.videos.filter((_, idx) => idx !== i) }))}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3D Upload */}
                <div className="p-4 bg-cyan-500/10 border border-cyan-400/20 rounded-xl">
                  {/* Toggle لتفعيل/إلغاء 3D */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-cyan-300 text-sm font-medium flex items-center gap-2">
                      🎮 هل يحتوي المنتج على ملف 3D؟
                    </h3>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, has3D: !prev.has3D, threeD: prev.has3D ? '' : prev.threeD }))}
                      className={`relative w-14 h-7 rounded-full transition-colors ${form.has3D ? 'bg-emerald-500' : 'bg-white/20'}`}
                    >
                      <span 
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${form.has3D ? 'right-1' : 'left-1'}`}
                      />
                    </button>
                  </div>
                  
                  {/* عرض قسم رفع 3D فقط عند التفعيل */}
                  {form.has3D && (
                    <>
                      {form.threeD && <span className="inline-block mb-3 px-2 py-0.5 bg-cyan-500/30 text-cyan-200 text-xs rounded-full">✓ تم رفع الملف</span>}
                      <label className="block w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 text-sm text-center cursor-pointer transition-all">
                        <input
                          type="file"
                          accept=".glb,.gltf,.obj,.fbx,.stl,.3ds,.dae"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                        // التحقق من حجم الملف (50MB)
                        if (file.size > 50 * 1024 * 1024) {
                          alert('حجم الملف أكبر من 50MB');
                          return;
                        }

                        // إظهار رسالة تحميل
                        const btn = e.target.parentElement;
                        if (btn) btn.innerHTML = '⏳ جاري رفع الملف 3D...';

                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('folder', 'wonderland/products/3d');
                          formData.append('type', '3d');
                          
                          const res = await fetch('/api/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          
                          if (res.ok && data.secure_url) {
                            handleAdd3D(data.secure_url);
                            alert('✅ تم رفع ملف 3D بنجاح!');
                          } else {
                            alert('❌ فشل رفع الملف: ' + (data.message || 'خطأ غير معروف'));
                          }
                        } catch (err) {
                          console.error('3D upload error:', err);
                          alert('❌ فشل رفع ملف 3D');
                        }
                        
                        // إعادة الزر لحالته الأصلية
                        if (btn) btn.innerHTML = '📤 رفع ملف 3D';
                      }}
                    />
                    📤 رفع ملف 3D (GLB, GLTF, OBJ, FBX - حتى 50MB)
                  </label>
                  {form.threeD ? (
                    <div className="mt-3 flex items-center justify-between bg-white/5 rounded-lg p-2">
                      <a href={form.threeD} target="_blank" rel="noreferrer" className="text-cyan-300 text-sm underline">
                        ✓ تم رفع ملف 3D - انقر للعرض
                      </a>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, threeD: '' }))}
                        className="p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <p className="mt-3 text-white/40 text-xs">ارفع ملف 3D لعرض المنتج بتقنية 3D</p>
                  )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">📦</span>
              المنتجات المضافة
            </h2>
            <span className="px-4 py-2 bg-white/10 text-white/70 rounded-xl text-sm">{products.length} منتج</span>
          </div>
          
          {products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 hover:bg-white/10 transition-all group">
                  <div className="relative h-48">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[(product.mainImageIndex ?? 0) as number] || product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/40">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* وسوم 3D والخصم */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                      {product.threeD && (
                        <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow flex items-center gap-1">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                          </svg>
                          3D
                        </span>
                      )}
                      {product.discount && product.discount > 0 && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow">
                          {product.discount}%-
                        </span>
                      )}
                    </div>
                    
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg">
                        +{product.images.length - 1} صور
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-white/50 text-sm mb-3 line-clamp-2">{product.description || 'بدون وصف'}</p>
                    <div className="flex justify-between items-center text-sm mb-4">
                      <span className="text-green-400 font-bold">${product.price}</span>
                      <span className="text-white/50">{product.quantity} قطعة</span>
                    </div>
                    {product.dimensions?.width && (
                      <div className="text-xs text-white/40 mb-3">
                        📐 {product.dimensions.width}×{product.dimensions.height}×{product.dimensions.depth} {product.dimensions.unit}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 py-2.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 rounded-xl transition font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl transition font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-white/50">لا توجد منتجات بعد</p>
              <p className="text-white/30 text-sm mt-1">ابدأ بإضافة منتجك الأول</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
