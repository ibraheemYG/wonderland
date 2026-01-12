'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './NotificationBell';
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
    <header className="glass sticky top-0 z-40 border-b border-white/10 dark:border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-3xl font-bold bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              ✨ Wonderland
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:space-x-1 md:gap-1">
            <a href="/" className="px-4 py-2 rounded-xl text-foreground/80 hover:text-primary hover:bg-white/10 dark:hover:bg-white/5 transition-all font-medium">الرئيسية</a>
            <a href="/products" className="px-4 py-2 rounded-xl text-foreground/80 hover:text-primary hover:bg-white/10 dark:hover:bg-white/5 transition-all font-medium">المتجر</a>
            <a href="/survey" className="px-4 py-2 rounded-xl text-foreground/80 hover:text-primary hover:bg-white/10 dark:hover:bg-white/5 transition-all font-medium">الاستبيان</a>
            <a href="/try-3d" className="px-4 py-2 rounded-xl text-foreground/80 hover:text-primary hover:bg-white/10 dark:hover:bg-white/5 transition-all font-medium">معاينة 3D</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-foreground/70 hover:text-primary transition-all rounded-xl hover:bg-white/10 dark:hover:bg-white/5 hover:scale-105"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Cart - الأهم يكون ظاهر دائماً */}
            <button 
              onClick={toggleCart} 
              className="relative p-2.5 text-foreground/70 hover:text-primary transition-all rounded-xl hover:bg-white/10 dark:hover:bg-white/5 hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-primary to-amber-400 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Actions */}
            {user ? (
              <>
                {/* Notifications & Messages - مخفية على الموبايل */}
                <div className="hidden sm:flex items-center gap-1">
                  <NotificationBell />
                  <Link 
                    href={user.role === 'admin' ? '/admin/messages' : '/messages'}
                    className="p-2.5 text-foreground/70 hover:text-primary transition-all rounded-xl hover:bg-white/10 dark:hover:bg-white/5 hover:scale-105"
                    title="الرسائل"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </Link>
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1 p-1.5 text-foreground hover:text-primary transition-all rounded-xl hover:bg-white/10 dark:hover:bg-white/5"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary via-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/30">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>
                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    {/* Backdrop للإغلاق عند النقر خارج القائمة */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute left-0 mt-3 w-72 glass-card border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
                      {/* User Info Header */}
                      <div className="p-5 bg-gradient-to-r from-primary/20 via-amber-500/10 to-orange-500/20 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary via-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{user.name}</p>
                            <p className="text-xs text-foreground/60 truncate">{user.email || 'مستخدم'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <nav className="py-2">
                        {user.role === 'admin' && (
                          <>
                            <div className="px-4 py-2">
                              <p className="text-xs font-medium text-foreground/40 uppercase tracking-wider">لوحة الإدارة</p>
                            </div>
                            <Link 
                              href="/admin/dashboard" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground/80 hover:bg-white/10 dark:hover:bg-white/5 hover:text-primary transition-all group"
                            >
                              <span className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 group-hover:scale-110 transition-all">📊</span>
                              <span>لوحة التحكم</span>
                            </Link>
                            <Link 
                              href="/admin/users" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground/80 hover:bg-white/10 dark:hover:bg-white/5 hover:text-primary transition-all group"
                            >
                              <span className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 group-hover:scale-110 transition-all">👥</span>
                              <span>المستخدمين</span>
                            </Link>
                            <Link 
                              href="/admin/products" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground/80 hover:bg-white/10 dark:hover:bg-white/5 hover:text-primary transition-all group"
                            >
                              <span className="w-9 h-9 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500/30 group-hover:scale-110 transition-all">📦</span>
                              <span>المنتجات</span>
                            </Link>
                            <Link 
                              href="/admin/surveys" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground/80 hover:bg-white/10 dark:hover:bg-white/5 hover:text-primary transition-all group"
                            >
                              <span className="w-9 h-9 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 group-hover:scale-110 transition-all">📋</span>
                              <span>الاستبيانات</span>
                            </Link>
                            <Link 
                              href="/admin/admins" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground/80 hover:bg-white/10 dark:hover:bg-white/5 hover:text-primary transition-all group"
                            >
                              <span className="w-9 h-9 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/30 group-hover:scale-110 transition-all">🔐</span>
                              <span>إدارة الأدمن</span>
                            </Link>
                            <Link 
                              href="/admin/messages" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground/80 hover:bg-white/10 dark:hover:bg-white/5 hover:text-primary transition-all group"
                            >
                              <span className="w-9 h-9 bg-pink-500/20 rounded-xl flex items-center justify-center group-hover:bg-pink-500/30 group-hover:scale-110 transition-all">💬</span>
                              <span>الرسائل</span>
                            </Link>
                            <Link 
                              href="/admin/orders" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground/80 hover:bg-white/10 dark:hover:bg-white/5 hover:text-primary transition-all group"
                            >
                              <span className="w-9 h-9 bg-teal-500/20 rounded-xl flex items-center justify-center group-hover:bg-teal-500/30 group-hover:scale-110 transition-all">🛒</span>
                              <span>الطلبات</span>
                            </Link>
                            <div className="my-2 mx-4 border-t border-white/10"></div>
                          </>
                        )}
                        
                        <Link 
                          href="/orders" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-foreground/80 hover:bg-white/10 dark:hover:bg-white/5 hover:text-primary transition-all group"
                        >
                          <span className="w-9 h-9 bg-teal-500/20 rounded-xl flex items-center justify-center group-hover:bg-teal-500/30 group-hover:scale-110 transition-all">📦</span>
                          <span>طلباتي</span>
                        </Link>

                        <Link 
                          href="/survey" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-foreground/80 hover:bg-white/10 dark:hover:bg-white/5 hover:text-primary transition-all group"
                        >
                          <span className="w-9 h-9 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/30 group-hover:scale-110 transition-all">📝</span>
                          <span>الاستبيان</span>
                        </Link>
                        
                        <Link 
                          href="/messages" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-foreground/80 hover:bg-white/10 dark:hover:bg-white/5 hover:text-primary transition-all group"
                        >
                          <span className="w-9 h-9 bg-pink-500/20 rounded-xl flex items-center justify-center group-hover:bg-pink-500/30 group-hover:scale-110 transition-all">💬</span>
                          <span>رسائلي</span>
                        </Link>
                        
                        <div className="my-2 mx-4 border-t border-white/10"></div>
                        
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group"
                        >
                          <span className="w-9 h-9 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:bg-red-500/30 group-hover:scale-110 transition-all">🚪</span>
                          <span>تسجيل الخروج</span>
                        </button>
                      </nav>
                    </div>
                  </>
                )}
              </div>
              </>
            ) : (
              <Link href="/login" className="flex items-center gap-2 px-4 py-2 glass-button text-white text-sm font-medium rounded-xl hover:scale-105 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">دخول</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 text-foreground/70 hover:text-primary transition-all rounded-xl hover:bg-white/10 dark:hover:bg-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            {/* Mobile User Info Card */}
            {user && (
              <div className="mb-4 p-4 glass-card rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary via-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
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
              <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-foreground/80 hover:text-primary hover:bg-white/10 dark:hover:bg-white/5 rounded-xl transition-all font-medium">
                <span className="w-9 h-9 glass-subtle rounded-xl flex items-center justify-center">🏠</span>
                الرئيسية
              </a>
              <a href="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-foreground/80 hover:text-primary hover:bg-white/10 dark:hover:bg-white/5 rounded-xl transition-all font-medium">
                <span className="w-9 h-9 glass-subtle rounded-xl flex items-center justify-center">🛍️</span>
                المتجر
              </a>
              <a href="/survey" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-foreground/80 hover:text-primary hover:bg-white/10 dark:hover:bg-white/5 rounded-xl transition-all font-medium">
                <span className="w-9 h-9 glass-subtle rounded-xl flex items-center justify-center">📝</span>
                الاستبيان
              </a>
              {user && (
                <Link href="/messages" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-foreground/80 hover:text-primary hover:bg-white/10 dark:hover:bg-white/5 rounded-xl transition-all font-medium">
                  <span className="w-9 h-9 glass-subtle rounded-xl flex items-center justify-center">💬</span>
                  رسائلي
                </Link>
              )}
            </nav>

            {/* Admin Links (if admin) */}
            {user?.role === 'admin' && (
              <div className="mb-4 border-t border-white/10 pt-4">
                <p className="px-3 text-xs font-medium text-foreground/40 uppercase tracking-wider mb-2">لوحة الإدارة</p>
                <nav className="flex flex-col space-y-1">
                  <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-foreground/80 hover:text-primary hover:bg-purple-500/10 rounded-xl transition-all text-sm">
                    <span className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center text-sm">📊</span>
                    لوحة التحكم
                  </Link>
                  <Link href="/admin/users" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-foreground/80 hover:text-primary hover:bg-blue-500/10 rounded-xl transition-all text-sm">
                    <span className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center text-sm">👥</span>
                    المستخدمين
                  </Link>
                  <Link href="/admin/products" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-foreground/80 hover:text-primary hover:bg-amber-500/10 rounded-xl transition-all text-sm">
                    <span className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center text-sm">📦</span>
                    المنتجات
                  </Link>
                  <Link href="/admin/surveys" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-foreground/80 hover:text-primary hover:bg-green-500/10 rounded-xl transition-all text-sm">
                    <span className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center text-sm">📋</span>
                    الاستبيانات
                  </Link>
                  <Link href="/admin/admins" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-foreground/80 hover:text-primary hover:bg-orange-500/10 rounded-xl transition-all text-sm">
                    <span className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center text-sm">🔐</span>
                    إدارة الأدمن
                  </Link>
                  <Link href="/admin/messages" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-foreground/80 hover:text-primary hover:bg-pink-500/10 rounded-xl transition-all text-sm">
                    <span className="w-8 h-8 bg-pink-500/20 rounded-xl flex items-center justify-center text-sm">💬</span>
                    الرسائل
                  </Link>
                </nav>
              </div>
            )}

            {/* Auth Actions */}
            <div className="border-t border-white/10 pt-4">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-red-500/25"
                >
                  <span>🚪</span>
                  تسجيل الخروج
                </button>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-4 py-3 text-sm glass-button text-white rounded-xl transition-all text-center font-medium"
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
