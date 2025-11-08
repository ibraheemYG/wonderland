'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const Header = () => {
  const { toggleCart, cartItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-background/95 backdrop-blur-md sticky top-0 z-40 border-b border-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-3xl font-bold text-primary hover:text-primary/80 transition-colors">
              Wonderland
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:space-x-8">
            <a href="/" className="text-foreground hover:text-primary transition-colors font-medium">Home</a>
            <a href="/products" className="text-foreground hover:text-primary transition-colors font-medium">Shop</a>
            <a href="/survey" className="text-foreground hover:text-primary transition-colors font-medium">📋 استبانة</a>
            <a href="/upload" className="text-foreground hover:text-primary transition-colors font-medium">📤 رفع</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">Collections</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">About</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">Contact</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-foreground hover:text-primary transition-colors rounded-full hover:bg-secondary"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Search */}
            <button className="hidden sm:block p-2 text-foreground hover:text-primary transition-colors rounded-full hover:bg-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Account */}
            <button className="hidden sm:block p-2 text-foreground hover:text-primary transition-colors rounded-full hover:bg-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Auth */}
            {user ? (
              <>
                <span className="text-sm text-foreground/70 px-2">{user.name}</span>
                {user.role === 'admin' && (
                  <Link href="/admin" className="p-2 text-primary hover:text-primary/80 transition-colors" title="Admin Panel">
                    ⚙️
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition"
                >
                  خروج
                </button>
              </>
            ) : (
              <Link href="/login" className="px-3 py-1 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded transition">
                دخول
              </Link>
            )}

            {/* Cart */}
            <button 
              onClick={toggleCart} 
              className="relative p-2 text-foreground hover:text-primary transition-colors rounded-full hover:bg-secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary space-y-4">
            <nav className="flex flex-col space-y-4">
              <a href="/" className="text-foreground hover:text-primary transition-colors font-medium">Home</a>
              <a href="/products" className="text-foreground hover:text-primary transition-colors font-medium">Shop</a>
              <a href="/survey" className="text-foreground hover:text-primary transition-colors font-medium">📋 استبانة</a>
              <a href="/upload" className="text-foreground hover:text-primary transition-colors font-medium">📤 رفع</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">Collections</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">About</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">Contact</a>
            </nav>
            {/* Mobile Auth */}
            <div className="border-t border-secondary pt-4">
              {user ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-foreground/70">مرحباً، {user.name}</p>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="text-primary hover:text-primary/80 transition-colors text-sm">
                      ⚙️ لوحة التحكم
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <Link href="/login" className="block w-full px-3 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded transition text-center">
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
