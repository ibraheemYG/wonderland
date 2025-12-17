import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-primary">Wonderland</h3>
            <p className="mt-2 text-sm">
              High-quality home goods and furniture for your modern lifestyle.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-primary transition-colors">Living Rooms</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Kitchens</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Bedrooms</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Bathrooms</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">About</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-primary transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Connect</h3>
            <div className="flex mt-4 space-x-4">
              {/* Social Icons */}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Wonderland. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
