'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import SofaIcon from '@/components/icons/SofaIcon';
import KitchenIcon from '@/components/icons/KitchenIcon';
import BedIcon from '@/components/icons/BedIcon';
import BathIcon from '@/components/icons/BathIcon';
import DecorIcon from '@/components/icons/DecorIcon';
import ApplianceIcon from '@/components/icons/ApplianceIcon';
import SaleIcon from '@/components/icons/SaleIcon';
import FurnishingsIcon from '@/components/icons/FurnishingsIcon';

const categories = [
  {
    name: 'غرف المعيشة',
    translation: 'Living Room',
    Icon: SofaIcon,
    slug: 'living-room',
  },
  {
    name: 'المطابخ',
    translation: 'Kitchen',
    Icon: KitchenIcon,
    slug: 'kitchen',
  },
  {
    name: 'غرف النوم',
    translation: 'Bedroom',
    Icon: BedIcon,
    slug: 'bedroom',
  },
  {
    name: 'الحمامات',
    translation: 'Bathroom',
    Icon: BathIcon,
    slug: 'bathroom',
  },
  {
    name: 'الديكور',
    translation: 'Decor & Styling',
    Icon: DecorIcon,
    slug: 'decor',
  },
  {
    name: 'المفروشات',
    translation: 'Furnishings',
    Icon: FurnishingsIcon,
    slug: 'furnishings',
  },
  {
    name: 'الأجهزة',
    translation: 'Smart Appliances',
    Icon: ApplianceIcon,
    slug: 'appliances',
  },
  {
    name: 'عروض خاصة',
    translation: 'Seasonal Sale',
    Icon: SaleIcon,
    slug: 'sale',
  },
];

const CategoryGrid = () => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 200;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-500 to-rose-500 text-white">
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-4rem] right-[-3rem] h-72 w-72 rounded-full bg-white/15 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-amber-300/10 blur-[120px]" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center">
          {/* النص المختصر */}
          <div className="lg:w-1/3 text-center lg:text-right space-y-4">
            <p className="uppercase tracking-[0.3em] text-xs text-white/70 font-medium">✨ wonderland</p>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              اختَر القسم المثالي لمنزلك
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-md mx-auto lg:mx-0 leading-relaxed">
              مجموعات متكاملة من الأثاث والإكسسوارات بلمسات عصرية
            </p>
          </div>

          {/* الأقسام - سلايدر على الموبايل */}
          <div className="lg:w-2/3 w-full relative">
            {/* أزرار التنقل للموبايل */}
            <button
              onClick={() => scroll('right')}
              className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-lg border border-white/20 hover:bg-white/30 transition-all"
              aria-label="السابق"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('left')}
              className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-lg border border-white/20 hover:bg-white/30 transition-all"
              aria-label="التالي"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* السلايدر على الموبايل - Grid على الشاشات الكبيرة */}
            <div
              ref={sliderRef}
              className="flex md:grid md:grid-cols-8 gap-3 md:gap-3 overflow-x-auto md:overflow-visible scrollbar-hide px-10 md:px-0 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((category, index) => {
                const Icon = category.Icon;
                return (
                  <Link
                    key={category.name}
                    href={`/products?category=${category.slug}`}
                    className="group flex-shrink-0 w-22 md:w-auto flex flex-col items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-3 md:p-4 text-center shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/25 hover:shadow-2xl hover:border-white/30 snap-center"
                  >
                    <div className="flex h-12 w-12 md:h-12 md:w-12 items-center justify-center rounded-xl bg-white/20 text-white shadow-lg group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                      <Icon className="h-6 w-6 md:h-6 md:w-6" />
                    </div>
                    <p className="mt-2 font-semibold text-[11px] md:text-xs leading-tight whitespace-nowrap">{category.name}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
