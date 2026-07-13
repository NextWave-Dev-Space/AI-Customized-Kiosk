import { Suspense } from 'react';
import PaymentSuccessScreen from '@/components/PaymentSuccessScreen';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessScreen />
    </Suspense>
  );
}
