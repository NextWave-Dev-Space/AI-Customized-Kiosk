'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { useOrder } from '@/context/OrderContext';
import { createOrder } from '@/api/orderService';
import './CardPaymentScreen.css';

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? '';

// 결제 승인 완료 후 어느 화면으로 돌아갈지는 페이지 새로고침(토스 결제창 이동)을 거치며
// React 상태가 초기화되므로, sessionStorage에 잠시 저장해 payment-success 페이지에서 읽는다.
export const PENDING_PAYMENT_KEY = 'kiosk_pending_payment';

interface Props {
  nextPage: string;
  backPage: string;
  userType: 'general' | 'elderly' | 'children';
}

const CardPaymentScreen = ({ nextPage, backPage, userType }: Props) => {
  const router = useRouter();
  const { selectedItems, dineOption, discountAmount } = useOrder();
  const [isCardRecognized, setIsCardRecognized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCardInsert = async () => {
    if (selectedItems.length === 0) {
      alert('주문하신 메뉴가 없습니다.');
      return;
    }

    setErrorMessage(null);
    setIsCardRecognized(true);

    try {
      const order = await createOrder({
        userType,
        dineOption: dineOption === '매장' ? 'dine_in' : 'take_out',
        paymentMethod: 'card',
        items: selectedItems,
        discountAmount,
      });

      sessionStorage.setItem(
        PENDING_PAYMENT_KEY,
        JSON.stringify({ orderId: order.id, nextPage })
      );

      if (!TOSS_CLIENT_KEY) {
        throw new Error('결제 모듈 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.');
      }

      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      await tossPayments.requestPayment('카드', {
        amount: order.totalAmount,
        orderId: `order-${order.id}`,
        orderName:
          selectedItems.length > 1
            ? `${selectedItems[0].name} 외 ${selectedItems.length - 1}건`
            : selectedItems[0].name,
        successUrl: `${window.location.origin}/payment-success`,
        failUrl: `${window.location.origin}/payment-fail`,
      });
      // requestPayment가 성공하면 브라우저가 successUrl로 이동하므로 이 아래 코드는 실행되지 않음
    } catch (error) {
      console.error('결제 처리 실패:', error);
      setIsCardRecognized(false);
      setErrorMessage(
        error instanceof Error ? error.message : '결제 진행 중 오류가 발생했습니다.'
      );
    }
  };

  return (
    <div className="card-payment-screen">
      <h1 className="card-payment-title">카드를 투입구에<br />꽂아주세요.</h1>
      <div className="cardpayment-card-slot-wrapper">
        <div className="cardpayment-card-slot"></div>
      </div>
      {errorMessage && <p className="cardpayment-error-message">{errorMessage}</p>}
      <div className="card-payment-controls">
        <button className="cardpayment-back-button" onClick={() => router.push(backPage)}>뒤로가기</button>
        <button className="cardpayment-card-insert-button" onClick={handleCardInsert}>카드투입</button>
      </div>
      {isCardRecognized && (
        <div className="cardpayment-card-popup dimmed">
          <div className="cardpayment-card-popup-content">
            <p className="cardpayment-card-popup-message">인식 완료!<br />결제창으로 이동합니다.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPaymentScreen;
