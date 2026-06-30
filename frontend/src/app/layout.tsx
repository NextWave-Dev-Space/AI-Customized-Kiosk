import type { Metadata } from 'next';
import { OrderProvider } from '@/context/OrderContext';
import './globals.css';

export const metadata: Metadata = {
  title: '딥러닝 맞춤형 키오스크',
  description: '딥러닝을 활용한 사용자 맞춤형 키오스크 프로그램',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <OrderProvider>{children}</OrderProvider>
      </body>
    </html>
  );
}
