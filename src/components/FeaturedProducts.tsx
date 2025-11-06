import React from 'react';
import ProductCard from './ProductCard';

const products = [
    { id: 1, name: 'Modern Sofa', price: 799, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', rating: 4 },
    { id: 2, name: 'Kitchen Island', price: 1299, originalPrice: 1499, imageUrl: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800', rating: 5 },
    { id: 3, name: 'King Size Bed', price: 999, imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', rating: 4 },
    { id: 4, name: 'Bathroom Vanity', price: 499, imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800', rating: 3 },
];

const FeaturedProducts = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">New Arrivals</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Discover our latest collection of modern, functional furniture
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <a 
            href="/products"
            className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            View All Products
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
