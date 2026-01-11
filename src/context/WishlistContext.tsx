'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: string[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // جلب المفضلة عند تسجيل الدخول
  useEffect(() => {
    if (user?.id) {
      fetchWishlist();
    } else {
      // تحميل من localStorage للزوار
      const saved = localStorage.getItem('wishlist');
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    }
  }, [user?.id]);

  const fetchWishlist = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/wishlist?userId=${user.id}`);
      const json = await res.json();
      if (json.success) {
        setWishlist(json.data.map((item: any) => item.productId));
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const addToWishlist = async (productId: string) => {
    if (user?.id) {
      // مستخدم مسجل
      setLoading(true);
      try {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, productId }),
        });
        const json = await res.json();
        if (json.success) {
          setWishlist(json.data.map((item: any) => item.productId));
        }
      } catch (error) {
        console.error('Failed to add to wishlist:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // زائر - حفظ في localStorage
      const newWishlist = [...wishlist, productId];
      setWishlist(newWishlist);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (user?.id) {
      setLoading(true);
      try {
        const res = await fetch(`/api/wishlist?userId=${user.id}&productId=${productId}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (json.success) {
          setWishlist(json.data.map((item: any) => item.productId));
        }
      } catch (error) {
        console.error('Failed to remove from wishlist:', error);
      } finally {
        setLoading(false);
      }
    } else {
      const newWishlist = wishlist.filter(id => id !== productId);
      setWishlist(newWishlist);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
