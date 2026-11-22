import type { Metadata } from 'next';
import {
  Cormorant_Garamond,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from 'next/font/google';
import { MotionConfig } from 'framer-motion';
import { StoreProvider } from '@/context/StoreContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { InquiryModal } from '@/components/catalog/InquiryModal';
import { AgeGateModal } from '@/components/layout/AgeGateModal';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'PremiumLeaf | Cigar Humidors, Cases, Cutters & Lounge Accessories',
  description:
    'Curated Spanish cedar humidors, precision V-cutters, leather travel cases, and climate cabinets shipped by air to Sweden, EU, and the United States.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-ivory text-espresso antialiased">
        <MotionConfig reducedMotion="user">
          <StoreProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <InquiryModal />
            <AgeGateModal />
          </StoreProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
