'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { baseProducts } from '@/data/products';
import Room3DViewer, { RoomElement } from '@/components/Room3DViewer';

function Try3DContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const product = productId ? baseProducts.find((p) => p.id === Number(productId)) : null;

  const [roomWidth, setRoomWidth] = useState(6);
  const [roomLength, setRoomLength] = useState(6);
  const [roomHeight, setRoomHeight] = useState(3);
  const [showViewer, setShowViewer] = useState(false);
  const [placedProducts, setPlacedProducts] = useState<
    Array<{
      id: string;
      type: 'product' | 'door' | 'window';
      name: string;
      position: { x: number; y: number; z: number };
      dimensions: { width: number; height: number; depth: number };
      color?: { r: number; g: number; b: number };
      category?: string;
    }>
  >([]);
  const [doorsCount, setDoorsCount] = useState(1);
  const [windowsCount, setWindowsCount] = useState(2);

  const handleAddProduct = () => {
    if (!product) return;

    let dimensions = { width: 1.5, height: 0.8, depth: 0.8 };
    if (product.category === 'living-room') {
      dimensions = { width: 2, height: 0.8, depth: 1 };
    } else if (product.category === 'bedroom') {
      dimensions = { width: 2, height: 0.5, depth: 2 };
    } else if (product.category === 'kitchen') {
      dimensions = { width: 2.5, height: 1, depth: 0.6 };
    }

    const newProduct: RoomElement = {
      id: `product-${placedProducts.length}`,
      type: 'product',
      name: product.name,
      position: { x: roomWidth / 2, y: 0, z: roomLength / 2 },
      dimensions,
      color: { r: 0.7, g: 0.6, b: 0.5 },
      category: product.category,
    };

    setPlacedProducts([...placedProducts, newProduct]);
  };

  const handleAddDoor = () => {
    const newDoor: RoomElement = {
      id: `door-${doorsCount}`,
      type: 'door',
      name: `الباب ${doorsCount}`,
      position: { x: roomWidth * 0.2, y: 0, z: 0 },
      dimensions: { width: 0.9, height: 2.1, depth: 0.1 },
    };
    setPlacedProducts([...placedProducts, newDoor]);
    setDoorsCount(doorsCount + 1);
  };

  const handleAddWindow = () => {
    const newWindow: RoomElement = {
      id: `window-${windowsCount}`,
      type: 'window',
      name: `النافذة ${windowsCount}`,
      position: { x: roomWidth * 0.5, y: 0.8, z: 0 },
      dimensions: { width: 1.2, height: 1, depth: 0.1 },
    };
    setPlacedProducts([...placedProducts, newWindow]);
    setWindowsCount(windowsCount + 1);
  };

  const handleRemoveProduct = (index: number) => {
    setPlacedProducts(placedProducts.filter((_, i) => i !== index));
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-6 text-sm text-foreground/70">
          <Link href="/">الرئيسية</Link>
          <span className="mx-2">/</span>
          <Link href="/products">المنتجات</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">تجربة 3D</span>
        </nav>

        <h1 className="text-3xl font-bold mb-2 text-white">جرّب المنتج في غرفتك</h1>
        <p className="text-white/80 mb-8">
          أدخل أبعاد غرفتك وشاهد كيف سيبدو المنتج في مساحتك
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-screen lg:min-h-auto">
          {/* لوحة التحكم */}
          <div className="lg:col-span-1 space-y-6 max-h-96 lg:max-h-screen overflow-y-auto">
            {/* أبعاد الغرفة */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 text-white">أبعاد الغرفة</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    العرض (متر)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    step="0.5"
                    value={roomWidth}
                    onChange={(e) => setRoomWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    الطول (متر)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    step="0.5"
                    value={roomLength}
                    onChange={(e) => setRoomLength(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    الارتفاع (متر)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="6"
                    step="0.5"
                    value={roomHeight}
                    onChange={(e) => setRoomHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-white"
                  />
                </div>
                <button
                  onClick={() => setShowViewer(true)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-4 rounded-lg transition-all"
                >
                  عرض الغرفة 3D
                </button>
              </div>
            </div>

            {/* المنتج الحالي */}
            {product && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-bold mb-4 text-white">المنتج المحدد</h2>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{product.name}</h3>
                    <p className="text-sm text-white/70">
                      {product.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAddProduct}
                  disabled={!showViewer}
                  className="w-full bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  {showViewer ? 'إضافة للغرفة' : 'اعرض الغرفة أولاً'}
                </button>
              </div>
            )}

            {/* إضافة الأبواب والنوافذ */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 text-white">الأبواب والنوافذ</h2>
              <div className="space-y-3">
                <button
                  onClick={handleAddDoor}
                  disabled={!showViewer}
                  className="w-full bg-amber-600 text-white hover:bg-amber-700 disabled:bg-gray-400 font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  + إضافة باب
                </button>
                <button
                  onClick={handleAddWindow}
                  disabled={!showViewer}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  + إضافة نافذة
                </button>
              </div>
            </div>

            {/* المنتجات المضافة */}
            {placedProducts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-bold mb-4 text-white">
                  المنتجات في الغرفة ({placedProducts.length})
                </h2>
                <div className="space-y-2">
                  {placedProducts.map((p, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded"
                    >
                      <span className="text-sm text-white">{p.name}</span>
                      <button
                        onClick={() => handleRemoveProduct(index)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* عارض 3D */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md w-full" style={{ height: 'clamp(300px, 70vh, 600px)' }}>
              {showViewer ? (
                <Room3DViewer
                  roomWidth={roomWidth}
                  roomLength={roomLength}
                  roomHeight={roomHeight}
                  elements={placedProducts}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-24 w-24 text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      لم تعرض الغرفة بعد
                    </h3>
                    <p className="text-white/70">
                      أدخل أبعاد الغرفة واضغط على "عرض الغرفة 3D"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Try3DPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">جاري التحميل...</div>}>
      <Try3DContent />
    </Suspense>
  );
}
