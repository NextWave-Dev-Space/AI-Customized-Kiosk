'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPayment } from '@/api/orderService';
import { PENDING_PAYMENT_KEY } from './CardPaymentScreen';
import './PaymentSuccessScreen.css';

const LAST_ORDER_ID_KEY = 'kiosk_last_order_id';

const PaymentSuccessScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return; // React 18 StrictMode 이중 호출 방지 (결제 승인은 1회만 호출되어야 함)
    hasRun.current = true;

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    const pendingRaw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
    const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
    const nextPage = pending?.nextPage ?? '/';

    if (!paymentKey || !orderId || !amount) {
      setErrorMessage('결제 정보가 올바르지 않습니다.');
      return;
    }

    confirmPayment({ paymentKey, orderId, amount: Number(amount) })
      .then((order) => {
        sessionStorage.setItem(LAST_ORDER_ID_KEY, String(order.id));
        sessionStorage.removeItem(PENDING_PAYMENT_KEY);
        router.replace(nextPage);
      })
      .catch((error) => {
        console.error('결제 승인 실패:', error);
        setErrorMessage(
          error?.response?.data?.error ?? '결제 승인 중 오류가 발생했습니다.'
        );
      });
  }, [router, searchParams]);

  return (
    <div className="payment-success-screen">
      {errorMessage ? (
        <>
          <h1 className="payment-success-error-title">결제 승인에 실패했습니다</h1>
          <p className="payment-success-error-message">{errorMessage}</p>
          <button className="payment-success-home-button" onClick={() => router.push('/')}>
            처음 화면으로
          </button>
        </>
      ) : (
        <h1 className="payment-success-loading-title">결제 승인 처리 중입니다...</h1>
      )}
    </div>
  );
};

export default PaymentSuccessScreen;
