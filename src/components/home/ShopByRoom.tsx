import React from 'react';
import Image from 'next/image';

const rooms = [
  {
    name: 'The Modern Kitchen',
    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800',
    link: '#',
  },
  {
    name: 'The Cozy Bedroom',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    link: '#',
  },
  {
    name: 'The Elegant Living Room',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    link: '#',
  },
];

const ShopByRoom = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-foreground mb-4">تسوّق حسب الغرفة</h2>
        <p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">
          استلهم أفكاراً من مساحات مصممة بعناية وابدأ في إنشاء غرفتك المثالية.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <a
              href={room.link}
              key={room.name}
              className="group relative block overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative h-72 md:h-80 w-full">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold text-white mb-2">{room.name}</h3>
                <p className="text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  تصفح المجموعة →
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByRoom;
