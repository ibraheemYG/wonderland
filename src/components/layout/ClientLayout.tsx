'use client';

import React, { useEffect, useCallback } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SideCart from '@/components/cart/SideCart';
import SurveySuggestion from '@/components/survey/SurveySuggestion';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { trackPageView } = useAnalytics();
  const pathname = usePathname();

  const handlePageView = useCallback(() => {
    trackPageView(pathname);
  }, [pathname, trackPageView]);

  useEffect(() => {
    handlePageView();
  }, [handlePageView]);

  return (
    <>
      <Header />
      {children}
      <Footer />
      <SideCart />
      <SurveySuggestion />
    </>
  );
}
