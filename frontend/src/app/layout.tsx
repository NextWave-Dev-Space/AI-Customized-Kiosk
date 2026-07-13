import type { Metadata, Viewport } from 'next';
import { OrderProvider } from '@/context/OrderContext';
import KioskStage from '@/components/KioskStage';
import './globals.css';

export const metadata: Metadata = {
  title: '딥러닝 맞춤형 키오스크',
  description: '딥러닝을 활용한 사용자 맞춤형 키오스크 프로그램',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <OrderProvider>
          <KioskStage>{children}</KioskStage>
        </OrderProvider>
      </body>
    </html>
  );
}
