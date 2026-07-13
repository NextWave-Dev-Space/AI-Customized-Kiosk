import { Suspense } from 'react';
import PaymentFailScreen from '@/components/PaymentFailScreen';

export default function PaymentFailPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailScreen />
    </Suspense>
  );
}
