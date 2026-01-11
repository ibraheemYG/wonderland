'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SideCart from '@/components/cart/SideCart';
import SurveySuggestion from '@/components/survey/SurveySuggestion';
import PageTransition from '@/components/animations/PageTransition';
import CompareBar from '@/components/common/CompareBar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <PageTransition>{children}</PageTransition>
      <Footer />
      <SideCart />
      <SurveySuggestion />
      <CompareBar />
    </>
  );
}
