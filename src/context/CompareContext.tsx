'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface CompareContextType {
  compareList: string[];
  addToCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  maxItems: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<string[]>([]);

  // تحميل من localStorage
  useEffect(() => {
    const saved = localStorage.getItem('compareList');
    if (saved) {
      setCompareList(JSON.parse(saved));
    }
  }, []);

  // حفظ في localStorage
  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = useCallback((productId: string) => {
    setCompareList(prev => {
      if (prev.includes(productId)) return prev;
      if (prev.length >= MAX_COMPARE_ITEMS) {
        alert(`يمكنك مقارنة ${MAX_COMPARE_ITEMS} منتجات كحد أقصى`);
        return prev;
      }
      return [...prev, productId];
    });
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareList(prev => prev.filter(id => id !== productId));
  }, []);

  const isInCompare = useCallback((productId: string) => {
    return compareList.includes(productId);
  }, [compareList]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        maxItems: MAX_COMPARE_ITEMS,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
