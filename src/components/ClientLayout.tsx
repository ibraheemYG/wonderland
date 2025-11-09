'use client';

import React, { useEffect, useCallback } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import SideCart from './SideCart';
import SurveySuggestion from './SurveySuggestion';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { trackPageView } = useAnalytics();
  const pathname = usePathname();

  const handlePageView = useCallback(() => {
    trackPageView(pathname);
  }, [pathname]);

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
