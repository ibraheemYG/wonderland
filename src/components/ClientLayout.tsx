'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import SideCart from './SideCart';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <SideCart />
    </>
  );
}
