'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <Image src={active} alt={name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-square rounded-lg overflow-hidden border transition ${
                idx === activeIndex ? 'border-primary shadow-lg' : 'border-transparent hover:border-primary/40'
              }`}
              aria-label={`عرض الصورة ${idx + 1}`}
              type="button"
            >
              <Image src={src} alt={`${name} ${idx + 1}`} fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
