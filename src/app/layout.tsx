import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CompareProvider } from "@/context/CompareContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import ClientLayout from "@/components/layout/ClientLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Wonderland",
  description: "IKEA-Inspired E-commerce for Home Goods",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            <AnalyticsProvider>
              <NotificationProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <RecentlyViewedProvider>
                      <CartProvider>
                        <ClientLayout>{children}</ClientLayout>
                      </CartProvider>
                    </RecentlyViewedProvider>
                  </CompareProvider>
                </WishlistProvider>
              </NotificationProvider>
            </AnalyticsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
