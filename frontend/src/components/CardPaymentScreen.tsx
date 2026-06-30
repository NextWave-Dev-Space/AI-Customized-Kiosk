'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { createOrder } from '@/api/orderService';
import './CardPaymentScreen.css';

interface Props {
  nextPage: string;
  backPage: string;
  userType: 'general' | 'elderly' | 'children';
}

const CardPaymentScreen = ({ nextPage, backPage, userType }: Props) => {
  const router = useRouter();
  const { selectedItems, dineOption, discountAmount, cancelAll } = useOrder();
  const [isCardRecognized, setIsCardRecognized] = useState(false);

  const handleCardInsert = async () => {
    setIsCardRecognized(true);
    try {
      await createOrder({
        userType,
        dineOption: dineOption === '매장' ? 'dine_in' : 'take_out',
        paymentMethod: 'card',
        items: selectedItems,
        discountAmount,
      });
    } catch (e) {
      console.error('주문 저장 실패:', e);
    }
    setTimeout(() => {
      cancelAll();
      router.push(nextPage);
    }, 5000);
  };

  return (
    <div className="card-payment-screen">
      <h1 className="card-payment-title">카드를 투입구에<br />꽂아주세요.</h1>
      <div className="cardpayment-card-slot-wrapper">
        <div className="cardpayment-card-slot"></div>
      </div>
      <div className="card-payment-controls">
        <button className="cardpayment-back-button" onClick={() => router.push(backPage)}>뒤로가기</button>
        <button className="cardpayment-card-insert-button" onClick={handleCardInsert}>카드투입</button>
      </div>
      {isCardRecognized && (
        <div className="cardpayment-card-popup dimmed">
          <div className="cardpayment-card-popup-content">
            <p className="cardpayment-card-popup-message">인식 완료!<br />카드를 제거해 주세요.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPaymentScreen;
