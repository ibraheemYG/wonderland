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
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] items-center">
          <div className="space-y-6">
            <p className="uppercase tracking-[0.35em] text-xs text-white/70">wonderland</p>
            <h1 className="text-3xl md:text-5xl font-bold leading-snug">
              اختَر القسم المثالي لمنزلك المستوحى من الأسلوب الإسكندنافي
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-xl">
              نوفر لك مجموعات متكاملة من الأثاث والإكسسوارات بلمسات عصرية، لتصميم غرف متناسقة ومتوازنة تجمع بين الراحة والبساطة.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/15">
                شحن سريع لجميع المدن
              </span>
              <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/15">
                تصميمات قابلة للتخصيص
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
            {categories.map((category, index) => {
              const Icon = category.Icon;
              return (
                <Link
                  key={category.name}
                  href={`/products?category=${category.slug}`}
                  className="group block rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl px-4 py-5 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:bg-white/20"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white shadow-inner">
                    <Icon className="h-8 w-8" />
                  </div>
                  <p className="mt-4 font-semibold text-sm md:text-base">{category.name}</p>
                  <p className="text-xs text-white/70">{category.translation}</p>
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
