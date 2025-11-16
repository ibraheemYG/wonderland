'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Product {
  id: number | string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartContextType {
  cartItems: Product[];
  isCartOpen: boolean;
  addToCart: (product: Omit<Product, 'quantity' | 'id'> & { id: number | string }) => void;
  removeFromCart: (productId: number | string) => void;
  toggleCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Omit<Product, 'quantity' | 'id'> & { id: number | string }) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Ensure the product object being added has all the required properties of the cart's Product type
      const newProduct: Product = {
        ...product,
        quantity: 1,
      };
      return [...prevItems, newProduct];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number | string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, isCartOpen, addToCart, removeFromCart, toggleCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
