'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface RecentProduct {
  id: string;
  viewedAt: number;
}

interface RecentlyViewedContextType {
  recentProducts: string[];
  addToRecent: (productId: string) => void;
  clearRecent: () => void;
  maxItems: number;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const MAX_RECENT_ITEMS = 10;

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recentProducts, setRecentProducts] = useState<string[]>([]);

  // تحميل من localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      const parsed: RecentProduct[] = JSON.parse(saved);
      // ترتيب حسب الأحدث
      const sorted = parsed.sort((a, b) => b.viewedAt - a.viewedAt);
      setRecentProducts(sorted.map(p => p.id));
    }
  }, []);

  const addToRecent = useCallback((productId: string) => {
    setRecentProducts(prev => {
      // إزالة المنتج إذا كان موجوداً
      const filtered = prev.filter(id => id !== productId);
      // إضافة في البداية
      const newList = [productId, ...filtered].slice(0, MAX_RECENT_ITEMS);
      
      // حفظ في localStorage مع الوقت
      const toSave = newList.map((id, index) => ({
        id,
        viewedAt: Date.now() - index, // للحفاظ على الترتيب
      }));
      localStorage.setItem('recentlyViewed', JSON.stringify(toSave));
      
      return newList;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentProducts([]);
    localStorage.removeItem('recentlyViewed');
  }, []);

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentProducts,
        addToRecent,
        clearRecent,
        maxItems: MAX_RECENT_ITEMS,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
}
