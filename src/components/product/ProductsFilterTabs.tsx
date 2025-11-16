'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export type FilterOption = { label: string; slug?: string };

const defaultOptions: FilterOption[] = [
  { label: 'جميع المنتجات' },
  { label: 'غرف المعيشة', slug: 'living-room' },
  { label: 'غرف النوم', slug: 'bedroom' },
  { label: 'المطابخ', slug: 'kitchen' },
  { label: 'الحمامات', slug: 'bathroom' },
  { label: 'الديكور', slug: 'decor' },
  { label: 'المفروشات', slug: 'furnishings' },
  { label: 'الأجهزة', slug: 'appliances' },
  { label: 'عروض خاصة', slug: 'sale' },
];

export default function ProductsFilterTabs({ options = defaultOptions }: { options?: FilterOption[] }) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  return (
    <nav className="flex-grow overflow-x-auto pb-2">
      <div className="flex gap-3">
        {options.map((option) => {
          const isActive =
            (option.slug && option.slug === selectedCategory) || (!option.slug && !selectedCategory);
          const href = option.slug ? `/products?category=${option.slug}` : '/products';
          return (
            <Link
              key={option.label}
              href={href}
              className={`px-5 py-2 rounded-full border-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30'
                  : 'bg-background text-foreground border-primary/30 hover:border-primary/60 hover:bg-secondary'
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
