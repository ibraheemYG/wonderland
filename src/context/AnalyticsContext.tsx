'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PageVisit {
  page: string;
  timestamp: number;
  duration: number;
}

interface VisitorSession {
  id: string;
  startTime: number;
  lastActive: number;
  pages: PageVisit[];
}

interface Analytics {
  totalVisitors: number;
  activeVisitors: number;
  pageViews: Record<string, number>;
  sessions: VisitorSession[];
}

interface AnalyticsContextType {
  analytics: Analytics;
  trackPageView: (page: string) => void;
  getPageVisits: (page: string) => number;
  getAverageSessionDuration: () => number;
  getMostVisitedPages: () => Array<{ page: string; visits: number }>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalVisitors: 0,
    activeVisitors: 0,
    pageViews: {},
    sessions: [],
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('wonderland_analytics');
    if (stored) {
      try {
        setAnalytics(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse stored analytics:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('wonderland_analytics', JSON.stringify(analytics));
    }
  }, [analytics, isInitialized]);

  const [currentSession, setCurrentSession] = useState<VisitorSession | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('');
  const [pageStartTime, setPageStartTime] = useState<number>(0);

  // Initialize session
  useEffect(() => {
    if (!isInitialized) return;

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSession: VisitorSession = {
      id: sessionId,
      startTime: Date.now(),
      lastActive: Date.now(),
      pages: [],
    };
    setCurrentSession(newSession);

    // Increment total visitors
    setAnalytics(prev => ({
      ...prev,
      totalVisitors: prev.totalVisitors + 1,
      activeVisitors: prev.activeVisitors + 1,
    }));

    // Clean up on unmount
    return () => {
      setAnalytics(prev => ({
        ...prev,
        activeVisitors: Math.max(0, prev.activeVisitors - 1),
      }));
    };
  }, [isInitialized]);

  // Track page view
  const trackPageView = (page: string) => {
    // Save duration of previous page
    if (currentPage && pageStartTime) {
      const duration = Date.now() - pageStartTime;
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          lastActive: Date.now(),
          pages: [
            ...currentSession.pages,
            { page: currentPage, timestamp: pageStartTime, duration },
          ],
        };
        setCurrentSession(updatedSession);
        
        setAnalytics(prev => {
          const sessions = prev.sessions.filter(s => s.id !== currentSession.id);
          return {
            ...prev,
            sessions: [...sessions, updatedSession],
          };
        });
      }
    }

    // Start tracking new page
    setCurrentPage(page);
    setPageStartTime(Date.now());

    // Increment page view count
    setAnalytics(prev => ({
      ...prev,
      pageViews: {
        ...prev.pageViews,
        [page]: (prev.pageViews[page] || 0) + 1,
      },
    }));
  };

  // Persist analytics to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('wonderland_analytics', JSON.stringify(analytics));
    }
  }, [analytics, isInitialized]);

  const getPageVisits = (page: string): number => {
    return analytics.pageViews[page] || 0;
  };

  const getAverageSessionDuration = (): number => {
    if (analytics.sessions.length === 0) return 0;
    const totalDuration = analytics.sessions.reduce((sum, session) => {
      const sessionDuration = session.pages.reduce((pageSum, page) => pageSum + page.duration, 0);
      return sum + sessionDuration;
    }, 0);
    return Math.round(totalDuration / analytics.sessions.length / 1000); // in seconds
  };

  const getMostVisitedPages = (): Array<{ page: string; visits: number }> => {
    return Object.entries(analytics.pageViews)
      .map(([page, visits]) => ({ page, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
  };

  return (
    <AnalyticsContext.Provider
      value={{
        analytics,
        trackPageView,
        getPageVisits,
        getAverageSessionDuration,
        getMostVisitedPages,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}
