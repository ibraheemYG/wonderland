'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const Header = () => {
  const { toggleCart, cartItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

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

            {/* User Dropdown */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="hidden sm:flex items-center gap-2 p-2 text-foreground hover:text-primary transition-colors rounded-full hover:bg-secondary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    {/* Backdrop للإغلاق عند النقر خارج القائمة */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute left-0 mt-3 w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="p-5 bg-gradient-to-r from-primary/20 to-blue-600/20 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{user.name}</p>
                            <p className="text-xs text-white/60 truncate">{user.email || 'مستخدم'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <nav className="py-2">
                        {user.role === 'admin' && (
                          <>
                            <div className="px-4 py-2">
                              <p className="text-xs font-medium text-white/40 uppercase tracking-wider">لوحة الإدارة</p>
                            </div>
                            <Link 
                              href="/admin/dashboard" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all group"
                            >
                              <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">📊</span>
                              <span>لوحة التحكم</span>
                            </Link>
                            <Link 
                              href="/admin/users" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all group"
                            >
                              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">👥</span>
                              <span>المستخدمين</span>
                            </Link>
                            <Link 
                              href="/admin/products" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all group"
                            >
                              <span className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">📦</span>
                              <span>المنتجات</span>
                            </Link>
                            <Link 
                              href="/admin/surveys" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all group"
                            >
                              <span className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">📋</span>
                              <span>الاستبيانات</span>
                            </Link>
                            <Link 
                              href="/admin/admins" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all group"
                            >
                              <span className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">🔐</span>
                              <span>إدارة الأدمن</span>
                            </Link>
                            <div className="my-2 mx-4 border-t border-white/10"></div>
                          </>
                        )}
                        
                        <Link 
                          href="/survey" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all group"
                        >
                          <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">📝</span>
                          <span>الاستبيان</span>
                        </Link>
                        
                        <div className="my-2 mx-4 border-t border-white/10"></div>
                        
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group"
                        >
                          <span className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">🚪</span>
                          <span>تسجيل الخروج</span>
                        </button>
                      </nav>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden sm:block p-2 text-foreground hover:text-primary transition-colors rounded-full hover:bg-secondary" title="Login">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
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

            {/* Survey Button - Always Visible */}
            <Link href="/survey" className="hidden sm:block p-2 text-foreground hover:text-primary transition-colors rounded-full hover:bg-secondary" title="Survey">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </Link>

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
          <div className="md:hidden py-4 border-t border-secondary">
            {/* Mobile User Info Card */}
            {user && (
              <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-foreground/60 truncate">{user.email || 'مستخدم'}</p>
                    {user.role === 'admin' && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs rounded-full">
                        <span>👑</span> مدير
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex flex-col space-y-1 mb-4">
              <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors font-medium">
                <span className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">🏠</span>
                الرئيسية
              </a>
              <a href="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors font-medium">
                <span className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">🛍️</span>
                المتجر
              </a>
              <a href="/survey" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors font-medium">
                <span className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">📝</span>
                الاستبيان
              </a>
            </nav>

            {/* Admin Links (if admin) */}
            {user?.role === 'admin' && (
              <div className="mb-4 border-t border-secondary pt-4">
                <p className="px-3 text-xs font-medium text-foreground/40 uppercase tracking-wider mb-2">لوحة الإدارة</p>
                <nav className="flex flex-col space-y-1">
                  <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-foreground hover:text-primary hover:bg-purple-500/10 rounded-lg transition-colors text-sm">
                    <span className="w-7 h-7 bg-purple-500/20 rounded-lg flex items-center justify-center text-sm">📊</span>
                    لوحة التحكم
                  </Link>
                  <Link href="/admin/users" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-foreground hover:text-primary hover:bg-blue-500/10 rounded-lg transition-colors text-sm">
                    <span className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center text-sm">👥</span>
                    المستخدمين
                  </Link>
                  <Link href="/admin/products" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-foreground hover:text-primary hover:bg-amber-500/10 rounded-lg transition-colors text-sm">
                    <span className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center text-sm">📦</span>
                    المنتجات
                  </Link>
                  <Link href="/admin/surveys" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-foreground hover:text-primary hover:bg-green-500/10 rounded-lg transition-colors text-sm">
                    <span className="w-7 h-7 bg-green-500/20 rounded-lg flex items-center justify-center text-sm">📋</span>
                    الاستبيانات
                  </Link>
                  <Link href="/admin/admins" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-foreground hover:text-primary hover:bg-orange-500/10 rounded-lg transition-colors text-sm">
                    <span className="w-7 h-7 bg-orange-500/20 rounded-lg flex items-center justify-center text-sm">🔐</span>
                    إدارة الأدمن
                  </Link>
                </nav>
              </div>
            )}

            {/* Auth Actions */}
            <div className="border-t border-secondary pt-4">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-medium"
                >
                  <span>🚪</span>
                  تسجيل الخروج
                </button>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-4 py-3 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition text-center font-medium"
                >
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
