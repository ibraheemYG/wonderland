'use client';

import React, { useLayoutEffect, useRef } from 'react';
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
  const scope = useRef<HTMLDivElement>(null);

  // Animate tabs on mount / category change
  useLayoutEffect(() => {
    if (!scope.current) return;
    const items = Array.from(scope.current.querySelectorAll('a'));
    // Fade + slight upward motion
    items.forEach((el) => el.classList.add('will-change-transform'));
    import('gsap').then(({ gsap }) => {
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      );
      // Pulse active tab
      const active = items.find((el) => el.className.includes('bg-primary'));
      if (active) {
        gsap.fromTo(active, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: 'power3.out' });
      }
    });
  }, [selectedCategory]);

  return (
    <nav ref={scope} className="flex-grow overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-2.5">
        {options.map((option) => {
          const isActive =
            (option.slug && option.slug === selectedCategory) || (!option.slug && !selectedCategory);
          const href = option.slug ? `/products?category=${option.slug}` : '/products';
          return (
            <Link
              key={option.label}
              href={href}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${
                isActive
                  ? 'glass-button text-white shadow-lg shadow-primary/30 ring-2 ring-primary/20'
                  : 'glass-subtle text-foreground/70 border border-white/20 dark:border-white/10 hover:border-primary/50 hover:bg-primary/10 hover:text-primary'
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
