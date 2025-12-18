'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatIQDFromUSD } from '@/utils/currency';

interface Product {
  _id: string;
  id?: string;
  name: string;
  nameAr?: string;
  price: number;
  images: string[];
  category: string;
  threeD?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
}

interface PlacedProduct {
  id: string;
  product: Product;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface RoomDimensions {
  width: number;
  height: number;
}

export default function RoomPlannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<PlacedProduct | null>(null);
  const [roomDimensions, setRoomDimensions] = useState<RoomDimensions>({ width: 5, height: 4 });
  const [showDimensionsModal, setShowDimensionsModal] = useState(true);
  const [draggedProduct, setDraggedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [addedFromUrl, setAddedFromUrl] = useState(false);

  // Check for product to add from URL
  useEffect(() => {
    const addProductId = searchParams.get('addProduct');
    const productName = searchParams.get('name');
    const productImage = searchParams.get('image');
    const threeD = searchParams.get('threeD');
    
    if (addProductId && productName && !addedFromUrl) {
      // إضافة المنتج من URL تلقائياً
      const urlProduct: Product = {
        _id: addProductId,
        id: addProductId,
        name: decodeURIComponent(productName),
        price: 0,
        images: productImage ? [decodeURIComponent(productImage)] : [],
        category: 'furniture',
        threeD: threeD ? decodeURIComponent(threeD) : undefined,
      };
      
      // إضافة المنتج في وسط الغرفة بعد إغلاق modal الأبعاد
      setTimeout(() => {
        const newPlaced: PlacedProduct = {
          id: `${addProductId}-${Date.now()}`,
          product: urlProduct,
          x: 50,
          y: 50,
          rotation: 0,
          scale: 1,
        };
        setPlacedProducts(prev => [...prev, newPlaced]);
        setSelectedProduct(newPlaced);
        setAddedFromUrl(true);
        
        // إظهار رسالة نجاح
        alert(`تم إضافة "${urlProduct.name}" إلى مخطط الغرفة! يمكنك سحبه لتغيير موقعه.`);
      }, 500);
    }
  }, [searchParams, addedFromUrl]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data.data || data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    { id: 'all', name: 'الكل', icon: '🏠' },
    { id: 'sofas', name: 'كنب', icon: '🛋️' },
    { id: 'beds', name: 'أسرّة', icon: '🛏️' },
    { id: 'tables', name: 'طاولات', icon: '🪑' },
    { id: 'storage', name: 'تخزين', icon: '🗄️' },
    { id: 'lighting', name: 'إضاءة', icon: '💡' },
    { id: 'decor', name: 'ديكور', icon: '🖼️' },
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category?.toLowerCase().includes(activeCategory));

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    setDraggedProduct(product);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedProduct || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPlaced: PlacedProduct = {
      id: `${draggedProduct._id}-${Date.now()}`,
      product: draggedProduct,
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
      rotation: 0,
      scale: 1,
    };

    setPlacedProducts([...placedProducts, newPlaced]);
    setSelectedProduct(newPlaced);
    setDraggedProduct(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const moveProduct = (id: string, deltaX: number, deltaY: number) => {
    setPlacedProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          x: Math.max(5, Math.min(95, p.x + deltaX)),
          y: Math.max(5, Math.min(95, p.y + deltaY)),
        };
      }
      return p;
    }));
  };

  const rotateProduct = (id: string, delta: number) => {
    setPlacedProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, rotation: (p.rotation + delta) % 360 };
      }
      return p;
    }));
  };

  const scaleProduct = (id: string, delta: number) => {
    setPlacedProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, scale: Math.max(0.5, Math.min(2, p.scale + delta)) };
      }
      return p;
    }));
  };

  const removeProduct = (id: string) => {
    setPlacedProducts(prev => prev.filter(p => p.id !== id));
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
    }
  };

  const calculateTotal = () => {
    return placedProducts.reduce((sum, p) => sum + p.product.price, 0);
  };

  // Dimensions Modal
  if (showDimensionsModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              مخطط الغرفة
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              صمم غرفتك بسهولة مثل المحترفين
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                عرض الغرفة (متر)
              </label>
              <input
                type="number"
                value={roomDimensions.width}
                onChange={(e) => setRoomDimensions({ ...roomDimensions, width: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                min={2}
                max={20}
                step={0.5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                طول الغرفة (متر)
              </label>
              <input
                type="number"
                value={roomDimensions.height}
                onChange={(e) => setRoomDimensions({ ...roomDimensions, height: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                min={2}
                max={20}
                step={0.5}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    المساحة: {(roomDimensions.width * roomDimensions.height).toFixed(1)} م²
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDimensionsModal(false)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              ابدأ التصميم ✨
            </button>
          </div>

          <button
            onClick={() => router.back()}
            className="w-full mt-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white">مخطط الغرفة</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {roomDimensions.width}م × {roomDimensions.height}م
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === '2d'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === '3d'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              3D
            </button>
          </div>

          <button
            onClick={() => setShowDimensionsModal(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="تعديل الأبعاد"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Products Sidebar */}
        <aside className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          {/* Categories */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="ml-1">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products List */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, product)}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-white dark:bg-gray-600 mb-2">
                      <img
                        src={product.images?.[0] || '/placeholder.jpg'}
                        alt={product.nameAr || product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        draggable={false}
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {product.nameAr || product.name}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                      {formatIQDFromUSD(product.price)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          {placedProducts.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {placedProducts.length} منتج
                </span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  {formatIQDFromUSD(calculateTotal())}
                </span>
              </div>
              <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all">
                أضف الكل للسلة 🛒
              </button>
            </div>
          )}
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 relative overflow-hidden">
          {/* Room Canvas */}
          <div
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="absolute inset-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-inner border-2 border-dashed border-gray-300 dark:border-gray-600"
            style={{
              backgroundImage: viewMode === '2d' 
                ? 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)'
                : 'none',
              backgroundSize: '20px 20px',
            }}
          >
            {/* Room Dimensions Labels */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12m-12 5h12" />
              </svg>
              {roomDimensions.width} متر
            </div>
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12m-12 5h12" />
              </svg>
              {roomDimensions.height} متر
            </div>

            {/* Placed Products */}
            {placedProducts.map((placed) => (
              <div
                key={placed.id}
                onClick={() => setSelectedProduct(placed)}
                className={`absolute cursor-move transition-all ${
                  selectedProduct?.id === placed.id
                    ? 'ring-4 ring-blue-500 ring-offset-2 z-10'
                    : 'hover:ring-2 hover:ring-blue-300'
                }`}
                style={{
                  left: `${placed.x}%`,
                  top: `${placed.y}%`,
                  transform: `translate(-50%, -50%) rotate(${placed.rotation}deg) scale(${placed.scale})`,
                }}
              >
                <div className="w-20 h-20 bg-white dark:bg-gray-600 rounded-xl shadow-lg overflow-hidden">
                  <img
                    src={placed.product.images?.[0] || '/placeholder.jpg'}
                    alt={placed.product.nameAr || placed.product.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
                {selectedProduct?.id === placed.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProduct(placed.id);
                    }}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {/* Empty State */}
            {placedProducts.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">اسحب المنتجات هنا</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">لبدء تصميم غرفتك</p>
                </div>
              </div>
            )}
          </div>

          {/* Selected Product Controls */}
          {selectedProduct && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 flex items-center gap-4 z-20">
              <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-600">
                <img
                  src={selectedProduct.product.images?.[0]}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedProduct.product.nameAr || selectedProduct.product.name}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {formatIQDFromUSD(selectedProduct.product.price)}
                  </p>
                </div>
              </div>

              {/* Move Controls */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => moveProduct(selectedProduct.id, 0, -2)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveProduct(selectedProduct.id, -2, 0)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveProduct(selectedProduct.id, 2, 0)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => moveProduct(selectedProduct.id, 0, 2)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Rotate */}
              <div className="flex items-center gap-1 px-3 border-x border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => rotateProduct(selectedProduct.id, -15)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="تدوير يسار"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                <span className="text-xs text-gray-500 w-10 text-center">{selectedProduct.rotation}°</span>
                <button
                  onClick={() => rotateProduct(selectedProduct.id, 15)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="تدوير يمين"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 transform scale-x-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              </div>

              {/* Scale */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scaleProduct(selectedProduct.id, -0.1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="تصغير"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                </button>
                <span className="text-xs text-gray-500 w-10 text-center">{(selectedProduct.scale * 100).toFixed(0)}%</span>
                <button
                  onClick={() => scaleProduct(selectedProduct.id, 0.1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="تكبير"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={() => removeProduct(selectedProduct.id)}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition-colors"
                title="حذف"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Instructions Toast */}
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 max-w-xs opacity-80 hover:opacity-100 transition-opacity z-10">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 <strong>نصيحة:</strong> اسحب المنتجات من القائمة وأفلتها في الغرفة. انقر على منتج للتحكم فيه.
        </p>
      </div>
    </div>
  );
}
