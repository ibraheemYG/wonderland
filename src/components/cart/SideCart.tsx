'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatIQDFromUSD } from '@/utils/currency';

const SideCart = () => {
  const { isCartOpen, toggleCart, cartItems, removeFromCart, getCartTotal, updateQuantity } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = () => {
    toggleCart();
    if (!user) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-md z-50 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleCart}
      />
      
      {/* Side Cart */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md glass shadow-2xl z-50 transform transition-transform duration-300 border-l border-white/10 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">🛒 سلة التسوق</h2>
            <button 
              onClick={toggleCart}
              className="text-foreground/60 hover:text-primary transition-all p-2.5 hover:bg-white/10 rounded-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-28 h-28 glass-subtle rounded-3xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-foreground/60 text-lg mb-2">سلتك فارغة</p>
                <button 
                  onClick={toggleCart}
                  className="mt-4 text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  تصفح المنتجات ←
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 glass-subtle rounded-2xl">
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-white/50 dark:bg-white/5">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name} 
                        fill
                        sizes="80px"
                        className="rounded-xl object-cover" 
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-sm font-semibold text-foreground">{item.nameAr || item.name}</h3>
                      <p className="text-sm font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent mt-1">{formatIQDFromUSD(item.price * item.quantity)}</p>
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 rounded-xl glass-subtle text-foreground/70 flex items-center justify-center hover:bg-white/20 transition-all"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium text-foreground min-w-[24px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-xl glass-subtle text-foreground/70 flex items-center justify-center hover:bg-white/20 transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="text-red-500 hover:text-red-400 p-2.5 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-white/10 glass-subtle">
              <div className="flex justify-between items-center mb-2">
                <span className="text-foreground/60">المجموع الفرعي</span>
                <span className="text-foreground">{formatIQDFromUSD(getCartTotal())}</span>
              </div>
              <div className="flex justify-between items-center mb-5">
                <span className="text-lg font-semibold text-foreground">الإجمالي</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">{formatIQDFromUSD(getCartTotal())}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full glass-button text-white py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span>إتمام الطلب</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button 
                onClick={toggleCart}
                className="w-full mt-3 glass-subtle border border-primary/30 text-primary py-3 rounded-xl font-semibold hover:bg-primary/10 transition-all duration-300"
              >
                متابعة التسوق
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SideCart;
