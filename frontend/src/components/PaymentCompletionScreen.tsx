'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './PaymentCompletionScreen.css';

const PaymentCompletionScreen = () => {
  const [countdown, setCountdown] = useState(10);
  const [receiptPrinted, setReceiptPrinted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      router.push('/');
    }

    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <div className="general-payment-completion-screen">
      <h1>결제가<br />완료되었습니다!</h1>
      <div className="general-payment-completion-order-number">주문번호 : 001</div>
      <button
        className="general-payment-completion-receipt-button"
        onClick={() => setReceiptPrinted(true)}
      >
        {receiptPrinted ? '출력 완료' : '영수증 출력'}
      </button>
      <div className="general-payment-completion-countdown">
        {countdown}초 후 초기 화면으로 돌아갑니다.
      </div>
    </div>
  );
};

export default PaymentCompletionScreen;
