import React from 'react';
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
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-[-3rem] h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center">
          {/* النص المختصر */}
          <div className="lg:w-1/3 text-center lg:text-right space-y-3">
            <p className="uppercase tracking-[0.3em] text-[10px] text-white/70">wonderland</p>
            <h1 className="text-xl md:text-2xl font-bold leading-tight">
              اختَر القسم المثالي لمنزلك
            </h1>
            <p className="text-white/80 text-sm max-w-md mx-auto lg:mx-0">
              مجموعات متكاملة من الأثاث والإكسسوارات بلمسات عصرية
            </p>
          </div>

          {/* الأقسام المصغرة */}
          <div className="lg:w-2/3 grid grid-cols-4 sm:grid-cols-8 gap-2 md:gap-3">
            {categories.map((category, index) => {
              const Icon = category.Icon;
              return (
                <Link
                  key={category.name}
                  href={`/products?category=${category.slug}`}
                  className="group flex flex-col items-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl p-2 md:p-3 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/20"
                >
                  <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-white/15 text-white">
                    <Icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <p className="mt-1.5 font-medium text-[10px] md:text-xs leading-tight">{category.name}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
