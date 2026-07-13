'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PENDING_PAYMENT_KEY } from './CardPaymentScreen';
import './PaymentFailScreen.css';

const PaymentFailScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [backPage, setBackPage] = useState('/');

  useEffect(() => {
    const pendingRaw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
    sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    if (pendingRaw) {
      // 결제 실패 시 다시 카드결제 화면으로 돌아갈 수 있도록,
      // nextPage(결제완료 화면)와 짝지어진 카드결제 화면 경로를 유추한다.
      const { nextPage } = JSON.parse(pendingRaw);
      setBackPage(nextPage?.includes('elderly') ? '/elderly-card-payment' : '/card-payment');
    }
  }, []);

  const message = searchParams.get('message') ?? '결제가 취소되었거나 실패했습니다.';

  return (
    <div className="payment-fail-screen">
      <h1 className="payment-fail-title">결제에 실패했습니다</h1>
      <p className="payment-fail-message">{message}</p>
      <button className="payment-fail-retry-button" onClick={() => router.push(backPage)}>
        다시 시도하기
      </button>
    </div>
  );
};

export default PaymentFailScreen;
